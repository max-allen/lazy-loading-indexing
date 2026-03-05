module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/node:readline [external] (node:readline, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:readline", () => require("node:readline"));

module.exports = mod;
}),
"[project]/lib/fhir/importAllDataByPatient.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "importAllFhirDataGroupedByPatient",
    ()=>importAllFhirDataGroupedByPatient
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$readline__$5b$external$5d$__$28$node$3a$readline$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:readline [external] (node:readline, cjs)");
;
;
;
;
const DEFAULT_DATASET_DIR = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["resolve"](process.cwd(), "sample-bulk-fhir-datasets-1000-patients");
const PATIENT_REF_REGEX = /"reference"\s*:\s*"Patient\/([^"?#/]+)/;
const RESOURCE_ID_REGEX = /"id"\s*:\s*"([^"]+)"/;
function extractPatientIdFromReference(reference) {
    const match = reference.match(/(?:^|\/)Patient\/([^/?#]+)/);
    return match?.[1] ?? null;
}
function extractPatientIdFromLine(line) {
    const match = line.match(PATIENT_REF_REGEX);
    return match?.[1] ?? null;
}
function extractResourceIdFromLine(line) {
    const match = line.match(RESOURCE_ID_REGEX);
    return match?.[1] ?? null;
}
function readReferenceValue(value) {
    if (!value || typeof value !== "object") {
        return null;
    }
    const maybeReference = value.reference;
    if (typeof maybeReference !== "string") {
        return null;
    }
    return extractPatientIdFromReference(maybeReference);
}
function findPatientIdDeep(resource) {
    const queue = [
        resource
    ];
    while(queue.length > 0){
        const current = queue.shift();
        if (!current || typeof current !== "object") {
            continue;
        }
        if (Array.isArray(current)) {
            for (const value of current){
                queue.push(value);
            }
            continue;
        }
        const obj = current;
        const referenceValue = obj.reference;
        if (typeof referenceValue === "string") {
            const patientId = extractPatientIdFromReference(referenceValue);
            if (patientId) {
                return patientId;
            }
        }
        for (const value of Object.values(obj)){
            if (value && typeof value === "object") {
                queue.push(value);
            }
        }
    }
    return null;
}
function findPatientIdInResource(resource) {
    const type = resource.resourceType;
    if (resource.resourceType === "Patient" && resource.id) {
        return resource.id;
    }
    const subjectId = readReferenceValue(resource.subject);
    if (subjectId) {
        return subjectId;
    }
    const patientId = readReferenceValue(resource.patient);
    if (patientId) {
        return patientId;
    }
    const fallbackSubject = resource.subject;
    if (Array.isArray(fallbackSubject)) {
        for (const subjectEntry of fallbackSubject){
            const id = readReferenceValue(subjectEntry);
            if (id) {
                return id;
            }
        }
    }
    if (type === "Location" || type === "Organization" || type === "Practitioner" || type === "PractitionerRole") {
        return null;
    }
    return findPatientIdDeep(resource);
}
function ensureGroup(patientsById, patientId) {
    let group = patientsById.get(patientId);
    if (!group) {
        group = {
            patient: null,
            resources: [],
            resourceCounts: {}
        };
        patientsById.set(patientId, group);
    }
    return group;
}
async function importAllFhirDataGroupedByPatient(options = {}) {
    const datasetDir = options.datasetDir ?? DEFAULT_DATASET_DIR;
    const includeResources = options.includeResources ?? true;
    const includeUnassignedResources = options.includeUnassignedResources ?? true;
    const directoryEntries = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["readdir"])(datasetDir, {
        withFileTypes: true
    });
    const ndjsonFiles = directoryEntries.filter((entry)=>entry.isFile() && entry.name.endsWith(".ndjson")).map((entry)=>entry.name).sort();
    const patientsById = new Map();
    const unassignedResources = [];
    let resourcesRead = 0;
    let parseErrors = 0;
    let groupedByPatient = 0;
    for (const fileName of ndjsonFiles){
        const fullPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"](datasetDir, fileName);
        const stream = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["createReadStream"])(fullPath, {
            encoding: "utf8"
        });
        const reader = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$readline__$5b$external$5d$__$28$node$3a$readline$2c$__cjs$29$__["createInterface"])({
            input: stream,
            crlfDelay: Infinity
        });
        const typeFromFile = fileName.split(".")[0] ?? "Unknown";
        const isPatientFile = typeFromFile === "Patient";
        for await (const rawLine of reader){
            const line = rawLine.trim();
            if (!line) {
                continue;
            }
            resourcesRead += 1;
            if (!includeResources) {
                if (isPatientFile) {
                    const patientId = extractResourceIdFromLine(line);
                    if (!patientId) {
                        parseErrors += 1;
                        continue;
                    }
                    const group = ensureGroup(patientsById, patientId);
                    group.resourceCounts.Patient = (group.resourceCounts.Patient ?? 0) + 1;
                    // Patient lines are few; parse these so summary mode still includes patient demographic fields.
                    try {
                        group.patient = JSON.parse(line);
                    } catch  {
                        parseErrors += 1;
                    }
                    groupedByPatient += 1;
                    continue;
                }
                const patientId = extractPatientIdFromLine(line);
                if (!patientId) {
                    if (includeUnassignedResources) {
                        try {
                            unassignedResources.push(JSON.parse(line));
                        } catch  {
                            parseErrors += 1;
                        }
                    }
                    continue;
                }
                const group = ensureGroup(patientsById, patientId);
                group.resourceCounts[typeFromFile] = (group.resourceCounts[typeFromFile] ?? 0) + 1;
                groupedByPatient += 1;
                continue;
            }
            let parsed;
            try {
                parsed = JSON.parse(line);
            } catch  {
                parseErrors += 1;
                continue;
            }
            const groupedPatientId = findPatientIdInResource(parsed);
            if (!groupedPatientId) {
                if (includeUnassignedResources) {
                    unassignedResources.push(parsed);
                }
                continue;
            }
            const group = ensureGroup(patientsById, groupedPatientId);
            const type = parsed.resourceType ?? typeFromFile ?? "Unknown";
            group.resourceCounts[type] = (group.resourceCounts[type] ?? 0) + 1;
            if (type === "Patient") {
                group.patient = parsed;
            } else {
                group.resources.push(parsed);
            }
            groupedByPatient += 1;
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
            unassigned: includeUnassignedResources ? unassignedResources.length : 0
        }
    };
}
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/lib/fhir/lazyIndex.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getOrBuildLazyFhirIndex",
    ()=>getOrBuildLazyFhirIndex,
    "loadPatientPageFromLazyIndex",
    ()=>loadPatientPageFromLazyIndex
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
;
const DATASET_DEFAULT_DIR = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["resolve"](process.cwd(), "sample-bulk-fhir-datasets-1000-patients");
const INDEX_ROOT_DIR = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["resolve"](process.cwd(), ".cache", "fhir-index-v1");
const POINTER_BUFFER_FLUSH_SIZE = 250;
const READ_CHUNK_SIZE = 1024 * 1024;
let cachedIndex = null;
let inFlightBuild = null;
function getIndexVersionDir(version) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"](INDEX_ROOT_DIR, "versions", version);
}
function getPointerFilePath(index, patientId) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"](index.rootDir, "patients", `${encodeURIComponent(patientId)}.idx`);
}
function getResourceLinePatientRef(line) {
    const match = line.match(/"reference"\s*:\s*"Patient\/([^"?#/]+)/);
    return match?.[1] ?? null;
}
function getResourceId(line) {
    const match = line.match(/"id"\s*:\s*"([^"]+)"/);
    return match?.[1] ?? null;
}
async function getDatasetManifest(datasetDir) {
    const entries = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["readdir"])(datasetDir, {
        withFileTypes: true
    });
    const ndjsonNames = entries.filter((entry)=>entry.isFile() && entry.name.endsWith(".ndjson")).map((entry)=>entry.name).sort();
    const manifest = [];
    for (const name of ndjsonNames){
        const fullPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"](datasetDir, name);
        const fileStat = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["stat"])(fullPath);
        manifest.push({
            name,
            size: fileStat.size,
            mtimeMs: fileStat.mtimeMs
        });
    }
    return manifest;
}
function getManifestKey(datasetDir, manifest) {
    const hash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256");
    hash.update(datasetDir);
    hash.update("\n");
    for (const entry of manifest){
        hash.update(entry.name);
        hash.update("|");
        hash.update(String(entry.size));
        hash.update("|");
        hash.update(String(Math.trunc(entry.mtimeMs)));
        hash.update("\n");
    }
    return hash.digest("hex");
}
async function safeReadJson(filePath) {
    try {
        const raw = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["readFile"])(filePath, "utf8");
        return JSON.parse(raw);
    } catch  {
        return null;
    }
}
async function readResourceSliceFromHandle(fileHandle, start, len) {
    const buffer = Buffer.allocUnsafe(len);
    const { bytesRead } = await fileHandle.read(buffer, 0, len, start);
    return buffer.subarray(0, bytesRead).toString("utf8").trim();
}
function parsePointerLine(line) {
    const trimmed = line.trim();
    if (!trimmed) {
        return null;
    }
    const parts = trimmed.split("\t");
    if (parts.length !== 4) {
        return null;
    }
    const fileIndex = Number.parseInt(parts[0], 10);
    const start = Number.parseInt(parts[1], 10);
    const len = Number.parseInt(parts[2], 10);
    const type = parts[3];
    if (!Number.isFinite(fileIndex) || !Number.isFinite(start) || !Number.isFinite(len)) {
        return null;
    }
    return {
        fileIndex,
        start,
        len,
        type
    };
}
async function scanFileWithOffsets(filePath, onLine) {
    const handle = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["open"])(filePath, "r");
    try {
        const readBuffer = Buffer.allocUnsafe(READ_CHUNK_SIZE);
        let absoluteReadOffset = 0;
        let leftover = Buffer.alloc(0);
        let leftoverStartOffset = 0;
        while(true){
            const { bytesRead } = await handle.read(readBuffer, 0, readBuffer.length, null);
            if (bytesRead === 0) {
                break;
            }
            const chunk = readBuffer.subarray(0, bytesRead);
            const chunkStart = absoluteReadOffset;
            absoluteReadOffset += bytesRead;
            const data = leftover.length > 0 ? Buffer.concat([
                leftover,
                chunk
            ]) : chunk;
            const dataStart = leftover.length > 0 ? leftoverStartOffset : chunkStart;
            let lineStartIdx = 0;
            while(true){
                const newlineIdx = data.indexOf(0x0a, lineStartIdx);
                if (newlineIdx === -1) {
                    break;
                }
                const lineBuf = data.subarray(lineStartIdx, newlineIdx);
                let line = lineBuf.toString("utf8");
                if (line.endsWith("\r")) {
                    line = line.slice(0, -1);
                }
                const lineStartOffset = dataStart + lineStartIdx;
                const lineLenWithTerminator = newlineIdx - lineStartIdx + 1;
                await onLine(line, lineStartOffset, lineLenWithTerminator);
                lineStartIdx = newlineIdx + 1;
            }
            leftover = data.subarray(lineStartIdx);
            leftoverStartOffset = dataStart + lineStartIdx;
        }
        if (leftover.length > 0) {
            let line = leftover.toString("utf8");
            if (line.endsWith("\r")) {
                line = line.slice(0, -1);
            }
            await onLine(line, leftoverStartOffset, leftover.length);
        }
    } finally{
        await handle.close();
    }
}
async function buildLazyIndex(datasetDir, manifest) {
    const version = `${Date.now()}-${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])()}`;
    const versionTempDir = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"](INDEX_ROOT_DIR, `tmp-${version}`);
    const versionFinalDir = getIndexVersionDir(version);
    const patientsDir = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"](versionTempDir, "patients");
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["mkdir"])(INDEX_ROOT_DIR, {
        recursive: true
    });
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["rm"])(versionTempDir, {
        recursive: true,
        force: true
    });
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["rm"])(versionFinalDir, {
        recursive: true,
        force: true
    });
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["rm"])(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"](INDEX_ROOT_DIR, "current.json.tmp"), {
        force: true
    });
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["mkdir"])(versionTempDir, {
        recursive: true
    });
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["mkdir"])(patientsDir, {
        recursive: true
    });
    const manifestKey = getManifestKey(datasetDir, manifest);
    const files = manifest.map((entry)=>entry.name);
    const patientIds = new Set();
    const pointerBuffers = new Map();
    let resourcesRead = 0;
    let parseErrors = 0;
    let groupedByPatient = 0;
    let unassigned = 0;
    async function flushPatientBuffer(patientId) {
        const lines = pointerBuffers.get(patientId);
        if (!lines || lines.length === 0) {
            return;
        }
        const filePath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"](patientsDir, `${encodeURIComponent(patientId)}.idx`);
        const payload = lines.join("");
        lines.length = 0;
        await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["appendFile"])(filePath, payload, "utf8");
    }
    for(let fileIndex = 0; fileIndex < files.length; fileIndex += 1){
        const fileName = files[fileIndex];
        const filePath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"](datasetDir, fileName);
        const typeFromFile = fileName.split(".")[0] ?? "Unknown";
        const isPatientFile = typeFromFile === "Patient";
        await scanFileWithOffsets(filePath, async (line, lineStart, lineLen)=>{
            const trimmed = line.trim();
            if (!trimmed) {
                return;
            }
            resourcesRead += 1;
            const patientId = isPatientFile ? getResourceId(trimmed) : getResourceLinePatientRef(trimmed);
            if (!patientId) {
                unassigned += 1;
                return;
            }
            patientIds.add(patientId);
            groupedByPatient += 1;
            const pointerLine = `${fileIndex}\t${lineStart}\t${lineLen}\t${typeFromFile}\n`;
            let buffer = pointerBuffers.get(patientId);
            if (!buffer) {
                buffer = [];
                pointerBuffers.set(patientId, buffer);
            }
            buffer.push(pointerLine);
            if (buffer.length >= POINTER_BUFFER_FLUSH_SIZE) {
                await flushPatientBuffer(patientId);
            }
        });
    }
    for (const patientId of pointerBuffers.keys()){
        await flushPatientBuffer(patientId);
    }
    const orderedPatientIds = Array.from(patientIds).sort();
    const meta = {
        snapshotId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
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
            unassigned
        }
    };
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["writeFile"])(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"](versionTempDir, "meta.json"), JSON.stringify(meta), "utf8");
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["mkdir"])(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["dirname"](versionFinalDir), {
        recursive: true
    });
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["rename"])(versionTempDir, versionFinalDir);
    const currentTempPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"](INDEX_ROOT_DIR, "current.json.tmp");
    const currentPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"](INDEX_ROOT_DIR, "current.json");
    const currentPointer = {
        version,
        manifestKey
    };
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["writeFile"])(currentTempPath, JSON.stringify(currentPointer), "utf8");
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["rename"])(currentTempPath, currentPath);
    return {
        version,
        rootDir: versionFinalDir,
        meta
    };
}
async function getOrBuildLazyFhirIndex(datasetDir = DATASET_DEFAULT_DIR) {
    const manifest = await getDatasetManifest(datasetDir);
    const manifestKey = getManifestKey(datasetDir, manifest);
    if (cachedIndex && cachedIndex.meta.manifestKey === manifestKey) {
        return {
            index: cachedIndex,
            cached: true
        };
    }
    const currentPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"](INDEX_ROOT_DIR, "current.json");
    const current = await safeReadJson(currentPath);
    if (current && current.manifestKey === manifestKey) {
        const existingDir = getIndexVersionDir(current.version);
        const meta = await safeReadJson(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"](existingDir, "meta.json"));
        if (meta && meta.manifestKey === manifestKey) {
            const index = {
                version: current.version,
                rootDir: existingDir,
                meta
            };
            cachedIndex = index;
            return {
                index,
                cached: true
            };
        }
    }
    if (!inFlightBuild) {
        inFlightBuild = buildLazyIndex(datasetDir, manifest);
    }
    try {
        const built = await inFlightBuild;
        cachedIndex = built;
        return {
            index: built,
            cached: false
        };
    } finally{
        inFlightBuild = null;
    }
}
async function loadPatientPageFromLazyIndex(index, patientIds) {
    const patientsById = {};
    const openFiles = new Map();
    try {
        for (const patientId of patientIds){
            const pointerPath = getPointerFilePath(index, patientId);
            const rawPointers = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["readFile"])(pointerPath, "utf8").catch(()=>"");
            const group = {
                patient: null,
                resources: [],
                resourceCounts: {}
            };
            for (const line of rawPointers.split(/\r?\n/)){
                const pointer = parsePointerLine(line);
                if (!pointer) {
                    continue;
                }
                const fileName = index.meta.files[pointer.fileIndex];
                if (!fileName) {
                    continue;
                }
                let fileHandle = openFiles.get(pointer.fileIndex);
                if (!fileHandle) {
                    const filePath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"](index.meta.datasetDir, fileName);
                    fileHandle = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["open"])(filePath, "r");
                    openFiles.set(pointer.fileIndex, fileHandle);
                }
                const rawResource = await readResourceSliceFromHandle(fileHandle, pointer.start, pointer.len);
                if (!rawResource) {
                    continue;
                }
                let parsed;
                try {
                    parsed = JSON.parse(rawResource);
                } catch  {
                    continue;
                }
                const type = parsed.resourceType ?? pointer.type;
                group.resourceCounts[type] = (group.resourceCounts[type] ?? 0) + 1;
                if (type === "Patient") {
                    group.patient = parsed;
                } else {
                    group.resources.push(parsed);
                }
            }
            patientsById[patientId] = group;
        }
    } finally{
        await Promise.all(Array.from(openFiles.values(), (file)=>file.close()));
    }
    return {
        patientsById,
        returnedPatients: Object.keys(patientsById).length
    };
}
}),
"[project]/app/api/data/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fhir$2f$importAllDataByPatient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/fhir/importAllDataByPatient.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fhir$2f$lazyIndex$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/fhir/lazyIndex.ts [app-route] (ecmascript)");
;
;
;
const runtime = "nodejs";
const CACHE_TTL_MS = 5 * 60 * 1000;
const FULL_MODE_DEFAULT_LIMIT = 25;
const FULL_MODE_MAX_LIMIT = 200;
const summaryCache = new Map();
function mapSummarySliceByIds(map, orderedPatientIds, startIndex, limit) {
    const result = {};
    const endExclusive = Math.min(orderedPatientIds.length, startIndex + limit);
    for(let idx = startIndex; idx < endExclusive; idx += 1){
        const patientId = orderedPatientIds[idx];
        const group = map.get(patientId);
        if (group) {
            result[patientId] = group;
        }
    }
    return result;
}
function encodeCursor(payload) {
    return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}
