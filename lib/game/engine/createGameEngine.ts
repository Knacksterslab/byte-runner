import { initGameState } from './initGameState'
import { trackFramePerformance } from './adaptiveQuality'
import { drawBackground, updateConfetti, drawConfetti, spawnConfetti } from './GameBackground'
import { drawTutorialOverlay } from './GameTutorial'
import { renderQuizOverlay } from './GameQuizOverlay'
import { drawHUD, drawThreatPanel } from './GameHUD'
import { updateObstacles, updateKits } from './GameObjects'
import { updateAndRenderPlayer } from './GamePlayer'
import { spawnObstacle, spawnKit, getRequiredKit, returnObstacleToPool } from './GameSpawn'
import {
  startPreQuizTeaching, startInGameQuiz, endInGameQuiz, endInGameQuizWrongAnswer, spawnQuizItems,
  checkQuizCompletion, advanceLevel,
} from './GameQuizLogic'
import { getDifficultyForLevel } from '../difficulty'
import { drawLevelUpOverlay } from '../renderers/levelUpOverlay'
import { drawTurboBoostCelebration } from '../renderers/turboBoostOverlay'
import { drawSectorChangeOverlay } from '../renderers/sectorChangeOverlay'
import { drawRestorationOverlay } from '../renderers/restorationOverlay'
import { drawQuizCompletionMessage } from '../renderers/quizCompletionOverlay'
import { drawPreQuizTeachingOverlay } from '../renderers/preQuizTeachingOverlay'
import { trackGameOver, trackKitCollected } from '@/lib/analytics'
import type { UseGameLoopOptions } from '../../../components/game/hooks/useGameLoopTypes'

