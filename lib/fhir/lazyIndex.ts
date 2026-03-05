import { createHash, randomUUID } from "node:crypto"
import {
  appendFile,
  mkdir,
  open,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises"
import * as path from "node:path"

type GenericFhirResource = {
  resourceType?: string
  id?: string
  [key: string]: unknown
}

export type LazyPatientGroup = {
  patient: GenericFhirResource | null
  resources: GenericFhirResource[]
  resourceCounts: Record<string, number>
}

type FileManifestEntry = {
  name: string
  size: number
  mtimeMs: number
}

type LazyIndexMeta = {
  snapshotId: string
  createdAt: string
  datasetDir: string
  manifestKey: string
  files: string[]
  orderedPatientIds: string[]
  stats: {
    filesRead: number
    resourcesRead: number
    parseErrors: number
    groupedByPatient: number
    unassigned: number
  }
}

type CurrentPointer = {
  version: string
  manifestKey: string
}

export type LazyFhirIndex = {
  version: string
  rootDir: string
  meta: LazyIndexMeta
}

export type LazyPageLoadResult = {
  patientsById: Record<string, LazyPatientGroup>
  returnedPatients: number
}

const DATASET_DEFAULT_DIR = path.resolve(
  process.cwd(),
  "sample-bulk-fhir-datasets-1000-patients",
)
const INDEX_ROOT_DIR = path.resolve(process.cwd(), ".cache", "fhir-index-v1")
const POINTER_BUFFER_FLUSH_SIZE = 250
const READ_CHUNK_SIZE = 1024 * 1024

let cachedIndex: LazyFhirIndex | null = null
let inFlightBuild: Promise<LazyFhirIndex> | null = null

function getIndexVersionDir(version: string): string {
  return path.join(INDEX_ROOT_DIR, "versions", version)
}

function getPointerFilePath(index: LazyFhirIndex, patientId: string): string {
  return path.join(index.rootDir, "patients", `${encodeURIComponent(patientId)}.idx`)
}

function getResourceLinePatientRef(line: string): string | null {
  const match = line.match(/"reference"\s*:\s*"Patient\/([^"?#/]+)/)
  return match?.[1] ?? null
}

function getResourceId(line: string): string | null {
  const match = line.match(/"id"\s*:\s*"([^"]+)"/)
  return match?.[1] ?? null
}

async function getDatasetManifest(datasetDir: string): Promise<FileManifestEntry[]> {
  const entries = await readdir(datasetDir, { withFileTypes: true })
  const ndjsonNames = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".ndjson"))
    .map((entry) => entry.name)
    .sort()

  const manifest: FileManifestEntry[] = []
  for (const name of ndjsonNames) {
    const fullPath = path.join(datasetDir, name)
    const fileStat = await stat(fullPath)

    manifest.push({
      name,
      size: fileStat.size,
      mtimeMs: fileStat.mtimeMs,
    })
  }

  return manifest
}

function getManifestKey(datasetDir: string, manifest: FileManifestEntry[]): string {
  const hash = createHash("sha256")
  hash.update(datasetDir)
  hash.update("\n")

  for (const entry of manifest) {
    hash.update(entry.name)
    hash.update("|")
    hash.update(String(entry.size))
    hash.update("|")
    hash.update(String(Math.trunc(entry.mtimeMs)))
    hash.update("\n")
  }

  return hash.digest("hex")
}

async function safeReadJson<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, "utf8")
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

async function readResourceSliceFromHandle(
  fileHandle: Awaited<ReturnType<typeof open>>,
  start: number,
  len: number,
): Promise<string> {
  const buffer = Buffer.allocUnsafe(len)
  const { bytesRead } = await fileHandle.read(buffer, 0, len, start)
  return buffer.subarray(0, bytesRead).toString("utf8").trim()
}

function parsePointerLine(line: string): {
  fileIndex: number
  start: number
  len: number
  type: string
} | null {

  const trimmed = line.trim()

  if (!trimmed) {
    return null
  }

  const parts = trimmed.split("\t")

  if (parts.length !== 4) {
    return null
  }

  const fileIndex = Number.parseInt(parts[0], 10)
  const start = Number.parseInt(parts[1], 10)
  const len = Number.parseInt(parts[2], 10)
  const type = parts[3]

  if (!Number.isFinite(fileIndex) || !Number.isFinite(start) || !Number.isFinite(len)) {
    return null
  }

  return {
    fileIndex,
    start,
    len,
    type,
  }
}

