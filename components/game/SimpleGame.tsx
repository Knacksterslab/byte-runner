'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/store/gameStore'
import { getProtectionKitById, getProtectionKitForThreat } from '@/lib/game/protectionKits'
import { getActiveContests, type Contest } from '@/lib/api/backend'
import { useAssetLoader } from './hooks/useAssetLoader'
import { useAuth } from './hooks/useAuth'
import { useLeaderboard } from './hooks/useLeaderboard'
import { useQuizState } from './hooks/useQuizState'
import { useTutorialState } from './hooks/useTutorialState'
import { useUIState } from './hooks/useUIState'
import { useGameLoop } from './hooks/useGameLoop'
import { useGameHandlers } from './hooks/useGameHandlers'
import { useGuestSavePrompt } from './hooks/useGuestSavePrompt'
import type { RecoveryOverlayState } from './hooks/useGameLoopTypes'
import { LoadingScreen } from './ui/LoadingScreen'
import { StartScreenView } from './ui/StartScreenView'
import { RecoveryOverlaySheet } from './ui/RecoveryOverlaySheet'
import { GuestSavePrompt } from './ui/GuestSavePrompt'
import { GameOverScreen } from './ui/GameOverScreen'
import { LearnMoreModal } from './ui/LearnMoreModal'
import QuizModal from './QuizModal'
import { AuthModal } from './ui/AuthModal'
import { UsernameModal } from './ui/UsernameModal'