export function createGameEngine(
  canvas: HTMLCanvasElement,
  opts: UseGameLoopOptions
): () => void {
  const { quiz, ui, timeoutRefs, liveScoreRef, liveDistanceRef } = opts
  const s = initGameState(canvas, opts)

  let resizeObserver: ResizeObserver | null = null
  function resizeCanvas() {
    const container = canvas.parentElement
    let cssW: number, cssH: number
    if (container) {
      cssW = container.clientWidth; cssH = container.clientHeight
      const top = parseFloat(window.getComputedStyle(container).paddingTop || '0')
      s.safeTopInset = Number.isFinite(top) ? Math.max(0, top) : 0
    } else {
      cssW = window.visualViewport?.width ?? window.innerWidth
      cssH = window.visualViewport?.height ?? window.innerHeight
      s.safeTopInset = 0
    }
    // Retina/mobile sharpness: backing store = logical size × devicePixelRatio
    // (capped at 2 for fill-rate), while all game math stays in logical pixels.
    s.logicalWidth = cssW; s.logicalHeight = cssH
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.max(1, Math.floor(cssW * dpr))
    canvas.height = Math.max(1, Math.floor(cssH * dpr))
    // Assigning canvas.width resets context state — re-apply base transform.
    s.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    s.ctx.imageSmoothingEnabled = false
  }
  resizeCanvas()
  // Now that canvas has real dimensions, place the player in the true centre.
  s.playerX = s.logicalWidth / 2
  s.playerY = s.logicalHeight / 2
  s.previousPlayerX = s.logicalWidth / 2
  s.previousPlayerY = s.logicalHeight / 2
  window.addEventListener('resize', resizeCanvas)
  window.visualViewport?.addEventListener('resize', resizeCanvas)
  window.visualViewport?.addEventListener('scroll', resizeCanvas)
  const container = canvas.parentElement
  if (container) { resizeObserver = new ResizeObserver(resizeCanvas); resizeObserver.observe(container) }

  // ── Pause (button / P / Esc / auto on tab blur). Never during a quiz. ──
  function setPaused(next: boolean): void {
    if (next && (quiz.refs.activeRef.current || opts.isGameOver || s.isHealing)) return
    if (s.paused === next) return
    s.paused = next
    opts.pausedRef.current = next
    opts.onPauseChange(next)
    if (!next) s.lastGameFrameTs = 0 // avoid a giant frame delta on resume
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') { setPaused(!s.paused); return }
    s.keys[e.key] = true
  }
  const handleKeyUp = (e: KeyboardEvent) => { s.keys[e.key] = false }
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  const handleVisibility = () => { if (document.hidden) setPaused(true) }
  document.addEventListener('visibilitychange', handleVisibility)
  window.addEventListener('blur', handleVisibility)

  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault(); const t = e.touches[0]
    s.touchStartX = t.clientX; s.touchStartY = t.clientY
    if (s.logicalWidth < 768) {
      const hudX = s.logicalWidth - (ui.state.mobileHudExpanded ? 130 : 110); const hudY = 80
      const hudW = ui.state.mobileHudExpanded ? 130 : 100; const hudH = ui.state.mobileHudExpanded ? 210 : 80
      if (t.clientX >= hudX && t.clientX <= hudX + hudW && t.clientY >= hudY && t.clientY <= hudY + hudH) {
        ui.actions.setMobileHudExpanded(!ui.state.mobileHudExpanded); return
      }
    }
    s.isTouching = true
  }
  const handleTouchMove = (e: TouchEvent) => {
    const isGuestSavePromptActive = opts.guestSavePromptActiveRef.current
    const isAuthFlowActive = opts.authFlowActiveRef.current
    const isUiPaused = isGuestSavePromptActive || isAuthFlowActive
    if (!s.isTouching || s.isHealing || s.showingTutorial || s.isRestoring || isUiPaused) return
    e.preventDefault(); const t = e.touches[0]
    s.playerX += (t.clientX - s.touchStartX) * 0.8; s.playerY += (t.clientY - s.touchStartY) * 0.8
    s.touchStartX = t.clientX; s.touchStartY = t.clientY
  }
  const handleTouchEnd = (e: TouchEvent) => { e.preventDefault(); s.isTouching = false }
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
  canvas.addEventListener('touchend', handleTouchEnd, { passive: false })
  canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false })

  const quizCb = {
    setLevel: opts.setLevel, timeoutRefs,
    quizStartQuiz: (level: number) => quiz.actions.startQuiz(level),
    quizMarkCompleted: () => quiz.actions.markCompleted(),
    quizEndQuiz: () => quiz.actions.endQuiz(),
    quizActiveRef: () => quiz.refs.activeRef.current,
  }
  const doSpawnQuizItems = (qc: Parameters<typeof spawnQuizItems>[1]) => spawnQuizItems(s, qc)
  const doAdvanceLevel = () => advanceLevel(s, quizCb,
    (qc, lv, auto) => startPreQuizTeaching(s, qc, lv, auto),
    (qc) => startInGameQuiz(s, qc, quizCb, doSpawnQuizItems)
  )
  const objectCb = {
    trackKitCollected, advanceLevel: doAdvanceLevel,
    spawnConfetti: (x: number, y: number, n: number) => spawnConfetti(s, x, y, n),
    showTutorial: (kitType: string, threatId: string) => {
      s.showingTutorial = true; s.tutorialKit = kitType
      s.tutorialTimer = s.TUTORIAL_DURATION; s.lastHitThreatId = threatId; s.isHealing = true
    },
    setLastAttacker: opts.setLastAttacker,
    returnObstacleToPool, getRequiredKit,
    setSavedGameState: opts.setSavedGameState, setScore: opts.setScore,
    setGameOver: opts.setGameOver, setRunning: opts.setRunning,
    setIsFirstDeath: opts.setIsFirstDeath, trackGameOver,
    quizCollectItem: quiz.actions.collectItem,
    isQuizActive: () => quiz.refs.activeRef.current && quiz.refs.countdownRef.current === 0,
    isFirstDeath: opts.isFirstDeath, lastAttacker: opts.lastAttacker,
    quizCorrectAnswers: () => quiz.refs.currentQuizRef.current?.correctAnswers ?? [],
    endQuizWrongAnswer: (wrongItemId: string) => endInGameQuizWrongAnswer(s, wrongItemId, quiz.refs.currentQuizRef.current ?? null, quizCb),
  }

  function gameLoop(timestamp: number) {
    if (!s.ctx) return
    const isGuestSavePromptActive = opts.guestSavePromptActiveRef.current
    const isAuthFlowActive = opts.authFlowActiveRef.current
    const isUiPaused = isGuestSavePromptActive || isAuthFlowActive
    // Sync pause from the shared ref (React button / resume overlay).
    if (opts.pausedRef.current !== s.paused) {
      if (opts.pausedRef.current) {
        if (quiz.refs.activeRef.current || opts.isGameOver || s.isHealing) {
          opts.pausedRef.current = false // refuse: quiz/game-over/healing
          opts.onPauseChange(false)
        } else {
          s.paused = true
          opts.onPauseChange(true)
        }
      } else {
        s.paused = false
        s.lastGameFrameTs = 0
        opts.onPauseChange(false)
      }
    }
    if (s.paused) {
      // Idles the loop: no updates, no timers advance; canvas keeps last frame.
      s.lastGameFrameTs = timestamp
      if (!opts.isGameOver) s.animationId = requestAnimationFrame(gameLoop)
      return
    }
    // PERF: cap rendering at ~60fps — on 120Hz+ displays the RAF callback
    // fires twice per target frame, doubling all render work and heat.
    if (s.lastRenderTs && timestamp - s.lastRenderTs < 15) {
      if (!opts.isGameOver) s.animationId = requestAnimationFrame(gameLoop)
      return
    }
    s.lastRenderTs = timestamp
    const frameMs = s.lastGameFrameTs ? timestamp - s.lastGameFrameTs : 16.67
    s.lastGameFrameTs = timestamp; s.frameScale = Math.min(frameMs / 16.67, 10); s.gameFrameCount++
    if (!isUiPaused && !s.isHealing) trackFramePerformance(s, frameMs)
    s.speedFactor = Math.min(1.6, Math.max(0.55, 0.55 + (s.currentLevel - 1) * 0.06))
    s.effectiveObstacleSpeed = s.obstacleSpeed * s.threatSpeedFactor
    s.effectivePlayerSpeed = s.playerSpeed * s.speedFactor; s.effectiveSpawnFrequency = s.spawnFrequency
    const slowMo = (quiz.refs.activeRef.current && quiz.refs.countdownRef.current === 0) ? 0.15 : 1.0
    if (s.isHealing) {
      drawTutorialOverlay(s, opts.lastThreatType, opts.setRecoveryOverlay)
      if (!opts.isGameOver) s.animationId = requestAnimationFrame(gameLoop)
      return
    }
    drawBackground(s)
    if (quiz.refs.activeRef.current && quiz.refs.currentQuizRef.current) {
      renderQuizOverlay(s, { currentQuizRef: quiz.refs.currentQuizRef, countdownRef: quiz.refs.countdownRef, activeRef: quiz.refs.activeRef, pointsRef: quiz.refs.pointsRef, timeRemainingRef: quiz.refs.timeRemainingRef })
    }
    updateConfetti(s, frameMs); drawConfetti(s)
    if (quiz.refs.activeRef.current) {
      checkQuizCompletion(s, quiz.refs.activeRef.current, quiz.refs.completedRef.current, quiz.refs.countdownRef.current, quiz.refs.pointsRef.current, quiz.refs.currentQuizRef.current?.passingScore ?? 50,
        (ok) => endInGameQuiz(s, ok, quiz.refs.pointsRef.current, quizCb))
    }
    if (!s.isHealing && !s.isRestoring && !s.showingPreQuizTeaching && !isUiPaused) {
      if (s.keys['w'] || s.keys['W'] || s.keys['ArrowUp']) s.playerY -= s.effectivePlayerSpeed * s.frameScale
      if (s.keys['s'] || s.keys['S'] || s.keys['ArrowDown']) s.playerY += s.effectivePlayerSpeed * s.frameScale
      if (s.keys['a'] || s.keys['A'] || s.keys['ArrowLeft']) s.playerX -= s.effectivePlayerSpeed * s.frameScale
      if (s.keys['d'] || s.keys['D'] || s.keys['ArrowRight']) s.playerX += s.effectivePlayerSpeed * s.frameScale
    }
    s.playerX = Math.max(s.playerSize, Math.min(s.logicalWidth - s.playerSize, s.playerX))
    s.playerY = Math.max(s.playerSize, Math.min(s.logicalHeight - s.playerSize, s.playerY))
    const deltaX = s.playerX - s.previousPlayerX; const deltaY = s.playerY - s.previousPlayerY
    const isMoving = Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1
    const targetTilt = deltaX > 0 ? 10 : deltaX < 0 ? -10 : 0
    s.playerTilt += (targetTilt - s.playerTilt) * 0.2
    const animSpeed = isUiPaused ? 0 : (isMoving ? 0.25 : 0.1)
    if (s.celebrationTimer > 0) s.celebrationTimer -= frameMs
    if (s.victoryDanceTimer > 0) { s.victoryDanceTimer -= frameMs; if (s.victoryDanceTimer <= 0) s.isVictoryDancing = false }
    s.previousPlayerX = s.playerX; s.previousPlayerY = s.playerY
    if (s.levelUpTimer > 0) s.levelUpTimer -= Math.min(16, frameMs)
    if (s.levelUpTimer <= 0) s.showingLevelUp = false
    if (s.showingLevelUp && s.levelUpTimer > 0 && !quiz.refs.activeRef.current) {
      drawLevelUpOverlay(s.ctx, { width: s.logicalWidth, height: s.logicalHeight }, { levelUpTimer: s.levelUpTimer, LEVEL_UP_DURATION: s.LEVEL_UP_DURATION, currentLevel: s.currentLevel, totalKitsCollected: s.totalKitsCollected })
    }
    if (s.turboBoostCelebrationTimer > 0 && !quiz.refs.activeRef.current) {
      drawTurboBoostCelebration(s.ctx, { width: s.logicalWidth, height: s.logicalHeight }, { turboBoostCelebrationTimer: s.turboBoostCelebrationTimer, TURBO_BOOST_CELEBRATION_DURATION: s.TURBO_BOOST_CELEBRATION_DURATION, TURBO_BOOST_SCORE: s.TURBO_BOOST_SCORE })
      s.turboBoostCelebrationTimer -= 16
    }
    if (s.showingSectorChange && s.sectorChangeTimer > 0) {
      drawSectorChangeOverlay(s.ctx, { width: s.logicalWidth, height: s.logicalHeight }, { sectorChangeTimer: s.sectorChangeTimer, SECTOR_CHANGE_DURATION: s.SECTOR_CHANGE_DURATION, sectorChangeName: s.sectorChangeName, currentLevel: s.currentLevel })
      s.sectorChangeTimer -= 16
    } else { s.showingSectorChange = false }
    if (s.isRestoring && s.restorationTimer > 0) {
      drawRestorationOverlay(s.ctx, { width: s.logicalWidth, height: s.logicalHeight }, { restorationTimer: s.restorationTimer, RESTORATION_DURATION: s.RESTORATION_DURATION, lastThreatType: opts.lastThreatType })
      s.restorationTimer -= 16
    } else { s.isRestoring = false }
    if (s.showQuizCompletionMessage && s.quizCompletionTimer > 0) {
      drawQuizCompletionMessage(s.ctx, { width: s.logicalWidth, height: s.logicalHeight }, { quizCompletionTimer: s.quizCompletionTimer, quizCompletionSuccess: s.quizCompletionSuccess, finalPoints: quiz.refs.pointsRef.current, passingScore: quiz.refs.currentQuizRef.current?.passingScore || 50, quizWrongItemId: s.quizWrongItemId, quizFailChallenge: s.quizFailChallenge })
      s.quizCompletionTimer -= 16
    } else { s.showQuizCompletionMessage = false }
    if (s.showingPreQuizTeaching) {
      if (s.preQuizTeachingTimer <= 0) {
        s.showingPreQuizTeaching = false
        const qc = s.pendingQuizChallenge; const ql = s.pendingQuizLevel; const auto = s.pendingQuizAutoStart
        s.pendingQuizChallenge = null; s.pendingQuizLevel = null; s.pendingQuizAutoStart = false
        if (ql !== null) s.taughtQuizLevels.add(ql)
        if (auto && qc && !quiz.refs.activeRef.current) startInGameQuiz(s, qc, quizCb, doSpawnQuizItems)
      } else if (s.pendingQuizChallenge) {
        drawPreQuizTeachingOverlay(s.ctx, { width: s.logicalWidth, height: s.logicalHeight }, { preQuizTeachingTimer: s.preQuizTeachingTimer, pendingQuizChallenge: s.pendingQuizChallenge, pendingQuizAutoStart: s.pendingQuizAutoStart })
        s.preQuizTeachingTimer -= 16
      } else { s.showingPreQuizTeaching = false }
    }
    const hideHud =
      opts.showQuizOverlayRef.current ||
      quiz.refs.activeRef.current ||
      s.showingTutorial ||
      s.showingPreQuizTeaching ||
      s.turboBoostCelebrationTimer > 0 ||
      isUiPaused
    if (!hideHud) {
      drawHUD(
        s,
        quiz.refs.activeRef.current,
        opts.showQuizOverlayRef.current,
        s.showingTutorial || s.showingPreQuizTeaching,
        s.turboBoostCelebrationTimer
      )
    }
    drawThreatPanel(s, hideHud)
    const isInvincible = quiz.refs.activeRef.current || s.isHealing || s.isRestoring || s.showingPreQuizTeaching || s.levelUpTimer > 0 || s.turboBoostCelebrationTimer > 0 || isUiPaused
    if (!s.isHealing && !s.showingPreQuizTeaching && !isUiPaused) {
      updateObstacles(s, frameMs, slowMo, isInvincible, objectCb)
      updateKits(s, objectCb)
      s.gameTime += frameMs
      const isQuizActive = quiz.refs.activeRef.current
      if (!isQuizActive && timestamp - s.lastSpawn > s.effectiveSpawnFrequency) { spawnObstacle(s); s.lastSpawn = timestamp }
      s.kitSpawnTimer += frameMs
      if (s.kitSpawnTimer >= s.KIT_SPAWN_INTERVAL) { spawnKit(s); s.kitSpawnTimer -= s.KIT_SPAWN_INTERVAL }
    }
    updateAndRenderPlayer(s, isUiPaused ? 0 : frameMs, animSpeed, quiz.refs.activeRef.current, doAdvanceLevel)
    const liveDistance = s.totalKitsCollected * 10 + s.currentLevel * 50
    opts.setDistance(liveDistance)
    liveScoreRef.current = s.localScore; liveDistanceRef.current = liveDistance
    if (!opts.isGameOver) s.animationId = requestAnimationFrame(gameLoop)
  }

  opts.setRunning(true)
  s.animationId = requestAnimationFrame(gameLoop)

  return () => {
    cancelAnimationFrame(s.animationId)
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    document.removeEventListener('visibilitychange', handleVisibility)
    window.removeEventListener('blur', handleVisibility)
    window.removeEventListener('resize', resizeCanvas)
    window.visualViewport?.removeEventListener('resize', resizeCanvas)
    window.visualViewport?.removeEventListener('scroll', resizeCanvas)
    if (resizeObserver && canvas.parentElement) resizeObserver.disconnect()
    canvas.removeEventListener('touchstart', handleTouchStart)
    canvas.removeEventListener('touchmove', handleTouchMove)
    canvas.removeEventListener('touchend', handleTouchEnd)
    canvas.removeEventListener('touchcancel', handleTouchEnd)
    ui.cleanup()
    timeoutRefs.current.forEach(tid => clearTimeout(tid)); timeoutRefs.current = []
    Object.values(s.images).forEach(img => { img.src = '' })
  }
}
