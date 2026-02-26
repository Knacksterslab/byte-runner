import type { BackendUser } from '@/lib/api/backend'
import type { LeaderboardEntry } from '@/lib/store/gameStore'

export interface LeaderboardHookOptions {
  authStatus: 'checking' | 'guest' | 'authed'
  currentUser: BackendUser | null
  gameStarted: boolean
  isGameOver: boolean
  showQuiz: boolean
  score: number
  distance: number
  addLeaderboardEntry: (entry: {
    name: string
    score: number
    distance: number
    isPlayer: boolean
  }) => void
  setLeaderboard: (entries: LeaderboardEntry[]) => void
  /** Called when a save is attempted but the user is not authenticated. */
  onNeedAuth: () => void
  /** Called when a save is attempted but the user has no username. */
  onNeedUsername: () => void
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface LeaderboardState {
  runStartedAt: number | null
  saveStatus: SaveStatus
  saveMessage: string | null
  activeBadgeToast: string | null
  pendingSave: boolean
  liveScoreRef: React.MutableRefObject<number>
  liveDistanceRef: React.MutableRefObject<number>
  lastSubmittedScoreRef: React.MutableRefObject<number>
  lastSubmittedDistanceRef: React.MutableRefObject<number>
  lastCheckpointAtRef: React.MutableRefObject<number>
  checkpointSavingRef: React.MutableRefObject<boolean>
  setRunStartedAt: (time: number | null) => void
  setSaveStatus: (status: SaveStatus) => void
  setSaveMessage: (msg: string | null) => void
  setActiveBadgeToast: (msg: string | null) => void
  setPendingSave: (pending: boolean) => void
  handleSaveToLeaderboard: (
    overrideUser?: BackendUser | null,
    reason?: 'death' | 'checkpoint'
  ) => Promise<void>
  /** Resets all refs and save state for a new run. Sets runStartedAt to now. */
  startNewRun: () => void
  /** Clears save message and pending-save; optionally resets saveStatus to idle. */
  resetSaveState: (resetStatus?: boolean) => void
}
