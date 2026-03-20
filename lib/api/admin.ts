import { fetchWithSession } from './client'
import type { Withdrawal } from './types'

// ── Withdrawal admin ─────────────────────────────────────────────────────────

export interface AdminUpdateWithdrawalData {
  status: 'approved' | 'paid' | 'rejected'
  notes?: string
  paymentDetails?: string
}

export async function adminGetAllWithdrawals(status?: string): Promise<{ withdrawals: Withdrawal[] }> {
  const url = status ? `/balance/admin/withdrawals?status=${status}` : '/balance/admin/withdrawals'
  const res = await fetchWithSession(url, { method: 'GET' })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to fetch withdrawals.')
  }
  return res.json()
}

export async function adminUpdateWithdrawal(
  withdrawalId: string,
  data: AdminUpdateWithdrawalData,
): Promise<Withdrawal> {
  const res = await fetchWithSession(`/balance/admin/withdrawals/${withdrawalId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to update withdrawal.')
  }
  return res.json()
}

export interface CreateContestData {
  name: string
  slug?: string
  description?: string
  startDate: string
  endDate: string
  contestTimezone?: string
  status?: 'upcoming' | 'active' | 'ended' | 'cancelled'
  prizePool?: Record<string, string>
  rules?: Record<string, any>
  maxEntriesPerUser?: number
}

export async function checkIsAdmin(): Promise<boolean> {
  try {
    const res = await fetchWithSession('/contests/admin/check', { method: 'GET' })
    return res.ok
  } catch {
    return false
  }
}

export async function createContest(data: CreateContestData): Promise<any> {
  const res = await fetchWithSession('/contests/admin/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to create contest.')
  }
  return res.json()
}

export async function updateContest(
  contestId: string,
  data: Partial<CreateContestData>,
): Promise<any> {
  const res = await fetchWithSession(`/contests/admin/${contestId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || `Failed to update contest. Status: ${res.status}`)
  }
  return res.json()
}

export async function deleteContest(contestId: string): Promise<void> {
  const res = await fetchWithSession(`/contests/admin/${contestId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete contest.')
}

export async function updateContestStatuses(): Promise<any> {
  const res = await fetchWithSession('/contests/admin/update-statuses', { method: 'POST' })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to update contest statuses.')
  }
  return res.json()
}

// ── Sponsors admin ──────────────────────────────────────────────────────────

export interface AdminSponsor {
  id: string
  slug: string
  name: string
  legal_name?: string | null
  status: 'active' | 'paused' | 'archived'
  allowed_domains: string[]
}

export interface AdminCampaign {
  id: string
  sponsor_id: string
  name: string
  status: 'draft' | 'active' | 'paused' | 'archived'
  starts_at: string
  ends_at?: string | null
  priority?: number
  daily_impression_cap?: number | null
  total_impression_cap?: number | null
  frequency_cap_per_user_per_day?: number
  sponsors?: AdminSponsor | AdminSponsor[]
  campaign_targeting?: any
  sponsor_creatives?: any[]
}

export interface CreateSponsorData {
  slug: string
  name: string
  legalName?: string
  status?: 'active' | 'paused' | 'archived'
  allowedDomains?: string[]
}

export interface CreateCampaignData {
  sponsorId: string
  name: string
  status?: 'draft' | 'active' | 'paused' | 'archived'
  startsAt: string
  endsAt?: string
  priority?: number
  dailyImpressionCap?: number
  totalImpressionCap?: number
  frequencyCapPerUserPerDay?: number
}

export interface UpsertTargetingData {
  threatIds?: string[]
  kitTypes?: string[]
  countries?: string[]
  platforms?: string[]
}

export interface CreateCreativeData {
  tag?: string
  logo?: string
  title: string
  description: string
  ctaLabel?: string
  ctaUrl: string
  isActive?: boolean
}

export async function adminGetSponsors(): Promise<AdminSponsor[]> {
  const res = await fetchWithSession('/sponsors/admin/sponsors', { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch sponsors.')
  return res.json()
}

export async function adminCreateSponsor(data: CreateSponsorData): Promise<AdminSponsor> {
  const res = await fetchWithSession('/sponsors/admin/sponsors', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to create sponsor.')
  }
  return res.json()
}

export async function adminUpdateSponsor(id: string, data: Partial<CreateSponsorData>): Promise<AdminSponsor> {
  const res = await fetchWithSession(`/sponsors/admin/sponsors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to update sponsor.')
  }
  return res.json()
}

export async function adminGetCampaigns(): Promise<AdminCampaign[]> {
  const res = await fetchWithSession('/sponsors/admin/campaigns', { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch campaigns.')
  return res.json()
}

export async function adminCreateCampaign(data: CreateCampaignData): Promise<AdminCampaign> {
  const res = await fetchWithSession('/sponsors/admin/campaigns', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to create campaign.')
  }
  return res.json()
}

export async function adminSetCampaignLifecycle(
  campaignId: string,
  status: 'draft' | 'active' | 'paused' | 'archived',
): Promise<AdminCampaign> {
  const res = await fetchWithSession(`/sponsors/admin/campaigns/${campaignId}/lifecycle`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to update campaign lifecycle.')
  }
  return res.json()
}

export async function adminUpsertCampaignTargeting(campaignId: string, data: UpsertTargetingData): Promise<any> {
  const res = await fetchWithSession(`/sponsors/admin/campaigns/${campaignId}/targeting`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to update targeting.')
  }
  return res.json()
}

export async function adminCreateCreative(campaignId: string, data: CreateCreativeData): Promise<any> {
  const res = await fetchWithSession(`/sponsors/admin/campaigns/${campaignId}/creatives`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to create creative.')
  }
  return res.json()
}

export async function adminSimulateSponsor(params: { threatId?: string; kitType?: string }): Promise<any> {
  const res = await fetchWithSession('/sponsors/admin/simulate', {
    method: 'POST',
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to simulate sponsor selection.')
  }
  return res.json()
}
