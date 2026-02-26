import { fetchWithSession } from './client'

export async function submitRun(payload: {
  score: number
  distance: number
  durationMs: number
  clientVersion?: string
}) {
  const startRes = await fetchWithSession('/runs/start', { method: 'POST' })
  if (!startRes.ok) throw new Error('Failed to start run.')
  const startPayload = await startRes.json()

  const finishRes = await fetchWithSession('/runs/finish', {
    method: 'POST',
    body: JSON.stringify({
      runToken: startPayload.runToken,
      score: payload.score,
      distance: payload.distance,
      durationMs: payload.durationMs,
      clientVersion: payload.clientVersion,
    }),
  })

  if (!finishRes.ok) {
    const body = await finishRes.json().catch(() => null)
    throw new Error(body?.message || 'Failed to submit run.')
  }
  return finishRes.json()
}

export async function getMyStats(): Promise<{
  bestScore: number
  bestDistance: number
  rank: number | null
  totalRuns: number
}> {
  const res = await fetchWithSession('/runs/my-stats', { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch user stats.')
  return res.json()
}
