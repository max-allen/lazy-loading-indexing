const DEFAULT_URL = "http://localhost:3000/api/data?includeResources=true&limit=1"
const url = process.env.PREWARM_URL ?? DEFAULT_URL
const timeoutMs = Number.parseInt(process.env.PREWARM_TIMEOUT_MS ?? "900000", 10)

function abortAfter(ms) {
  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort(new Error(`Prewarm timed out after ${ms}ms`))
  }, ms)

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
  }
}

async function main() {
  const startedAt = Date.now()
  const { signal, clear } = abortAfter(timeoutMs)

  try {
    console.log(`[prewarm-index] Requesting ${url}`)

    const response = await fetch(url, {
      method: "GET",
      signal,
      headers: {
        "accept": "application/json",
      },
    })

    const elapsed = Date.now() - startedAt

    if (!response.ok) {
      const body = await response.text()
      throw new Error(
        `Prewarm failed with ${response.status} ${response.statusText}. Body: ${body.slice(0, 500)}`,
      )
    }

    const data = await response.json()
    const stats = data?.stats ?? {}
    const timingMs = data?.timingMs ?? {}

    console.log(
      `[prewarm-index] Done in ${elapsed}ms (mode=${stats.mode ?? "unknown"}, cached=${String(stats.cached ?? false)})`,
    )

    if (Object.keys(timingMs).length > 0) {
      console.log(`[prewarm-index] timingMs=${JSON.stringify(timingMs)}`)
    }
  } finally {
    clear()
  }
}

main().catch((error) => {
  console.error("[prewarm-index] Failed:", error)
  process.exit(1)
})
