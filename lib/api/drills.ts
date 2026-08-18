/**
 * Verified-learning API — every quiz/drill outcome flows to the server
 * (mastery ledger + future earn gating). Fire-and-forget: game never blocks.
 */
import { fetchWithSession } from './client'

let currentDrillToken: string | null = null

/** Called when a quiz/drill begins — mints the verification token. */
export async function beginDrillSession(): Promise<void> {
  try {
    const res = await fetchWithSession('/drills/start', { method: 'POST' })
    if (res.ok) currentDrillToken = (await res.json()).drillToken
  } catch {
    // offline / not signed in — results stay local-only
  }
}

export interface DrillOutcome {
  topic: string
  passed: boolean
  format?: string
  score?: number
  questionId?: string
}

/** Called when it ends — consumes the token; falls back to minting a fresh one. */
export async function endDrillSession(outcome: DrillOutcome): Promise<void> {
  try {
    let token = currentDrillToken
    currentDrillToken = null
    if (!token) {
      const res = await fetchWithSession('/drills/start', { method: 'POST' })
      if (!res.ok) return
      token = (await res.json()).drillToken
    }
    await fetchWithSession('/drills/finish', {
      method: 'POST',
      body: JSON.stringify({
        drillToken: token,
        topic: outcome.topic,
        passed: outcome.passed,
        format: outcome.format ?? 'quiz',
        score: outcome.score ?? (outcome.passed ? 100 : 0),
        questionId: outcome.questionId,
      }),
    })
  } catch {
    // never break gameplay for telemetry
  }
}

export async function getMastery(): Promise<unknown[] | null> {
  try {
    const res = await fetchWithSession('/drills/mastery', { method: 'GET' })
    return res.ok ? await res.json() : null
  } catch {
    return null
  }
}
