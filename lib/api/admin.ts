import { fetchWithSession } from './client'

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
