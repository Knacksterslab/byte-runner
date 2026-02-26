import { useEffect, useRef, useState } from 'react'

const GUEST_SAVE_PROMPT_MIN_SCORE = 1200
const GUEST_SAVE_PROMPT_MIN_LEVEL = 3
const GUEST_SAVE_PROMPT_SCORE_DELTA = 1500
const GUEST_SAVE_PROMPT_LEVEL_DELTA = 2
const GUEST_SAVE_PROMPT_COOLDOWN_MS = 180_000
const GUEST_SAVE_PROMPT_MAX_PER_RUN = 3

interface UseGuestSavePromptOptions {
  gameStarted: boolean
  authStatus: string
  isGameOver: boolean
  showQuiz: boolean
  showAuthModal: boolean
  showUsernameModal: boolean
  hasRecoveryOverlay: boolean
  showLearnMore: boolean
  score: number
  level: number
  liveScoreRef: React.MutableRefObject<number>
}

export function useGuestSavePrompt(opts: UseGuestSavePromptOptions) {
  const [showGuestSavePrompt, setShowGuestSavePrompt] = useState(false)
  const promptCountRef = useRef(0)
  const lastPromptAtRef = useRef(0)
  const lastPromptScoreRef = useRef(0)
  const lastPromptLevelRef = useRef(1)

  useEffect(() => {
    if (!opts.gameStarted) {
      setShowGuestSavePrompt(false)
      promptCountRef.current = 0
      lastPromptAtRef.current = 0
      lastPromptScoreRef.current = 0
      lastPromptLevelRef.current = 1
    }
  }, [opts.gameStarted])

  useEffect(() => {
    if (!opts.gameStarted || opts.authStatus === 'authed') {
      setShowGuestSavePrompt(false)
      return
    }

    const timer = setInterval(() => {
      if (opts.isGameOver || opts.showQuiz) return
      if (showGuestSavePrompt) return
      if (opts.showAuthModal || opts.showUsernameModal) return
      if (opts.hasRecoveryOverlay || opts.showLearnMore) return
      if (promptCountRef.current >= GUEST_SAVE_PROMPT_MAX_PER_RUN) return

      const scoreNow = Math.max(opts.score, opts.liveScoreRef.current)
      const milestoneReached = scoreNow >= GUEST_SAVE_PROMPT_MIN_SCORE || opts.level >= GUEST_SAVE_PROMPT_MIN_LEVEL
      if (!milestoneReached) return

      const now = Date.now()
      if (now - lastPromptAtRef.current < GUEST_SAVE_PROMPT_COOLDOWN_MS) return

      const isFirstPrompt = lastPromptScoreRef.current === 0
      const scoreDeltaReached = scoreNow - lastPromptScoreRef.current >= GUEST_SAVE_PROMPT_SCORE_DELTA
      const levelDeltaReached = opts.level - lastPromptLevelRef.current >= GUEST_SAVE_PROMPT_LEVEL_DELTA
      if (!isFirstPrompt && !scoreDeltaReached && !levelDeltaReached) return

      setShowGuestSavePrompt(true)
      promptCountRef.current += 1
      lastPromptAtRef.current = now
      lastPromptScoreRef.current = scoreNow
      lastPromptLevelRef.current = opts.level
    }, 5000)

    return () => clearInterval(timer)
  }, [
    opts.gameStarted,
    opts.authStatus,
    opts.isGameOver,
    opts.showQuiz,
    opts.showAuthModal,
    opts.showUsernameModal,
    opts.hasRecoveryOverlay,
    opts.showLearnMore,
    opts.score,
    opts.level,
    opts.liveScoreRef,
    showGuestSavePrompt,
  ])

  return {
    showGuestSavePrompt,
    setShowGuestSavePrompt,
  }
}
