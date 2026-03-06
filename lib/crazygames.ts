/**
 * CrazyGames SDK utility.
 *
 * All calls are safe no-ops on any non-CrazyGames domain (environment === 'disabled').
 * Import `isCrazyGames` to branch UI behaviour; use the wrapper functions for SDK events.
 *
 * Docs: https://docs.crazygames.com/sdk/html5-v2/intro
 */

type CrazyEnv = 'crazygames' | 'local' | 'disabled'

let _env: CrazyEnv = 'disabled'
let _initialized = false

function getSdk() {
  if (typeof window === 'undefined') return null
  return (window as any).CrazyGames?.SDK ?? null
}

/** Resolve and cache the SDK environment (call once on mount). */
export async function initCrazyGames(): Promise<CrazyEnv> {
  if (_initialized) return _env
  _initialized = true
  const sdk = getSdk()
  if (!sdk) return _env
  try {
    _env = await sdk.getEnvironment()
  } catch {
    _env = 'disabled'
  }
  return _env
}

/** True only when running inside a CrazyGames iframe. */
export function isCrazyGames(): boolean {
  return _env === 'crazygames'
}

// ─── Game module ─────────────────────────────────────────────────────────────

/** Call when the player enters a playable state (game start, resume, next level). */
export function cgGameplayStart(): void {
  try { getSdk()?.game.gameplayStart() } catch { /* no-op outside CG */ }
}

/** Call on every game break (game over, entering a menu, pausing). */
export function cgGameplayStop(): void {
  try { getSdk()?.game.gameplayStop() } catch { /* no-op outside CG */ }
}

/** Call when loading begins. */
export function cgLoadingStart(): void {
  try { getSdk()?.game.loadingStart() } catch { /* no-op outside CG */ }
}

/** Call when loading is complete and the game is ready. */
export function cgLoadingStop(): void {
  try { getSdk()?.game.loadingStop() } catch { /* no-op outside CG */ }
}

/**
 * Trigger a platform celebration (confetti etc.) on major achievements.
 * Use sparingly — new high score, significant level milestone.
 */
export function cgHappyTime(): void {
  try { getSdk()?.game.happytime() } catch { /* no-op outside CG */ }
}
