import { fetchWithSession } from './client'
import type { HourlyChallenge, HourlyChallengeEligibility } from './types'

export async function getCurrentHourlyChallenge(): Promise<{ challenge: HourlyChallenge | null }> {
  const res = await fetchWithSession('/hourly-challenges/current', { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch current hourly challenge.')
  return res.json()
}

export async function getHourlyChallengeLeaderboard(
  challengeHour?: string,
  limit = 10,
): Promise<any> {
  const url = challengeHour
    ? `/hourly-challenges/leaderboard?challengeHour=${challengeHour}&limit=${limit}`
    : `/hourly-challenges/leaderboard?limit=${limit}`
  const res = await fetchWithSession(url, { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch hourly challenge leaderboard.')
  return res.json()
}

export async function getMyHourlyChallengeEligibility(): Promise<HourlyChallengeEligibility> {
  const res = await fetchWithSession('/hourly-challenges/my-eligibility', { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch hourly challenge eligibility.')
  return res.json()
}
