import { NextResponse } from "next/server"

import {
  importAllFhirDataGroupedByPatient,
  type PatientResourceGroup,
} from "../../../../lib/fhir/importAllDataByPatient"

export const runtime = "nodejs"

function mapToObject(
  map: Map<string, PatientResourceGroup>,
): Record<string, PatientResourceGroup> {
  const result: Record<string, PatientResourceGroup> = {}

  for (const [patientId, group] of map.entries()) {
    result[patientId] = group
  }

  return result
}

export async function GET() {
  try {
    const aggregated = await importAllFhirDataGroupedByPatient({
      includeResources: true,
      includeUnassignedResources: true,
    })

    return NextResponse.json({
      stats: {
        ...aggregated.stats,
        patients: aggregated.patientsById.size,
        mode: "full",
        cached: false,
      },
      patientsById: mapToObject(aggregated.patientsById),
      unassignedResources: aggregated.unassignedResources,
    })
  } catch (error) {
    console.error("Failed to import and aggregate FHIR data", error)

    return NextResponse.json(
      {
        error: "Failed to import and aggregate FHIR data",
      },
      { status: 500 },
    )
  }
}
