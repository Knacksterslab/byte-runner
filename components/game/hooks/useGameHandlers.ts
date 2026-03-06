import { useRef } from 'react'
import { getProtectionKitForThreat } from '@/lib/game/protectionKits'
import { trackGameStart, trackQuizPass, trackQuizFail } from '@/lib/analytics'
import { cgGameplayStart, cgGameplayStop } from '@/lib/crazygames'
import { audioManager } from '@/lib/audio'
import { ALL_KIT_TYPES } from '@/lib/game/gameConstants'

interface GameHandlerOptions {
  authStatus: string
  currentUser: { username?: string | null } | null
  lastThreatType: string | null
  savedGameState: { level: number; kits: Record<string, number>; score: number } | null
  timeoutRefs: React.MutableRefObject<ReturnType<typeof setTimeout>[]>
  setUsernameInput: (v: string) => void
  setShowUsernameModal: (v: boolean) => void
  resetGame: () => void
  setGameStarted: (v: boolean) => void
  setLevel: (v: number) => void
  setSavedGameState: (v: { level: number; kits: Record<string, number>; score: number } | null) => void
  setShowQuiz: (v: boolean) => void
  setScore: (v: number) => void
  setGameOver: (v: boolean) => void
  startNewRun: () => void
}

export interface GameHandlers {
  handleStart: () => void
  handleRestart: () => void
  handleQuizPass: () => void
  handleQuizFail: () => void
}

export function useGameHandlers(opts: GameHandlerOptions): GameHandlers {
  // Stable ref to always have the latest options without re-creating handlers
  const optsRef = useRef(opts)
  optsRef.current = opts

  const handleStart = () => {
    const o = optsRef.current
    if (o.authStatus === 'authed' && !o.currentUser?.username) {
      o.setUsernameInput('')
      o.setShowUsernameModal(true)
      return
    }
    trackGameStart()
    cgGameplayStart()
    audioManager.play('game-start')
    audioManager.playMusic()
    o.resetGame()
    o.setGameStarted(true)
    o.setLevel(1)
    o.startNewRun()
  }

  const handleRestart = () => {
    const o = optsRef.current
    cgGameplayStart()
    audioManager.playMusic()
    o.resetGame()
    o.setSavedGameState(null)
    o.setShowQuiz(false)
    o.setGameStarted(true)
    o.setLevel(1)
    o.startNewRun()
  }

  const handleQuizPass = () => {
    const o = optsRef.current
    if (o.lastThreatType) {
      const kit = getProtectionKitForThreat(o.lastThreatType)
      if (kit) trackQuizPass(kit.id)
    }
    o.setShowQuiz(false)
    if (o.savedGameState) {
      o.setLevel(o.savedGameState.level)
      o.setScore(o.savedGameState.score)
    }
    audioManager.play('quiz-pass')
    o.setGameOver(false)
    o.setGameStarted(true)
    cgGameplayStart()
    audioManager.playMusic()
    const tid = setTimeout(() => o.setSavedGameState(null), 500)
    o.timeoutRefs.current.push(tid)
  }

  const handleQuizFail = () => {
    const o = optsRef.current
    if (o.lastThreatType) {
      const kit = getProtectionKitForThreat(o.lastThreatType)
      if (kit) trackQuizFail(kit.id)
    }
    o.setShowQuiz(false)
    if (o.savedGameState) {
      const partialKits = ALL_KIT_TYPES.reduce((acc, kitId) => {
        acc[kitId] = Math.floor((o.savedGameState!.kits[kitId] || 0) / 2)
        return acc
      }, {} as Record<string, number>)
      o.setSavedGameState({ level: 1, kits: partialKits, score: 0 })
    }
    audioManager.play('quiz-fail')
    cgGameplayStart()
    audioManager.playMusic()
    o.resetGame()
    o.setGameStarted(true)
    o.setLevel(1)
    o.startNewRun()
    const tid = setTimeout(() => o.setSavedGameState(null), 100)
    o.timeoutRefs.current.push(tid)
  }

  return { handleStart, handleRestart, handleQuizPass, handleQuizFail }
}
