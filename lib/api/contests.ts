import { fetchWithSession } from './client'
import type { Contest, ContestLeaderboardEntry, PrizeClaim } from './types'

export async function getAllContests(status?: string): Promise<Contest[]> {
  const url = status ? `/contests?status=${status}` : '/contests'
  const res = await fetchWithSession(url, { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch contests.')
  return res.json()
}

export async function getActiveContests(): Promise<Contest[]> {
  const res = await fetchWithSession('/contests/active', { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch active contests.')
  return res.json()
}

export async function getContest(contestId: string): Promise<Contest> {
  const res = await fetchWithSession(`/contests/${contestId}`, { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch contest.')
  return res.json()
}

export async function getContestLeaderboard(
  contestId: string,
  limit = 100,
): Promise<ContestLeaderboardEntry[]> {
  const res = await fetchWithSession(`/contests/${contestId}/leaderboard?limit=${limit}`, {
    method: 'GET',
  })
  if (!res.ok) throw new Error('Failed to fetch contest leaderboard.')
  return res.json()
}

export async function enterContest(
  contestId: string,
  runId: string,
  score: number,
  distance: number,
): Promise<any> {
  const res = await fetchWithSession(`/contests/${contestId}/enter`, {
    method: 'POST',
    body: JSON.stringify({ runId, score, distance }),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to enter contest.')
  }
  return res.json()
}

export async function getMyContestEntries(
  contestId: string,
): Promise<{ entries: any[]; rank: number | null }> {
  const res = await fetchWithSession(`/contests/${contestId}/my-entries`, { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch contest entries.')
  return res.json()
}

export async function getMyClaims(): Promise<PrizeClaim[]> {
  const res = await fetchWithSession('/prize-claims/my-claims', { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch prize claims.')
  return res.json()
}

export async function getMyClaimForContest(contestId: string): Promise<PrizeClaim | null> {
  const res = await fetchWithSession(`/prize-claims/contest/${contestId}/my-claim`, {
    method: 'GET',
  })
  if (!res.ok) return null
  return res.json()
}

export async function submitPrizeClaim(claimId: string, contactInfo: any): Promise<any> {
  const res = await fetchWithSession(`/prize-claims/${claimId}/submit`, {
    method: 'POST',
    body: JSON.stringify(contactInfo),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to submit prize claim.')
  }
  return res.json()
}
