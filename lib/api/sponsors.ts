import { fetchWithSession } from './client'

export interface RecoverySponsor {
  id: string
  campaignId: string
  creativeId: string
  tag?: string
  logo?: string
  title: string
  description: string
  ctaLabel?: string
  ctaUrl?: string
  clickUrl?: string
  trackingToken: string
}

interface RecoverySponsorResponse {
  sponsor: RecoverySponsor | null
}

export async function getRecoverySponsor(params: {
  threatId?: string | null
  kitType?: string | null
  timeoutMs?: number
}): Promise<RecoverySponsor | null> {
  const query = new URLSearchParams()
  if (params.threatId) query.set('threatId', params.threatId)
  if (params.kitType) query.set('kitType', params.kitType)
  const suffix = query.toString()
  const path = suffix ? `/sponsors/recovery?${suffix}` : '/sponsors/recovery'

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), params.timeoutMs ?? 2500)
  const res = await fetchWithSession(path, { method: 'GET', signal: controller.signal }, false).catch(() => null)
  clearTimeout(timeout)
  if (!res) return null
  if (!res.ok) return null
  const payload = (await res.json().catch(() => null)) as RecoverySponsorResponse | null
  return payload?.sponsor ?? null
}

export async function recordSponsorImpression(params: {
  trackingToken: string
  idempotencyKey: string
  threatId?: string | null
  kitType?: string | null
  sessionId?: string | null
}): Promise<boolean> {
  const res = await fetchWithSession(
    '/sponsors/events/impression',
    {
      method: 'POST',
      body: JSON.stringify({
        trackingToken: params.trackingToken,
        idempotencyKey: params.idempotencyKey,
        threatId: params.threatId ?? undefined,
        kitType: params.kitType ?? undefined,
        sessionId: params.sessionId ?? undefined,
      }),
    },
    false,
  ).catch(() => null)
  return Boolean(res?.ok)
}
