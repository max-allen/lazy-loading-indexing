import { NextRequest, NextResponse } from "next/server"

import {
  importAllFhirDataGroupedByPatient,
  type ImportGroupedFhirResult,
  type PatientResourceGroup,
} from "../../../lib/fhir/importAllDataByPatient"

import {
  getOrBuildLazyFhirIndex,
  loadPatientPageFromLazyIndex,
} from "../../../lib/fhir/lazyIndex"

export const runtime = "nodejs"

type CursorPayload = {
  s: string
  i: number
}

type SummaryCacheEntry = {
  createdAt: number
  snapshotId: string
  aggregated: ImportGroupedFhirResult
  orderedPatientIds: string[]
}

const CACHE_TTL_MS = 5 * 60 * 1000
const FULL_MODE_DEFAULT_LIMIT = 25
const FULL_MODE_MAX_LIMIT = 200
const summaryCache = new Map<string, SummaryCacheEntry>()

function mapSummarySliceByIds(
  map: Map<string, PatientResourceGroup>,
  orderedPatientIds: string[],
  startIndex: number,
  limit: number,
): Record<string, PatientResourceGroup> {
  const result: Record<string, PatientResourceGroup> = {}
  const endExclusive = Math.min(orderedPatientIds.length, startIndex + limit)

  for (let idx = startIndex; idx < endExclusive; idx += 1) {
    const patientId = orderedPatientIds[idx]
    const group = map.get(patientId)
    if (group) {
      result[patientId] = group
    }
  }

  return result
}

function encodeCursor(payload: CursorPayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url")
}

function decodeCursor(cursor: string): CursorPayload | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    ) as Partial<CursorPayload>

    if (
      typeof parsed.s !== "string" ||
      !parsed.s ||
      typeof parsed.i !== "number" ||
      !Number.isInteger(parsed.i) ||
      parsed.i < -1
    ) {
      return null
    }

    return {
      s: parsed.s,
      i: parsed.i,
    }
  } catch {
    return null
  }
}

const getSummaryCacheKey = (includeUnassignedResources: boolean): string =>
  `summary:unassigned:${includeUnassignedResources ? "1" : "0"}`

async function getOrBuildSummarySnapshot(
  includeUnassignedResources: boolean,
): Promise<{ entry: SummaryCacheEntry; cached: boolean }> {
  const cacheKey = getSummaryCacheKey(includeUnassignedResources)
  const existing = summaryCache.get(cacheKey)
  const now = Date.now()

  if (existing && now - existing.createdAt < CACHE_TTL_MS) {
    existing.createdAt = now
    return { entry: existing, cached: true }
  }

  const aggregated = await importAllFhirDataGroupedByPatient({
    includeResources: false,
    includeUnassignedResources,
  })

  const entry: SummaryCacheEntry = {
    createdAt: now,
    snapshotId: `summary-${now}`,
    aggregated,
    orderedPatientIds: Array.from(aggregated.patientsById.keys()).sort(),
  }

  summaryCache.set(cacheKey, entry)
  return { entry, cached: false }
}

const parseBooleanQueryParam = (
  value: string | null,
  defaultValue: boolean = false
) => {
  if (value == null) return defaultValue
  return value.toLowerCase() === "true"
}

const parseIntQueryParam = (
  value: string | null,
  defaultValue: number
) => {
  if (value == null) return defaultValue

  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 0) return defaultValue

  return parsed
}

