'use client'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/store/gameStore'
import { getProtectionKitById, getProtectionKitForThreat } from '@/lib/game/protectionKits'
import { getActiveContests, type Contest } from '@/lib/api/backend'
import { useAssetLoader } from './hooks/useAssetLoader'
import { isCrazyGames } from '@/lib/crazygames'
import { audioManager } from '@/lib/audio'
import { useAuth } from './hooks/useAuth'
import { useLeaderboard } from './hooks/useLeaderboard'
import { useQuizState } from './hooks/useQuizState'
import { useTutorialState } from './hooks/useTutorialState'
import { useUIState } from './hooks/useUIState'
import { useGameLoop } from './hooks/useGameLoop'
import { useGameHandlers } from './hooks/useGameHandlers'
import { useGuestSavePrompt } from './hooks/useGuestSavePrompt'
import type { RecoveryOverlayState } from './hooks/useGameLoopTypes'
import { getDailyChallenge, type DailyChallenge } from '@/lib/api/daily'
import { getMyBalance } from '@/lib/api/balance'
import { setActiveDailyModifiers } from '@/lib/game/inGameQuizzes'
import { reportQuizResult } from '@/lib/game/weaknessProfile'
import { beginDrillSession } from '@/lib/api/drills'
import { TypingDrill } from './drills/TypingDrill'
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
  const [savedGameState, setSavedGameState] = useState<{ level: number; kits: Record<string, number>; score: number } | null>(() => {
    // Cross-session resume: restore the banked run (if any).
    try {
      const raw = localStorage.getItem('byterunner:savedRun')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })
  const [isFirstDeath, setIsFirstDeath] = useState(true)
  const [activeContests, setActiveContests] = useState<Contest[]>([])
  const [daily, setDaily] = useState<DailyChallenge | null>(null)
  const [pointBalance, setPointBalance] = useState<number | null>(null)
  const [showIncidentIntro, setShowIncidentIntro] = useState(false)
  const [typingDrillTopic, setTypingDrillTopic] = useState<'password' | 'authentication' | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [recoveryOverlay, setRecoveryOverlay] = useState<RecoveryOverlayState | null>(null)
  const pausedRef = useRef(false)
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
  const muted = useSyncExternalStore(
    (cb) => audioManager.subscribe(cb),
    () => audioManager.isMuted(),
    () => false
  )

  const {
    authStatus, currentUser,
    showAuthModal, authMode, authEmail, authPassword, authError, authInfo, authLoading,
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
  useEffect(() => { if (showQuiz) void beginDrillSession() }, [showQuiz])
  useEffect(() => { guestSavePromptActiveRef.current = showGuestSavePrompt }, [showGuestSavePrompt])
  useEffect(() => {
    authFlowActiveRef.current = showAuthModal || showUsernameModal
  }, [showAuthModal, showUsernameModal])

  useEffect(() => {
    let active = true
    getActiveContests().then((c) => { if (active) setActiveContests(c) }).catch(() => {})
    getDailyChallenge().then((d) => {
      if (!active) return
      setDaily(d)
      // Generated quizzes skew toward today's incident topic.
      setActiveDailyModifiers(d ? d.modifiers : null)
    }).catch(() => {})
    return () => { active = false }
  }, [])

  // Points balance (1 pt = 1¢) for signed-in players.
  useEffect(() => {
    if (authStatus !== 'authed') { setPointBalance(null); return }
    let active = true
    getMyBalance()
      .then((b) => { if (active) setPointBalance(b.balanceCents) })
      .catch(() => { if (active) setPointBalance(null) })
    return () => { active = false }
  }, [authStatus, currentUser])

  // Incident intro banner: show once per session when a run starts on an
  // incident day, auto-dismiss.
  useEffect(() => {
    if (gameStarted && daily) {
      setShowIncidentIntro(true)
      const tid = setTimeout(() => setShowIncidentIntro(false), 5500)
      timeoutRefs.current.push(tid)
      return () => clearTimeout(tid)
    }
  }, [gameStarted, daily])

  // Banked-run persistence: write-through to localStorage.
  useEffect(() => {
    try {
      if (savedGameState) localStorage.setItem('byterunner:savedRun', JSON.stringify(savedGameState))
      else localStorage.removeItem('byterunner:savedRun')
    } catch { /* storage unavailable */ }
  }, [savedGameState])

  // Checkpoint on level-up so quitting mid-session still resumes at level.
  useEffect(() => {
    if (gameStarted && !isGameOver && level > 1) {
      setSavedGameState((prev) => prev && prev.level === level ? prev : { level, score: liveScoreRef.current, kits: {} })
    }
  }, [level, gameStarted, isGameOver, liveScoreRef])

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
    if (params.get('drill') === 'typing') {
      setTypingDrillTopic('password')
      router.replace('/')
    }
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
    pausedRef, onPauseChange: setIsPaused,
    dailyModifiers: daily ? daily.modifiers : null,
  })

  if (!isMounted) return null
  if (isLoading) return <LoadingScreen progress={loadProgress} />


  if (!gameStarted) {
    return (
      <>
      <StartScreenView
        tutorialShowing={tutorial.state.showing}
        onCloseTutorial={tutorial.actions.close}
        onStart={handleStart}
        onShowTutorial={tutorial.actions.open}
        onSignIn={isCrazyGames() ? undefined : (authStatus === 'authed' ? handleSignOut : () => setShowAuthModal(true))}
        signInLabel={isCrazyGames() ? undefined : (authStatus === 'authed' ? `Signed in as ${currentUser?.username || 'Player'} • Sign out` : 'Guest • Sign in')}
        activeContests={activeContests}
        pointBalance={pointBalance}
        dailyChallenge={daily}
        username={currentUser?.username ?? undefined}
        isAuthenticated={authStatus === 'authed'}
        onRequestSetUsername={() => { setUsernameInput(''); setShowUsernameModal(true) }}
        showAuthModal={showAuthModal}
        authMode={authMode}
        authEmail={authEmail}
        authPassword={authPassword}
        authError={authError}
        authInfo={authInfo}
        authLoading={authLoading}
        onEmailChange={setAuthEmail}
        onPasswordChange={setAuthPassword}
        onSubmitAuth={handleAuthSubmit}
        onToggleAuthMode={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
        onForgotPassword={() => setAuthMode('forgot')}
        onBackToSignIn={() => setAuthMode('signin')}
        onCloseAuthModal={() => setShowAuthModal(false)}
        showUsernameModal={showUsernameModal}
        usernameInput={usernameInput}
        usernameError={usernameError}
        usernameLoading={usernameLoading}
        onUsernameChange={setUsernameInput}
        onSubmitUsername={handleUsernameSubmit}
        onCloseUsernameModal={() => setShowUsernameModal(false)}
      />
      </>
    )
  }

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden pt-[env(safe-area-inset-top)]">
      {showAuthModal && (
        <AuthModal
          mode={authMode} email={authEmail} password={authPassword}
          error={authError} info={authInfo} loading={authLoading}
          onEmailChange={setAuthEmail} onPasswordChange={setAuthPassword}
          onSubmit={handleAuthSubmit} onToggleMode={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
          onForgotPassword={() => setAuthMode('forgot')}
          onBackToSignIn={() => setAuthMode('signin')}
          onClose={() => setShowAuthModal(false)}
        />
      )}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" tabIndex={0} />
      {typingDrillTopic && (
        <TypingDrill
          topic={typingDrillTopic}
          onComplete={(passed, score) => {
            const topic = typingDrillTopic
            setTypingDrillTopic(null)
            setShowQuiz(false)
            reportQuizResult(topic, passed, { format: 'typing', skipLocalMiss: true })
            void score
            if (passed) handleQuizPass()
            else handleQuizFail()
          }}
        />
      )}
      {showIncidentIntro && daily && !isGameOver && (
        <button
          onClick={() => setShowIncidentIntro(false)}
          className="absolute left-1/2 top-[18%] z-40 w-[min(92vw,480px)] -translate-x-1/2 rounded-xl border border-amber-400/60 bg-[#1a1205]/95 px-4 py-3 text-center shadow-[0_0_28px_rgba(251,191,36,0.35)]"
        >
          <p className="font-mono text-[11px] tracking-[0.25em] text-amber-300 uppercase">
            ⚡ {daily.name} in effect
          </p>
          <p className="mt-1 text-xs text-slate-300">{daily.description}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            {daily.modifiers.boostedThreats.slice(0, 2).map((t) => (
              <span key={t} className="rounded-full border border-rose-400/40 bg-rose-500/10 px-2 py-0.5 font-mono text-[10px] text-rose-300">
                ▲ {t.replace(/-/g, ' ')}
              </span>
            ))}
            {daily.modifiers.scarceKits.slice(0, 1).map((k) => (
              <span key={k} className="rounded-full border border-sky-400/40 bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] text-sky-300">
                ▼ {k.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
          <p className="mt-1.5 font-mono text-[9px] text-slate-500">tap to dismiss — runs today count toward the daily leaderboard</p>
        </button>
      )}
      {!isGameOver && !showQuiz && !isPaused && (
        <button
          onClick={() => { pausedRef.current = true }}
          aria-label="Pause game"
          className="fixed z-30 flex h-[48px] w-[48px] sm:h-[54px] sm:w-[54px] items-center justify-center rounded-[10px] border border-cyan-300/60 bg-[#0a1a24]/80 text-lg sm:text-xl text-cyan-200 shadow-[0_0_22px_rgba(0,255,255,0.45)] transition hover:scale-105 touch-manipulation"
          style={{ right: 'max(16px, calc(env(safe-area-inset-right) + 76px))', top: 'max(12px, calc(env(safe-area-inset-top) + 8px))' }}
        >
          ⏸
        </button>
      )}
      {isPaused && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm">
          <p className="font-mono text-3xl sm:text-4xl font-black tracking-[0.3em] text-cyan-200">
            PAUSED
          </p>
          <p className="mt-2 font-mono text-[11px] text-slate-400">Progress is safe — threats are frozen</p>
          <button
            onClick={() => { pausedRef.current = false }}
            className="mt-6 rounded-full border border-cyan-100/55 bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 px-8 py-3 font-black font-mono tracking-[0.12em] text-white shadow-[0_0_26px_rgba(80,200,255,0.55)] transition hover:scale-105"
          >
            ▶ RESUME
          </button>
          <p className="mt-3 font-mono text-[10px] text-slate-500">or press P / Esc</p>
        </div>
      )}
      <button
        onClick={() => audioManager.toggleMute()}
        aria-label={muted ? 'Unmute' : 'Mute'}
        className="fixed z-30 flex h-[48px] w-[48px] sm:h-[54px] sm:w-[54px] items-center justify-center rounded-[10px] border border-cyan-300/60 bg-[#0a1a24]/80 text-xl sm:text-2xl text-cyan-200 shadow-[0_0_22px_rgba(0,255,255,0.45)] transition hover:scale-105 touch-manipulation"
        style={{ right: 'max(16px, calc(env(safe-area-inset-right) + 16px))', top: 'max(12px, calc(env(safe-area-inset-top) + 8px))' }}
      >
        {muted ? '🔇' : '🔊'}
      </button>
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
                  if (isCrazyGames()) {
                    window.open('/profile', '_blank', 'noopener,noreferrer')
                  } else {
                    router.push('/profile')
                  }
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
          onPass={() => {
            const kit = getProtectionKitForThreat(lastThreatType)
            if (kit) reportQuizResult(kit.protectsAgainst, true)
            handleQuizPass()
          }}
          onFail={() => {
            const kit = getProtectionKitForThreat(lastThreatType)
            const topic = kit?.protectsAgainst
            if (topic === 'password' || topic === 'authentication') {
              // Remediation: the typing drill is the second chance that teaches
              setTypingDrillTopic(topic)
              return
            }
            if (kit && topic) reportQuizResult(topic, false)
            handleQuizFail()
          }}
        />
      )}
    </div>
  )
}
