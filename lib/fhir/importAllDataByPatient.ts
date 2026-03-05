import { createReadStream } from "node:fs"
import { readdir } from "node:fs/promises"
import * as path from "node:path"
import { createInterface } from "node:readline"

type GenericFhirResource = {
  resourceType?: string
  id?: string
  [key: string]: unknown
}

export type PatientResourceGroup = {
  patient: GenericFhirResource | null
  resources: GenericFhirResource[]
  resourceCounts: Record<string, number>
}

export type ImportGroupedFhirResult = {
  patientsById: Map<string, PatientResourceGroup>
  unassignedResources: GenericFhirResource[]
  stats: {
    filesRead: number
    resourcesRead: number
    parseErrors: number
    groupedByPatient: number
    unassigned: number
  }
}

type ImportOptions = {
  datasetDir?: string
  includeResources?: boolean
  includeUnassignedResources?: boolean
}

const DEFAULT_DATASET_DIR = path.resolve(
  process.cwd(),
  "sample-bulk-fhir-datasets-1000-patients",
)

const PATIENT_REF_REGEX = /"reference"\s*:\s*"Patient\/([^"?#/]+)/
const RESOURCE_ID_REGEX = /"id"\s*:\s*"([^"]+)"/

function extractPatientIdFromReference(reference: string): string | null {
  const match = reference.match(/(?:^|\/)Patient\/([^/?#]+)/)
  return match?.[1] ?? null
}

function extractPatientIdFromLine(line: string): string | null {
  const match = line.match(PATIENT_REF_REGEX)
  return match?.[1] ?? null
}

function extractResourceIdFromLine(line: string): string | null {
  const match = line.match(RESOURCE_ID_REGEX)
  return match?.[1] ?? null
}

function readReferenceValue(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const maybeReference = (value as { reference?: unknown }).reference
  if (typeof maybeReference !== "string") {
    return null
  }

  return extractPatientIdFromReference(maybeReference)
}

function findPatientIdDeep(resource: GenericFhirResource): string | null {
  const queue: unknown[] = [resource]

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current || typeof current !== "object") {
      continue
    }

    if (Array.isArray(current)) {
      for (const value of current) {
        queue.push(value)
      }
      continue
    }

    const obj = current as Record<string, unknown>

    const referenceValue = obj.reference
    if (typeof referenceValue === "string") {
      const patientId = extractPatientIdFromReference(referenceValue)
      if (patientId) {
        return patientId
      }
    }

    for (const value of Object.values(obj)) {
      if (value && typeof value === "object") {
        queue.push(value)
      }
    }
  }

  return null
}

function findPatientIdInResource(resource: GenericFhirResource): string | null {
  const type = resource.resourceType

  if (resource.resourceType === "Patient" && resource.id) {
    return resource.id
  }

  const subjectId = readReferenceValue(resource.subject)
  if (subjectId) {
    return subjectId
  }

  const patientId = readReferenceValue(resource.patient)
  if (patientId) {
    return patientId
  }

  const fallbackSubject = (resource as { subject?: unknown }).subject
  if (Array.isArray(fallbackSubject)) {
    for (const subjectEntry of fallbackSubject) {
      const id = readReferenceValue(subjectEntry)
      if (id) {
        return id
      }
    }
  }

  if (
    type === "Location" ||
    type === "Organization" ||
    type === "Practitioner" ||
    type === "PractitionerRole"
  ) {
    return null
  }

  return findPatientIdDeep(resource)
}

function ensureGroup(
  patientsById: Map<string, PatientResourceGroup>,
  patientId: string,
): PatientResourceGroup {
  let group = patientsById.get(patientId)
  if (!group) {
    group = { patient: null, resources: [], resourceCounts: {} }
    patientsById.set(patientId, group)
  }

  return group
}

export async function importAllFhirDataGroupedByPatient(
  options: ImportOptions = {},
): Promise<ImportGroupedFhirResult> {
  const datasetDir = options.datasetDir ?? DEFAULT_DATASET_DIR
  const includeResources = options.includeResources ?? true
  const includeUnassignedResources = options.includeUnassignedResources ?? true

  const directoryEntries = await readdir(datasetDir, { withFileTypes: true })
  const ndjsonFiles = directoryEntries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".ndjson"))
    .map((entry) => entry.name)
    .sort()

  const patientsById = new Map<string, PatientResourceGroup>()
  const unassignedResources: GenericFhirResource[] = []

  let resourcesRead = 0
  let parseErrors = 0
  let groupedByPatient = 0

  for (const fileName of ndjsonFiles) {
    const fullPath = path.join(datasetDir, fileName)
    const stream = createReadStream(fullPath, { encoding: "utf8" })
    const reader = createInterface({
      input: stream,
      crlfDelay: Infinity,
    })

    const typeFromFile = fileName.split(".")[0] ?? "Unknown"
    const isPatientFile = typeFromFile === "Patient"

    for await (const rawLine of reader) {
      const line = rawLine.trim()
      if (!line) {
        continue
      }

      resourcesRead += 1

      if (!includeResources) {
        if (isPatientFile) {
          const patientId = extractResourceIdFromLine(line)
          if (!patientId) {
            parseErrors += 1
            continue
          }

          const group = ensureGroup(patientsById, patientId)
          group.resourceCounts.Patient = (group.resourceCounts.Patient ?? 0) + 1

          // Patient lines are few; parse these so summary mode still includes patient demographic fields.
          try {
            group.patient = JSON.parse(line) as GenericFhirResource
          } catch {
            parseErrors += 1
          }

          groupedByPatient += 1
          continue
        }

        const patientId = extractPatientIdFromLine(line)
        if (!patientId) {
          if (includeUnassignedResources) {
            try {
              unassignedResources.push(JSON.parse(line) as GenericFhirResource)
            } catch {
              parseErrors += 1
            }
          }
          continue
        }

        const group = ensureGroup(patientsById, patientId)
        group.resourceCounts[typeFromFile] = (group.resourceCounts[typeFromFile] ?? 0) + 1
        groupedByPatient += 1
        continue
      }

      let parsed: GenericFhirResource
      try {
        parsed = JSON.parse(line) as GenericFhirResource
      } catch {
        parseErrors += 1
        continue
      }

      const groupedPatientId = findPatientIdInResource(parsed)
      if (!groupedPatientId) {
        if (includeUnassignedResources) {
          unassignedResources.push(parsed)
        }
        continue
      }

      const group = ensureGroup(patientsById, groupedPatientId)
      const type = parsed.resourceType ?? typeFromFile ?? "Unknown"
      group.resourceCounts[type] = (group.resourceCounts[type] ?? 0) + 1

      if (type === "Patient") {
        group.patient = parsed
      } else {
        group.resources.push(parsed)
      }

      groupedByPatient += 1
    }
  }

  return {
    patientsById,
    unassignedResources,
    stats: {
      filesRead: ndjsonFiles.length,
      resourcesRead,
      parseErrors,
      groupedByPatient,
      unassigned: includeUnassignedResources ? unassignedResources.length : 0,
    },
  }
}
