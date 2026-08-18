/**
 * Daily Incident challenge API.
 * Server generates one seeded challenge per UTC day (boosted threat
 * categories + scarce kits). All calls fail soft — the game plays normally
 * (standard run) when the backend is unreachable.
 */
import { API_DOMAIN } from './client'

export interface DailyStagePlan {
  targetLevel: number
  focusTopics: string[]
  stages: { kind: string; label: string; minutes: number }[]
}

export interface DailyChallenge {
  date: string
  name: string
  description: string
  mechanic?: string
  stages?: DailyStagePlan | null
  modifiers: {
    name: string
    boostedThreats: string[]
    scarceKits: string[]
  }
  endsAt: string
  leaderboard: { username: string; score: number }[]
  myBest: number | null
  myStreak: number
  myCurriculum: { levelToday: number; targetLevel: number; complete: boolean } | null
}

export async function getDailyChallenge(timeoutMs = 3500): Promise<DailyChallenge | null> {
  try {
    const ctrl = new AbortController()
    const tid = setTimeout(() => ctrl.abort(), timeoutMs)
    const res = await fetch(`${API_DOMAIN}/daily-challenges/current`, {
      signal: ctrl.signal,
      credentials: 'include',
    })
    clearTimeout(tid)
    if (!res.ok) return null
    const body = await res.json()
    if (!body?.challenge?.modifiers) return null
    const c = body.challenge
    return {
      date: c.date,
      name: c.name,
      description: c.description,
      modifiers: {
        name: c.name ?? 'Daily Incident',
        boostedThreats: Array.isArray(c.modifiers.boostedThreats) ? c.modifiers.boostedThreats : [],
        scarceKits: Array.isArray(c.modifiers.scarceKits) ? c.modifiers.scarceKits : [],
      },
      endsAt: c.endsAt,
      stages: c.stages ?? null,
      leaderboard: Array.isArray(body.leaderboard)
        ? body.leaderboard.map((e: { username?: string; score?: number }) => ({
            username: e.username || 'Anonymous',
            score: e.score || 0,
          }))
        : [],
      myBest: typeof body.myBest === 'number' ? body.myBest : null,
      myStreak: typeof body.myStreak === 'number' ? body.myStreak : 0,
      myCurriculum: body.myCurriculum ?? null,
    }
  } catch {
    return null
  }
}