async function scanFileWithOffsets(
  filePath: string,
  onLine: (
    line: string,
    lineStartOffset: number,
    lineLenWithTerminator: number) => Promise<void>,
): Promise<void> {
  const handle = await open(filePath, "r")

  try {
    const readBuffer = Buffer.allocUnsafe(READ_CHUNK_SIZE)

    let absoluteReadOffset = 0
    let leftover = Buffer.alloc(0)
    let leftoverStartOffset = 0

    while (true) {
      const { bytesRead } = await handle.read(readBuffer, 0, readBuffer.length, null)
      if (bytesRead === 0) {
        break
      }

      const chunk = readBuffer.subarray(0, bytesRead)
      const chunkStart = absoluteReadOffset
      absoluteReadOffset += bytesRead

      const data = leftover.length > 0 ? Buffer.concat([leftover, chunk]) : chunk
      const dataStart = leftover.length > 0 ? leftoverStartOffset : chunkStart

      let lineStartIdx = 0

      while (true) {
        const newlineIdx = data.indexOf(0x0a, lineStartIdx)
        if (newlineIdx === -1) {
          break
        }

        const lineBuf = data.subarray(lineStartIdx, newlineIdx)
        let line = lineBuf.toString("utf8")
        if (line.endsWith("\r")) {
          line = line.slice(0, -1)
        }

        const lineStartOffset = dataStart + lineStartIdx
        const lineLenWithTerminator = newlineIdx - lineStartIdx + 1
        await onLine(line, lineStartOffset, lineLenWithTerminator)

        lineStartIdx = newlineIdx + 1
      }

      leftover = data.subarray(lineStartIdx)
      leftoverStartOffset = dataStart + lineStartIdx
    }

    if (leftover.length > 0) {
      let line = leftover.toString("utf8")
      if (line.endsWith("\r")) {
        line = line.slice(0, -1)
      }

      await onLine(line, leftoverStartOffset, leftover.length)
    }
  } finally {
    await handle.close()
  }
}

async function buildLazyIndex(datasetDir: string, manifest: FileManifestEntry[]): Promise<LazyFhirIndex> {
  const version = `${Date.now()}-${randomUUID()}`
  const versionTempDir = path.join(INDEX_ROOT_DIR, `tmp-${version}`)
  const versionFinalDir = getIndexVersionDir(version)
  const patientsDir = path.join(versionTempDir, "patients")

  await mkdir(INDEX_ROOT_DIR, { recursive: true })
  await rm(versionTempDir, { recursive: true, force: true })
  await rm(versionFinalDir, { recursive: true, force: true })
  await rm(path.join(INDEX_ROOT_DIR, "current.json.tmp"), { force: true })

  await mkdir(versionTempDir, { recursive: true })
  await mkdir(patientsDir, { recursive: true })

  const manifestKey = getManifestKey(datasetDir, manifest)
  const files = manifest.map((entry) => entry.name)

  const patientIds = new Set<string>()
  const pointerBuffers = new Map<string, string[]>()

  let resourcesRead = 0
  let parseErrors = 0
  let groupedByPatient = 0
  let unassigned = 0

  async function flushPatientBuffer(patientId: string): Promise<void> {
    const lines = pointerBuffers.get(patientId)
    if (!lines || lines.length === 0) {
      return
    }

    const filePath = path.join(patientsDir, `${encodeURIComponent(patientId)}.idx`)
    const payload = lines.join("")
    lines.length = 0
    await appendFile(filePath, payload, "utf8")
  }

  for (let fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
    const fileName = files[fileIndex]
    const filePath = path.join(datasetDir, fileName)
    const typeFromFile = fileName.split(".")[0] ?? "Unknown"
    const isPatientFile = typeFromFile === "Patient"

    await scanFileWithOffsets(filePath, async (line, lineStart, lineLen) => {
      const trimmed = line.trim()
      if (!trimmed) {
        return
      }

      resourcesRead += 1

      const patientId = isPatientFile ? getResourceId(trimmed) : getResourceLinePatientRef(trimmed)
      if (!patientId) {
        unassigned += 1
        return
      }

      patientIds.add(patientId)
      groupedByPatient += 1

      const pointerLine = `${fileIndex}\t${lineStart}\t${lineLen}\t${typeFromFile}\n`
      let buffer = pointerBuffers.get(patientId)
      if (!buffer) {
        buffer = []
        pointerBuffers.set(patientId, buffer)
      }

      buffer.push(pointerLine)
      if (buffer.length >= POINTER_BUFFER_FLUSH_SIZE) {
        await flushPatientBuffer(patientId)
      }
    })
  }

  for (const patientId of pointerBuffers.keys()) {
    await flushPatientBuffer(patientId)
  }

  const orderedPatientIds = Array.from(patientIds).sort()

  const meta: LazyIndexMeta = {
    snapshotId: randomUUID(),
    createdAt: new Date().toISOString(),
    datasetDir,
    manifestKey,
    files,
    orderedPatientIds,
    stats: {
      filesRead: files.length,
      resourcesRead,
      parseErrors,
      groupedByPatient,
      unassigned,
    },
  }

  await writeFile(path.join(versionTempDir, "meta.json"), JSON.stringify(meta), "utf8")
  await mkdir(path.dirname(versionFinalDir), { recursive: true })
  await rename(versionTempDir, versionFinalDir)

  const currentTempPath = path.join(INDEX_ROOT_DIR, "current.json.tmp")
  const currentPath = path.join(INDEX_ROOT_DIR, "current.json")
  const currentPointer: CurrentPointer = {
    version,
    manifestKey,
  }

  await writeFile(currentTempPath, JSON.stringify(currentPointer), "utf8")
  await rename(currentTempPath, currentPath)

  return {
    version,
    rootDir: versionFinalDir,
    meta,
  }
}

