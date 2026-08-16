import type { GhostPlayer } from '@/lib/game/ghostPlayers'
import type { BackendUser } from '@/lib/api/backend'
import type { RecoveryOverlayOption2 } from '@/lib/game/utils/recoveryUtils'

export interface GameObject {
  x: number; y: number; width: number; height: number
  vx: number; vy: number; type: string; color: string
  threatId: string; sentBy: GhostPlayer; category: string
  damage?: 'instant' | 'minor'
  spawnTime?: number; active?: boolean
}

export type RecoveryOverlayState = RecoveryOverlayOption2

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFn = (...args: any[]) => any

export interface UseGameLoopOptions {
  canvasRef: React.RefObject<HTMLCanvasElement>
  gameStarted: boolean
  savedGameState: { level: number; kits: Record<string, number>; score: number } | null
  bonusKitType: string | null
  quiz: ReturnType<typeof import('./useQuizState').useQuizState>
  ui: ReturnType<typeof import('./useUIState').useUIState>
  timeoutRefs: React.MutableRefObject<ReturnType<typeof setTimeout>[]>
  authStatus: string
  currentUser: BackendUser | null
  handleSignOut: () => void
  showQuizOverlayRef: React.MutableRefObject<boolean>
  guestSavePromptActiveRef: React.MutableRefObject<boolean>
  authFlowActiveRef: React.MutableRefObject<boolean>
  liveScoreRef: React.MutableRefObject<number>
  liveDistanceRef: React.MutableRefObject<number>
  setShowAuthModal: (v: boolean) => void
  setRecoveryOverlay: React.Dispatch<React.SetStateAction<RecoveryOverlayState | null>>
  setLevel: (v: number) => void
  setSavedGameState: (state: { level: number; kits: Record<string, number>; score: number } | null) => void
  setIsFirstDeath: (v: boolean) => void
  isGameOver: boolean
  lastThreatType: string | null
  isFirstDeath: boolean
  lastAttacker: GhostPlayer | null
  setScore: (v: number) => void
  setDistance: (v: number) => void
  setGameOver: (v: boolean) => void
  setRunning: (v: boolean) => void
  setLastAttacker: AnyFn
  resetGame: () => void
  addLeaderboardEntry: AnyFn
  setLeaderboard: AnyFn
  /** Pause plumbing: engine reads the ref; React mirrors via callback. */
  pausedRef: React.MutableRefObject<boolean>
  onPauseChange: (paused: boolean) => void
  /** Daily-incident modifiers (boosted threat categories / scarce kits). */
  dailyModifiers: { boostedThreats: string[]; scarceKits: string[] } | null
}
