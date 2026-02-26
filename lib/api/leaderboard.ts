import { fetchWithSession } from './client'
import type { LeaderboardItem } from './types'

export async function getLeaderboard(limit = 50): Promise<LeaderboardItem[]> {
  const res = await fetchWithSession(`/leaderboard/current?limit=${limit}`, { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch leaderboard.')
  return res.json()
}