function decodeCursor(cursor) {
    try {
        const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
        if (typeof parsed.s !== "string" || !parsed.s || typeof parsed.i !== "number" || !Number.isInteger(parsed.i) || parsed.i < -1) {
            return null;
        }
        return {
            s: parsed.s,
            i: parsed.i
        };
    } catch  {
        return null;
    }
}
const getSummaryCacheKey = (includeUnassignedResources)=>`summary:unassigned:${includeUnassignedResources ? "1" : "0"}`;
async function getOrBuildSummarySnapshot(includeUnassignedResources) {
    const cacheKey = getSummaryCacheKey(includeUnassignedResources);
    const existing = summaryCache.get(cacheKey);
    const now = Date.now();
    if (existing && now - existing.createdAt < CACHE_TTL_MS) {
        existing.createdAt = now;
        return {
            entry: existing,
            cached: true
        };
    }
    const aggregated = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fhir$2f$importAllDataByPatient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["importAllFhirDataGroupedByPatient"])({
        includeResources: false,
        includeUnassignedResources
    });
    const entry = {
        createdAt: now,
        snapshotId: `summary-${now}`,
        aggregated,
        orderedPatientIds: Array.from(aggregated.patientsById.keys()).sort()
    };
    summaryCache.set(cacheKey, entry);
    return {
        entry,
        cached: false
    };
}
const parseBooleanQueryParam = (value, defaultValue = false)=>{
    if (value == null) return defaultValue;
    return value.toLowerCase() === "true";
};
const parseIntQueryParam = (value, defaultValue)=>{
    if (value == null) return defaultValue;
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed < 0) return defaultValue;
    return parsed;
};
async function GET(request) {
    const requestStartedAt = Date.now();
    try {
        const includeResources = parseBooleanQueryParam(request.nextUrl.searchParams.get("includeResources"));
        const includeUnassignedResources = parseBooleanQueryParam(request.nextUrl.searchParams.get("includeUnassigned"));
        const requestedLimit = parseIntQueryParam(request.nextUrl.searchParams.get("limit"), includeResources ? FULL_MODE_DEFAULT_LIMIT : Number.MAX_SAFE_INTEGER);
        const limit = includeResources ? Math.max(1, Math.min(requestedLimit, FULL_MODE_MAX_LIMIT)) : Math.max(1, requestedLimit);
        const cursorParam = request.nextUrl.searchParams.get("cursor");
        const offsetParam = parseIntQueryParam(request.nextUrl.searchParams.get("offset"), 0);
        if (includeResources) {
            const indexStartedAt = Date.now();
            const { index, cached } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fhir$2f$lazyIndex$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOrBuildLazyFhirIndex"])();
            const indexCompletedAt = Date.now();
            let startIndex = offsetParam;
            let cursor = null;
            if (cursorParam) {
                const decoded = decodeCursor(cursorParam);
                if (!decoded) {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        error: "Invalid cursor"
                    }, {
                        status: 400
                    });
                }
                if (decoded.s !== index.meta.snapshotId) {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        error: "Cursor expired or does not match current snapshot",
                        snapshotId: index.meta.snapshotId
                    }, {
                        status: 410
                    });
                }
                startIndex = decoded.i + 1;
                cursor = cursorParam;
            }
            if (startIndex > index.meta.orderedPatientIds.length) {
                startIndex = index.meta.orderedPatientIds.length;
            }
            const totalPatients = index.meta.orderedPatientIds.length;
            const pagePatientIds = index.meta.orderedPatientIds.slice(startIndex, startIndex + limit);
            const pageStartedAt = Date.now();
            const pageResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fhir$2f$lazyIndex$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadPatientPageFromLazyIndex"])(index, pagePatientIds);
            const pageCompletedAt = Date.now();
            const returnedPatients = pageResult.returnedPatients;
            const lastIndex = returnedPatients > 0 ? startIndex + returnedPatients - 1 : startIndex - 1;
            const hasMore = lastIndex + 1 < totalPatients;
            const nextCursor = hasMore ? encodeCursor({
                s: index.meta.snapshotId,
                i: lastIndex
            }) : null;
            const timingMs = {
                indexLookupOrBuild: indexCompletedAt - indexStartedAt,
                pageLoad: pageCompletedAt - pageStartedAt,
                total: pageCompletedAt - requestStartedAt
            };
            console.info("[api/data] mode=full-lazy cached=%s patients=%d returned=%d totalMs=%d indexMs=%d pageMs=%d", cached ? "true" : "false", totalPatients, returnedPatients, timingMs.total, timingMs.indexLookupOrBuild, timingMs.pageLoad);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                stats: {
                    ...index.meta.stats,
                    patients: totalPatients,
                    mode: "full",
                    cached
                },
                timingMs,
                pagination: {
                    limit,
                    offset: startIndex,
                    returnedPatients,
                    totalPatients,
                    hasMore,
                    nextOffset: hasMore ? lastIndex + 1 : null,
                    snapshotId: index.meta.snapshotId,
                    cursor,
                    nextCursor
                },
                patientsById: pageResult.patientsById,
                unassignedResources: includeUnassignedResources ? [] : []
            });
        }
        const summaryStartedAt = Date.now();
        const { entry, cached } = await getOrBuildSummarySnapshot(includeUnassignedResources);
        const summaryCompletedAt = Date.now();
        let startIndex = offsetParam;
        let cursor = null;
        if (cursorParam) {
            const decoded = decodeCursor(cursorParam);
            if (!decoded) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Invalid cursor"
                }, {
                    status: 400
                });
            }
            if (decoded.s !== entry.snapshotId) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Cursor expired or does not match current snapshot",
                    snapshotId: entry.snapshotId
                }, {
                    status: 410
                });
            }
            startIndex = decoded.i + 1;
            cursor = cursorParam;
        }
        if (startIndex > entry.orderedPatientIds.length) {
            startIndex = entry.orderedPatientIds.length;
        }
        const totalPatients = entry.orderedPatientIds.length;
        const patientsById = mapSummarySliceByIds(entry.aggregated.patientsById, entry.orderedPatientIds, startIndex, limit);
        const returnedPatients = Object.keys(patientsById).length;
        const lastIndex = returnedPatients > 0 ? startIndex + returnedPatients - 1 : startIndex - 1;
        const hasMore = lastIndex + 1 < totalPatients;
        const nextCursor = hasMore ? encodeCursor({
            s: entry.snapshotId,
            i: lastIndex
        }) : null;
        const totalCompletedAt = Date.now();
        const timingMs = {
            summarySnapshotLookupOrBuild: summaryCompletedAt - summaryStartedAt,
            total: totalCompletedAt - requestStartedAt
        };
        console.info("[api/data] mode=summary cached=%s patients=%d returned=%d totalMs=%d summaryMs=%d", cached ? "true" : "false", totalPatients, returnedPatients, timingMs.total, timingMs.summarySnapshotLookupOrBuild);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            stats: {
                ...entry.aggregated.stats,
                patients: totalPatients,
                mode: "summary",
                cached
            },
            timingMs,
            pagination: {
                limit,
                offset: startIndex,
                returnedPatients,
                totalPatients,
                hasMore,
                nextOffset: hasMore ? lastIndex + 1 : null,
                snapshotId: entry.snapshotId,
                cursor,
                nextCursor
            },
            patientsById,
            unassignedResources: entry.aggregated.unassignedResources
        });
    } catch (error) {
        console.error("Failed to import and aggregate FHIR data after %dms", Date.now() - requestStartedAt, error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to import and aggregate FHIR data"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3ba154ec._.js.map