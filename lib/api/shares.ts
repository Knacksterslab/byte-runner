import { fetchWithSession } from './client'

export async function recordShare(
  platform: string,
  score?: number,
  runId?: string,
): Promise<{ id: string; platform: string; createdAt: string }> {
  const res = await fetchWithSession('/shares', {
    method: 'POST',
    body: JSON.stringify({ platform, score, runId }),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to record share.')
  }
  return res.json()
}

export async function getShareCount(): Promise<number> {
  const res = await fetchWithSession('/shares/count', { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch share count.')
  const data = await res.json()
  return data.count
}