export async function getOrBuildLazyFhirIndex(
  datasetDir: string = DATASET_DEFAULT_DIR,
): Promise<{ index: LazyFhirIndex; cached: boolean }> {
  const manifest = await getDatasetManifest(datasetDir)
  const manifestKey = getManifestKey(datasetDir, manifest)

  if (cachedIndex && cachedIndex.meta.manifestKey === manifestKey) {
    return { index: cachedIndex, cached: true }
  }

  const currentPath = path.join(INDEX_ROOT_DIR, "current.json")
  const current = await safeReadJson<CurrentPointer>(currentPath)
  if (current && current.manifestKey === manifestKey) {
    const existingDir = getIndexVersionDir(current.version)
    const meta = await safeReadJson<LazyIndexMeta>(path.join(existingDir, "meta.json"))

    if (meta && meta.manifestKey === manifestKey) {
      const index: LazyFhirIndex = {
        version: current.version,
        rootDir: existingDir,
        meta,
      }
      cachedIndex = index
      return { index, cached: true }
    }
  }

  if (!inFlightBuild) {
    inFlightBuild = buildLazyIndex(datasetDir, manifest)
  }

  try {
    const built = await inFlightBuild
    cachedIndex = built
    return { index: built, cached: false }
  } finally {
    inFlightBuild = null
  }
}

export async function loadPatientPageFromLazyIndex(
  index: LazyFhirIndex,
  patientIds: string[],
): Promise<LazyPageLoadResult> {
  const patientsById: Record<string, LazyPatientGroup> = {}
  const openFiles = new Map<number, Awaited<ReturnType<typeof open>>>()

  try {
    for (const patientId of patientIds) {
      const pointerPath = getPointerFilePath(index, patientId)
      const rawPointers = await readFile(pointerPath, "utf8").catch(() => "")

      const group: LazyPatientGroup = {
        patient: null,
        resources: [],
        resourceCounts: {},
      }

      for (const line of rawPointers.split(/\r?\n/)) {
        const pointer = parsePointerLine(line)
        if (!pointer) {
          continue
        }

        const fileName = index.meta.files[pointer.fileIndex]
        if (!fileName) {
          continue
        }

        let fileHandle = openFiles.get(pointer.fileIndex)
        if (!fileHandle) {
          const filePath = path.join(index.meta.datasetDir, fileName)
          fileHandle = await open(filePath, "r")
          openFiles.set(pointer.fileIndex, fileHandle)
        }

        const rawResource = await readResourceSliceFromHandle(
          fileHandle,
          pointer.start,
          pointer.len,
        )
        if (!rawResource) {
          continue
        }

        let parsed: GenericFhirResource
        try {
          parsed = JSON.parse(rawResource) as GenericFhirResource
        } catch {
          continue
        }

        const type = parsed.resourceType ?? pointer.type
        group.resourceCounts[type] = (group.resourceCounts[type] ?? 0) + 1

        if (type === "Patient") {
          group.patient = parsed
        } else {
          group.resources.push(parsed)
        }
      }

      patientsById[patientId] = group
    }
  } finally {
    await Promise.all(Array.from(openFiles.values(), (file) => file.close()))
  }

  return {
    patientsById,
    returnedPatients: Object.keys(patientsById).length,
  }
}

export type { LazyIndexMeta }
