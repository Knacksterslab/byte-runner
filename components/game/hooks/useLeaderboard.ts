import { useState, useEffect, useRef } from 'react'
import { getLeaderboard, submitRun, type BackendUser } from '@/lib/api/backend'
import { checkBadges, getAllBadges, getMyBadges } from '@/lib/api/badges'
import { type LeaderboardEntry } from '@/lib/store/gameStore'
import { trackRunSaved } from '@/lib/analytics'
import { audioManager } from '@/lib/audio'
import type { LeaderboardHookOptions, LeaderboardState, SaveStatus } from '../types/leaderboard.types'

export type { LeaderboardHookOptions, LeaderboardState, SaveStatus }

const CHECKPOINT_INTERVAL_MS = 90_000
const CHECKPOINT_MIN_GAP_MS = 30_000
const CHECKPOINT_SCORE_DELTA = 1000

export function useLeaderboard(options: LeaderboardHookOptions): LeaderboardState {
  const [runStartedAt, setRunStartedAt] = useState<number | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [activeBadgeToast, setActiveBadgeToast] = useState<string | null>(null)
  const [pendingSave, setPendingSave] = useState(false)
  const [badgeToastQueue, setBadgeToastQueue] = useState<string[]>([])

  const liveScoreRef = useRef(0)
  const liveDistanceRef = useRef(0)
  const lastSubmittedScoreRef = useRef(0)
  const lastSubmittedDistanceRef = useRef(0)
  const lastCheckpointAtRef = useRef(0)
  const checkpointSavingRef = useRef(false)
  const runStartedAtRef = useRef<number | null>(null)
  const badgeNameByIdRef = useRef<Record<string, string>>({})
  const knownBadgeIdsRef = useRef<Set<string>>(new Set())
  const badgeToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep options in a ref so closures always read the latest values.
  const optionsRef = useRef(options)
  optionsRef.current = options

  // Mirror runStartedAt to a ref so the save function can read it without closure staleness.
  useEffect(() => {
    runStartedAtRef.current = runStartedAt
  }, [runStartedAt])

  const refreshLeaderboard = async (signal?: { cancelled: boolean }) => {
    try {
      const entries = await getLeaderboard(50)
      if (signal?.cancelled) return
      const mapped: LeaderboardEntry[] = entries.map((entry, index) => ({
        id: `remote_${index}_${entry.createdAt}`,
        name: entry.username,
        score: entry.score,
        distance: entry.distance,
        createdAt: new Date(entry.createdAt).getTime(),
      }))
      optionsRef.current.setLeaderboard(mapped.slice(0, 10))
    } catch { /* silently fail */ }
  }

  useEffect(() => {
    const signal = { cancelled: false }
    refreshLeaderboard(signal)
    return () => { signal.cancelled = true }
  }, [])

  useEffect(() => {
    let isActive = true
    getAllBadges()
      .then((badges) => {
        if (!isActive) return
        badgeNameByIdRef.current = badges.reduce<Record<string, string>>((acc, badge) => {
          acc[badge.id] = badge.name
          return acc
        }, {})
      })
      .catch(() => {
        if (!isActive) return
        badgeNameByIdRef.current = {}
      })
    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    const { authStatus, currentUser } = options
    if (authStatus !== 'authed' || !currentUser) {
      knownBadgeIdsRef.current = new Set()
      return
    }

    let isActive = true
    getMyBadges()
      .then((badges) => {
        if (!isActive) return
        knownBadgeIdsRef.current = new Set(badges.map((b) => b.badge_id))
      })
      .catch(() => {
        if (!isActive) return
        knownBadgeIdsRef.current = new Set()
      })

    return () => {
      isActive = false
    }
  }, [options.authStatus, options.currentUser?.id])

  useEffect(() => {
    if (activeBadgeToast || badgeToastQueue.length === 0) return
    const [nextToast, ...remaining] = badgeToastQueue
    setActiveBadgeToast(nextToast)
    setBadgeToastQueue(remaining)
  }, [activeBadgeToast, badgeToastQueue])

  useEffect(() => {
    if (!activeBadgeToast) return
    if (badgeToastTimeoutRef.current) clearTimeout(badgeToastTimeoutRef.current)
    badgeToastTimeoutRef.current = setTimeout(() => {
      setActiveBadgeToast(null)
    }, 2600)

    return () => {
      if (badgeToastTimeoutRef.current) {
        clearTimeout(badgeToastTimeoutRef.current)
        badgeToastTimeoutRef.current = null
      }
    }
  }, [activeBadgeToast])

  const handleSaveToLeaderboard = async (
    overrideUser?: BackendUser | null,
    reason: 'death' | 'checkpoint' = 'death'
  ) => {
    const { authStatus, currentUser, score, distance, addLeaderboardEntry, onNeedAuth, onNeedUsername } =
      optionsRef.current
    const userForSave = overrideUser ?? currentUser
    const isCheckpoint = reason === 'checkpoint'

    if (isCheckpoint && checkpointSavingRef.current) return

    const isAuthedForSave = !!overrideUser || authStatus === 'authed'
    if (!isAuthedForSave) {
      if (isCheckpoint) return
      setPendingSave(true)
      onNeedAuth()
      return
    }
    if (!userForSave?.username) {
      if (isCheckpoint) return
      setPendingSave(true)
      onNeedUsername()
      return
    }

    const scoreToSave = Math.max(score, liveScoreRef.current)
    const distanceToSave = Math.max(distance, liveDistanceRef.current)

    if (
      isCheckpoint &&
      scoreToSave <= lastSubmittedScoreRef.current &&
      distanceToSave <= lastSubmittedDistanceRef.current
    ) {
      return
    }

    setPendingSave(false)
    if (isCheckpoint) {
      checkpointSavingRef.current = true
    } else {
      setSaveStatus('saving')
      setSaveMessage(null)
    }

    try {
      const durationMs = runStartedAtRef.current
        ? Math.max(0, Date.now() - runStartedAtRef.current)
        : 0
      const result = await submitRun({
        score: scoreToSave,
        distance: distanceToSave,
        durationMs,
        clientVersion: 'web',
      })
      addLeaderboardEntry({
        name: userForSave.username,
        score: scoreToSave,
        distance: distanceToSave,
        isPlayer: true,
      })
      await refreshLeaderboard()
      lastSubmittedScoreRef.current = Math.max(lastSubmittedScoreRef.current, scoreToSave)
      lastSubmittedDistanceRef.current = Math.max(lastSubmittedDistanceRef.current, distanceToSave)
      lastCheckpointAtRef.current = Date.now()

      if (!isCheckpoint) {
        setSaveStatus('saved')
        trackRunSaved({
          score: scoreToSave,
          distance: distanceToSave,
          enteredContests: result.enteredContests,
        })
        if (result.enteredContests && result.enteredContests.length > 0) {
          audioManager.play('prize-win')
          setSaveMessage(`Saved to leaderboard! 🏆 Entered in: ${result.enteredContests.join(', ')}`)
        } else {
          audioManager.play('run-saved')
          setSaveMessage('Saved to leaderboard.')
        }
      }

      try {
        const badgeResult = await checkBadges()
        let newlyAwardedIds = badgeResult.awarded

        // Fallback for race conditions where backend already awarded badges
        // but /badges/check returns no new ids to this specific call.
        if (newlyAwardedIds.length === 0) {
          const myBadges = await getMyBadges()
          const latestIds = new Set(myBadges.map((badge) => badge.badge_id))
          newlyAwardedIds = Array.from(latestIds).filter((id) => !knownBadgeIdsRef.current.has(id))
          knownBadgeIdsRef.current = latestIds
        } else {
          newlyAwardedIds.forEach((id) => knownBadgeIdsRef.current.add(id))
        }

        if (newlyAwardedIds.length > 0) {
          audioManager.play('badge-unlock')
          const nextToasts = newlyAwardedIds.map((badgeId) => {
            const badgeName = badgeNameByIdRef.current[badgeId] ?? badgeId
            return `Badge Unlocked: ${badgeName}`
          })
          setBadgeToastQueue((prev) => [...prev, ...nextToasts])
        }
      } catch {
        // Ignore badge toast failures so run-save UX is unaffected.
      }
    } catch (error) {
      if (!isCheckpoint) {
        setSaveStatus('error')
        setSaveMessage(error instanceof Error ? error.message : 'Failed to save score.')
      }
    } finally {
      if (isCheckpoint) {
        checkpointSavingRef.current = false
      }
    }
  }

  // Auto-save when the game ends
  useEffect(() => {
    const { isGameOver, showQuiz, authStatus } = options
    if (!isGameOver) return
    if (showQuiz) return
    if (authStatus !== 'authed') return
    if (saveStatus !== 'idle') return

    const timer = setTimeout(() => {
      handleSaveToLeaderboard()
    }, 100)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.isGameOver, options.showQuiz, options.authStatus, options.currentUser?.username, saveStatus])

  // Checkpoint saves during an active run
  useEffect(() => {
    const { gameStarted, isGameOver, showQuiz, authStatus, currentUser } = options
    if (!gameStarted) return
    if (isGameOver || showQuiz) return
    if (authStatus !== 'authed') return
    if (!currentUser?.username) return

    const timer = setInterval(() => {
      if (checkpointSavingRef.current) return

      const now = Date.now()
      const scoreDelta = liveScoreRef.current - lastSubmittedScoreRef.current
      const improved =
        liveScoreRef.current > lastSubmittedScoreRef.current ||
        liveDistanceRef.current > lastSubmittedDistanceRef.current
      if (!improved) return

      const sinceLastCheckpoint = now - lastCheckpointAtRef.current
      const intervalReached = sinceLastCheckpoint >= CHECKPOINT_INTERVAL_MS
      const deltaReached =
        scoreDelta >= CHECKPOINT_SCORE_DELTA && sinceLastCheckpoint >= CHECKPOINT_MIN_GAP_MS

      if (intervalReached || deltaReached) {
        void handleSaveToLeaderboard(undefined, 'checkpoint')
      }
    }, 5000)

    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    options.gameStarted,
    options.isGameOver,
    options.showQuiz,
    options.authStatus,
    options.currentUser?.username,
  ])

  const startNewRun = () => {
    const now = Date.now()
    setRunStartedAt(now)
    runStartedAtRef.current = now
    setSaveStatus('idle')
    setSaveMessage(null)
    setActiveBadgeToast(null)
    setBadgeToastQueue([])
    setPendingSave(false)
    liveScoreRef.current = 0
    liveDistanceRef.current = 0
    lastSubmittedScoreRef.current = 0
    lastSubmittedDistanceRef.current = 0
    lastCheckpointAtRef.current = now
    checkpointSavingRef.current = false
  }

  const resetSaveState = (resetStatus = false) => {
    setSaveMessage(null)
    setActiveBadgeToast(null)
    setBadgeToastQueue([])
    setPendingSave(false)
    if (resetStatus) setSaveStatus('idle')
  }

  return {
    runStartedAt,
    saveStatus,
    saveMessage,
    activeBadgeToast,
    pendingSave,
    liveScoreRef,
    liveDistanceRef,
    lastSubmittedScoreRef,
    lastSubmittedDistanceRef,
    lastCheckpointAtRef,
    checkpointSavingRef,
    setRunStartedAt,
    setSaveStatus,
    setSaveMessage,
    setActiveBadgeToast,
    setPendingSave,
    handleSaveToLeaderboard,
    startNewRun,
    resetSaveState,
  }
}
