import { fetchWithSession } from './client'

export interface RecoverySponsor {
  id: string
  tag?: string
  logo?: string
  title: string
  description: string
  ctaLabel?: string
  ctaUrl?: string
}

interface RecoverySponsorResponse {
  sponsor: RecoverySponsor | null
}

export async function getRecoverySponsor(params: { threatId?: string | null; kitType?: string | null }): Promise<RecoverySponsor | null> {
  const query = new URLSearchParams()
  if (params.threatId) query.set('threatId', params.threatId)
  if (params.kitType) query.set('kitType', params.kitType)
  const suffix = query.toString()
  const path = suffix ? `/sponsors/recovery?${suffix}` : '/sponsors/recovery'

  const res = await fetchWithSession(path, { method: 'GET' }, false)
  if (!res.ok) return null
  const payload = (await res.json().catch(() => null)) as RecoverySponsorResponse | null
  return payload?.sponsor ?? null
}