export default function SimpleGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [level, setLevel] = useState(1)
  const [bonusKitType, setBonusKitType] = useState<string | null>(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [savedGameState, setSavedGameState] = useState<{ level: number; kits: Record<string, number>; score: number } | null>(null)
  const [isFirstDeath, setIsFirstDeath] = useState(true)
  const [activeContests, setActiveContests] = useState<Contest[]>([])
  const [recoveryOverlay, setRecoveryOverlay] = useState<RecoveryOverlayState | null>(null)
  const showQuizOverlayRef = useRef(false)
  const guestSavePromptActiveRef = useRef(false)
  const authFlowActiveRef = useRef(false)
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])

  const quiz = useQuizState()
  const tutorial = useTutorialState()
  const ui = useUIState()
  const router = useRouter()
  const {
    distance, score, isGameOver, lastAttacker, lastThreatType,
    setDistance, setScore, setGameOver, setRunning, setLastAttacker,
    resetGame, addLeaderboardEntry, setLeaderboard,
  } = useGameStore()
  const { isMounted, isLoading, loadProgress } = useAssetLoader()

  const {
    authStatus, currentUser,
    showAuthModal, authMode, authEmail, authPassword, authError, authLoading,
    showUsernameModal, usernameInput, usernameError, usernameLoading,
    setShowAuthModal, setShowUsernameModal, setAuthMode, setAuthEmail, setAuthPassword, setUsernameInput,
    handleAuthSubmit, handleUsernameSubmit, handleSignOut,
  } = useAuth({
    onSignedIn: async (user) => {
      if (pendingSave) {
        setPendingSave(false)
        await handleSaveToLeaderboard(user, isGameOver ? 'death' : 'checkpoint')
      }
      setShowGuestSavePrompt(false)
    },
    onUsernameSet: () => resetSaveState(false),
    onSignOut: () => resetSaveState(true),
  })

  const {
    pendingSave, setPendingSave,
    activeBadgeToast, setActiveBadgeToast,
    liveScoreRef, liveDistanceRef,
    handleSaveToLeaderboard, resetSaveState, startNewRun,
  } = useLeaderboard({
    authStatus, currentUser, gameStarted, isGameOver, showQuiz,
    score, distance, addLeaderboardEntry, setLeaderboard,
    onNeedAuth: () => setShowAuthModal(true),
    onNeedUsername: () => { setUsernameInput(''); setShowUsernameModal(true) },
  })

  const { showGuestSavePrompt, setShowGuestSavePrompt } = useGuestSavePrompt({
    gameStarted,
    authStatus,
    isGameOver,
    showQuiz,
    showAuthModal,
    showUsernameModal,
    hasRecoveryOverlay: !!recoveryOverlay,
    showLearnMore: ui.state.showLearnMore,
    score,
    level,
    liveScoreRef,
  })

  const { handleStart, handleRestart, handleQuizPass, handleQuizFail } = useGameHandlers({
    authStatus, currentUser, lastThreatType, savedGameState, timeoutRefs,
    setUsernameInput, setShowUsernameModal, resetGame, setGameStarted, setLevel,
    setSavedGameState, setShowQuiz, setScore, setGameOver,
    startNewRun,
  })

  useEffect(() => { showQuizOverlayRef.current = showQuiz }, [showQuiz])
  useEffect(() => { guestSavePromptActiveRef.current = showGuestSavePrompt }, [showGuestSavePrompt])
  useEffect(() => {
    authFlowActiveRef.current = showAuthModal || showUsernameModal
  }, [showAuthModal, showUsernameModal])

  useEffect(() => {
    let active = true
    getActiveContests().then((c) => { if (active) setActiveContests(c) }).catch(() => {})
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (bonusKitType) {
      ui.actions.showBonus(5000)
      const tid = setTimeout(() => setBonusKitType(null), 100)
      timeoutRefs.current.push(tid)
    }
  }, [bonusKitType])

  useEffect(() => {
    if (!isMounted || isLoading || gameStarted) return
    const params = new URLSearchParams(window.location.search)
    if (params.get('play') === 'true') {
      const tid = setTimeout(() => { handleStart(); router.replace('/') }, 100)
      return () => clearTimeout(tid)
    }
  }, [isMounted, isLoading, gameStarted])

  useGameLoop({
    canvasRef, gameStarted, savedGameState, bonusKitType, quiz, ui, timeoutRefs,
    authStatus, currentUser, handleSignOut, showQuizOverlayRef, guestSavePromptActiveRef, authFlowActiveRef, liveScoreRef, liveDistanceRef,
    setShowAuthModal, setRecoveryOverlay,
    setLevel, setSavedGameState, setIsFirstDeath, isGameOver, lastThreatType, isFirstDeath,
    lastAttacker, setScore, setDistance, setGameOver, setRunning, setLastAttacker, resetGame,
    addLeaderboardEntry, setLeaderboard,
  })

  if (!isMounted) return null
  if (isLoading) return <LoadingScreen progress={loadProgress} />

  if (!gameStarted) {
    return (
      <StartScreenView
        tutorialShowing={tutorial.state.showing}
        onCloseTutorial={tutorial.actions.close}
        onStart={handleStart}
        onShowTutorial={tutorial.actions.open}
        onSignIn={authStatus === 'authed' ? handleSignOut : () => setShowAuthModal(true)}
        signInLabel={authStatus === 'authed' ? `Signed in as ${currentUser?.username || 'Player'} • Sign out` : 'Guest • Sign in'}
        activeContests={activeContests}
        username={currentUser?.username ?? undefined}
        isAuthenticated={authStatus === 'authed'}
        onRequestSetUsername={() => { setUsernameInput(''); setShowUsernameModal(true) }}
        showAuthModal={showAuthModal}
        authMode={authMode}
        authEmail={authEmail}
        authPassword={authPassword}
        authError={authError}
        authLoading={authLoading}
        onEmailChange={setAuthEmail}
        onPasswordChange={setAuthPassword}
        onSubmitAuth={handleAuthSubmit}
        onToggleAuthMode={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
        onCloseAuthModal={() => setShowAuthModal(false)}
        showUsernameModal={showUsernameModal}
        usernameInput={usernameInput}
        usernameError={usernameError}
        usernameLoading={usernameLoading}
        onUsernameChange={setUsernameInput}
        onSubmitUsername={handleUsernameSubmit}
        onCloseUsernameModal={() => setShowUsernameModal(false)}
      />
    )
  }

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden pt-[env(safe-area-inset-top)]">
      {showAuthModal && (
        <AuthModal
          mode={authMode} email={authEmail} password={authPassword}
          error={authError} loading={authLoading}
          onEmailChange={setAuthEmail} onPasswordChange={setAuthPassword}
          onSubmit={handleAuthSubmit} onToggleMode={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
          onClose={() => setShowAuthModal(false)}
        />
      )}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" tabIndex={0} />
      {showGuestSavePrompt && authStatus !== 'authed' && !isGameOver && !showQuiz && (
        <GuestSavePrompt
          onSignInAndSave={() => {
            setPendingSave(true)
            setShowGuestSavePrompt(false)
            setShowAuthModal(true)
          }}
          onLater={() => setShowGuestSavePrompt(false)}
        />
      )}
      {activeBadgeToast && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 w-[min(92vw,520px)]">
          <div className="rounded-xl border border-emerald-300/60 bg-[#05150f]/95 px-4 py-3 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
            <div className="flex items-center gap-3">
              <span className="text-xl leading-none" aria-hidden>🏅</span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[11px] tracking-widest text-emerald-200/90 uppercase">Badge Unlocked</p>
                <p className="font-mono text-sm text-white truncate">{activeBadgeToast.replace(/^Badge Unlocked:\s*/i, '')} earned!</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveBadgeToast(null)
                  router.push('/profile')
                }}
                className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-mono font-bold tracking-wide text-white hover:bg-emerald-400 transition-colors"
              >
                View badges
              </button>
            </div>
          </div>
        </div>
      )}
      {recoveryOverlay && (
        <RecoveryOverlaySheet
          overlay={recoveryOverlay}
        />
      )}
      {isGameOver && !showQuiz && (
        <GameOverScreen
          lastAttacker={lastAttacker}
          lastThreatType={lastThreatType}
          level={level}
          score={score}
          authStatus={authStatus}
          currentUser={currentUser}
          onContinueRun={() => setShowQuiz(true)}
          onRestart={handleRestart}
          onSignInToSave={() => { setPendingSave(true); setShowAuthModal(true) }}
          onLearnMore={ui.actions.toggleLearnMore}
        />
      )}
      {showUsernameModal && (
        <UsernameModal
          username={usernameInput} error={usernameError} loading={usernameLoading}
          onUsernameChange={setUsernameInput} onSubmit={handleUsernameSubmit}
          onClose={() => setShowUsernameModal(false)}
        />
      )}
      {ui.state.showLearnMore && lastThreatType && (
        <LearnMoreModal lastThreatType={lastThreatType} onClose={(awardKit) => {
          if (awardKit) {
            const kit = getProtectionKitById(lastThreatType)
            if (kit) setBonusKitType(kit.id)
          }
          ui.actions.toggleLearnMore()
        }} />
      )}
      {ui.state.showBonusNotification && bonusKitType && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 border-4 border-yellow-400 rounded-lg px-8 py-4 z-20 animate-bounce">
          <p className="text-yellow-300 text-2xl font-bold text-center">🎁 BONUS REWARD ACTIVE!</p>
          <p className="text-white text-lg text-center mt-2">
            Starting with +1 {getProtectionKitById(bonusKitType)?.emoji} {getProtectionKitById(bonusKitType)?.name} Kit!
          </p>
          <p className="text-yellow-200 text-sm text-center mt-1 italic">You earned this by learning!</p>
        </div>
      )}
      {showQuiz && lastThreatType && (
        <QuizModal
          kitType={getProtectionKitForThreat(lastThreatType)?.id || 'password-manager'}
          level={level}
          onPass={handleQuizPass}
          onFail={handleQuizFail}
        />
      )}
    </div>
  )
}