export async function GET(request: NextRequest) {
  const requestStartedAt = Date.now()

  try {
    const includeResources = parseBooleanQueryParam(
      request.nextUrl.searchParams.get("includeResources")
    )

    const includeUnassignedResources = parseBooleanQueryParam(
      request.nextUrl.searchParams.get("includeUnassigned"),
    )

    const requestedLimit = parseIntQueryParam(
      request.nextUrl.searchParams.get("limit"),
      includeResources ? FULL_MODE_DEFAULT_LIMIT : Number.MAX_SAFE_INTEGER,
    )

    const limit = includeResources
      ? Math.max(1, Math.min(requestedLimit, FULL_MODE_MAX_LIMIT))
      : Math.max(1, requestedLimit)

    const cursorParam = request.nextUrl.searchParams.get("cursor")
    const offsetParam = parseIntQueryParam(
      request.nextUrl.searchParams.get("offset"),
      0,
    )

    if (includeResources) {
      const indexStartedAt = Date.now()
      const { index, cached } = await getOrBuildLazyFhirIndex()
      const indexCompletedAt = Date.now()

      let startIndex = offsetParam
      let cursor: string | null = null

      if (cursorParam) {
        const decoded = decodeCursor(cursorParam)
        if (!decoded) {
          return NextResponse.json({ error: "Invalid cursor" }, { status: 400 })
        }

        if (decoded.s !== index.meta.snapshotId) {
          return NextResponse.json(
            {
              error: "Cursor expired or does not match current snapshot",
              snapshotId: index.meta.snapshotId,
            },
            { status: 410 },
          )
        }

        startIndex = decoded.i + 1
        cursor = cursorParam
      }

      if (startIndex > index.meta.orderedPatientIds.length) {
        startIndex = index.meta.orderedPatientIds.length
      }

      const totalPatients = index.meta.orderedPatientIds.length
      const pagePatientIds = index.meta.orderedPatientIds.slice(startIndex, startIndex + limit)

      const pageStartedAt = Date.now()
      const pageResult = await loadPatientPageFromLazyIndex(index, pagePatientIds)
      const pageCompletedAt = Date.now()

      const returnedPatients = pageResult.returnedPatients
      const lastIndex = returnedPatients > 0 ? startIndex + returnedPatients - 1 : startIndex - 1
      const hasMore = lastIndex + 1 < totalPatients
      const nextCursor = hasMore
        ? encodeCursor({
            s: index.meta.snapshotId,
            i: lastIndex,
          })
        : null

      const timingMs = {
        indexLookupOrBuild: indexCompletedAt - indexStartedAt,
        pageLoad: pageCompletedAt - pageStartedAt,
        total: pageCompletedAt - requestStartedAt,
      }

      console.info(
        "[api/data] mode=full-lazy cached=%s patients=%d returned=%d totalMs=%d indexMs=%d pageMs=%d",
        cached ? "true" : "false",
        totalPatients,
        returnedPatients,
        timingMs.total,
        timingMs.indexLookupOrBuild,
        timingMs.pageLoad,
      )

      return NextResponse.json({
        stats: {
          ...index.meta.stats,
          patients: totalPatients,
          mode: "full",
          cached,
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
          nextCursor,
        },
        patientsById: pageResult.patientsById,
        unassignedResources: includeUnassignedResources ? [] : [],
      })
    }

    const summaryStartedAt = Date.now()
    const { entry, cached } = await getOrBuildSummarySnapshot(includeUnassignedResources)
    const summaryCompletedAt = Date.now()

    let startIndex = offsetParam
    let cursor: string | null = null

    if (cursorParam) {
      const decoded = decodeCursor(cursorParam)
      if (!decoded) {
        return NextResponse.json({ error: "Invalid cursor" }, { status: 400 })
      }

      if (decoded.s !== entry.snapshotId) {
        return NextResponse.json(
          {
            error: "Cursor expired or does not match current snapshot",
            snapshotId: entry.snapshotId,
          },
          { status: 410 },
        )
      }

      startIndex = decoded.i + 1
      cursor = cursorParam
    }

    if (startIndex > entry.orderedPatientIds.length) {
      startIndex = entry.orderedPatientIds.length
    }

    const totalPatients = entry.orderedPatientIds.length
    const patientsById = mapSummarySliceByIds(
      entry.aggregated.patientsById,
      entry.orderedPatientIds,
      startIndex,
      limit,
    )

    const returnedPatients = Object.keys(patientsById).length
    const lastIndex = returnedPatients > 0 ? startIndex + returnedPatients - 1 : startIndex - 1
    const hasMore = lastIndex + 1 < totalPatients
    const nextCursor = hasMore
      ? encodeCursor({
          s: entry.snapshotId,
          i: lastIndex,
        })
      : null

    const totalCompletedAt = Date.now()
    const timingMs = {
      summarySnapshotLookupOrBuild: summaryCompletedAt - summaryStartedAt,
      total: totalCompletedAt - requestStartedAt,
    }

    console.info(
      "[api/data] mode=summary cached=%s patients=%d returned=%d totalMs=%d summaryMs=%d",
      cached ? "true" : "false",
      totalPatients,
      returnedPatients,
      timingMs.total,
      timingMs.summarySnapshotLookupOrBuild,
    )

    return NextResponse.json({
      stats: {
        ...entry.aggregated.stats,
        patients: totalPatients,
        mode: "summary",
        cached,
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
        nextCursor,
      },
      patientsById,
      unassignedResources: entry.aggregated.unassignedResources,
    })
  } catch (error) {
    console.error(
      "Failed to import and aggregate FHIR data after %dms",
      Date.now() - requestStartedAt,
      error,
    )

    return NextResponse.json(
      {
        error: "Failed to import and aggregate FHIR data",
      },
      { status: 500 },
    )
  }
}
