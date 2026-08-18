/**
 * Weakness profile — what security topics the player doesn't know yet.
 *
 * Signals (by design, not reflexes):
 *   - Quiz misses (wrong answers)  → weight 3  (primary: knowledge gaps)
 *   - Deaths without the countermeasure kit → weight 1 (didn't learn which
 *     kit matters)
 * Obstacle blocks are deliberately EXCLUDED: being hit by a moving rectangle
 * measures dodging, not understanding.
 *
 * Stored in localStorage under 'byterunner:weakness' as {category: score}.
 */

const KEY = 'byterunner:weakness'

/** Quiz topics map onto threat categories for reporting. */
const QUIZ_TYPE_TO_CATEGORY: Record<string, string> = {
  password: 'password',
  email: 'phishing',
  link: 'phishing',
  wifi: 'wifi',
  update: 'updates',
  classification: 'data-classification',
  disposal: 'secure-disposal',
  meeting: 'meeting-security',
}

export function quizTypeToCategory(type: string | null | undefined): string {
  if (!type) return 'updates'
  return QUIZ_TYPE_TO_CATEGORY[type] ?? 'updates'
}

function read(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

function write(profile: Record<string, number>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile))
  } catch {
    // storage unavailable — profile is best-effort
  }
}

/** Immediately records a quiz miss (called the moment a wrong answer happens). */
export function recordQuizMiss(category: string, weight = 3): void {
  const profile = read()
  profile[category] = (profile[category] || 0) + weight
  write(profile)
}

/** Merges a run's tallies at game over: quiz misses ×3, kit-less deaths ×1. */
export function mergeRunProfile(
  quizMisses: Record<string, number>,
  deathsByCategory: Record<string, number>,
): void {
  const profile = read()
  for (const [cat, n] of Object.entries(quizMisses)) {
    profile[cat] = (profile[cat] || 0) + n * 3
  }
  for (const [cat, n] of Object.entries(deathsByCategory)) {
    profile[cat] = (profile[cat] || 0) + n
  }
  write(profile)
}

// ── Server-verified reporting (phase 1 of the curriculum engine) ──────────
// One call per quiz outcome: updates the local profile AND reports to the
// backend mastery ledger. Fire-and-forget — gameplay never blocks or breaks.
import { endDrillSession } from '@/lib/api/drills'

export function reportQuizResult(
  topic: string,
  passed: boolean,
  opts?: { format?: string; questionId?: string; skipLocalMiss?: boolean },
): void {
  if (!passed && !opts?.skipLocalMiss) recordQuizMiss(topic)
  void endDrillSession({ topic, passed, format: opts?.format ?? 'quiz', questionId: opts?.questionId })
}
