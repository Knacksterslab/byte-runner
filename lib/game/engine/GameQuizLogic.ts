import { getDifficultyForLevel } from '../difficulty'
import { getCurrentZone } from '../zones'
import { getQuizForLevel, type QuizChallenge } from '../inGameQuizzes'
import { trackLevelUp } from '@/lib/analytics'
import { cgHappyTime } from '@/lib/crazygames'
import { audioManager } from '@/lib/audio'
import { spawnConfetti } from './GameBackground'
import { returnObstacleToPool } from './GameSpawn'
import { quizTypeToCategory, reportQuizResult } from '../weaknessProfile'
import { beginDrillSession } from '@/lib/api/drills'
import type { GameState } from './GameState'

interface QuizCallbacks {
  setLevel: (v: number) => void
  timeoutRefs: { current: ReturnType<typeof setTimeout>[] }
  quizStartQuiz: (level: number) => void
  quizMarkCompleted: () => void
  quizEndQuiz: () => void
  quizActiveRef: () => boolean
}

export function startPreQuizTeaching(s: GameState, quiz: QuizChallenge, targetLevel: number, autoStart: boolean): void {
  s.pendingQuizChallenge = quiz
  s.pendingQuizLevel = targetLevel
  s.pendingQuizAutoStart = autoStart
  s.showingPreQuizTeaching = true
  s.preQuizTeachingTimer = s.PRE_QUIZ_TEACH_DURATION
  s.obstacles.forEach(obs => returnObstacleToPool(obs))
  s.obstacles.length = 0
}

export function startInGameQuiz(
  s: GameState, quiz: QuizChallenge,
  cb: QuizCallbacks,
  spawnQuizItemsFn: (quiz: QuizChallenge) => void
): void {
  s.lastQuizType = quiz.type
  void beginDrillSession()
  cb.quizStartQuiz(s.currentLevel)
  s.obstacles.forEach(obs => returnObstacleToPool(obs))
  s.obstacles.length = 0
  const tid = setTimeout(() => {
    if (cb.quizActiveRef()) spawnQuizItemsFn(quiz)
  }, 3000)
  cb.timeoutRefs.current.push(tid)
}

export function endInGameQuiz(
  s: GameState, success: boolean,
  finalPoints: number, cb: QuizCallbacks
): void {
  cb.quizMarkCompleted()
  s.obstacles.forEach(obs => returnObstacleToPool(obs))
  s.obstacles.length = 0
  if (success) {
    reportQuizResult(quizTypeToCategory(s.lastQuizType), true)
    s.kitDiscount = 0.7
    s.localScore += 500
    s.showQuizCompletionMessage = true; s.quizCompletionSuccess = true; s.quizCompletionTimer = 2000
    spawnConfetti(s, s.logicalWidth / 2, s.logicalHeight / 2, s.logicalWidth < 768 ? 40 : 80)
    s.isVictoryDancing = true; s.victoryDanceTimer = s.VICTORY_DANCE_DURATION
  } else {
    const failTopic = quizTypeToCategory(s.lastQuizType)
    reportQuizResult(failTopic, false)
    s.quizMissesByCategory[failTopic] = (s.quizMissesByCategory[failTopic] || 0) + 1
    s.showQuizCompletionMessage = true; s.quizCompletionSuccess = false; s.quizCompletionTimer = 2000
  }
  s.powerups = s.powerups.filter(p => p.type !== 'quiz-item')
  const tid = setTimeout(() => { cb.quizEndQuiz(); s.showQuizCompletionMessage = false }, 2000)
  cb.timeoutRefs.current.push(tid)
}

/** Immediately ends the quiz with a fail and stores context for the teaching overlay. */
export function endInGameQuizWrongAnswer(
  s: GameState,
  wrongItemId: string,
  failChallenge: QuizChallenge | null,
  cb: QuizCallbacks
): void {
  const missCategory = quizTypeToCategory(failChallenge?.type ?? s.lastQuizType)
  reportQuizResult(missCategory, false)
  s.quizMissesByCategory[missCategory] = (s.quizMissesByCategory[missCategory] || 0) + 1
  s.quizWrongItemId = wrongItemId
  s.quizFailChallenge = failChallenge
  cb.quizMarkCompleted()
  s.obstacles.forEach(obs => returnObstacleToPool(obs))
  s.obstacles.length = 0
  s.powerups = s.powerups.filter(p => p.type !== 'quiz-item')
  s.showQuizCompletionMessage = true; s.quizCompletionSuccess = false; s.quizCompletionTimer = 4500
  const tid = setTimeout(() => {
    cb.quizEndQuiz()
    s.showQuizCompletionMessage = false
    s.quizWrongItemId = null
    s.quizFailChallenge = null
  }, 4500)
  cb.timeoutRefs.current.push(tid)
}

export function spawnQuizItems(s: GameState, quizChallenge: QuizChallenge): void {
  s.powerups.length = 0
  const isMobile = s.logicalWidth < 768
  const itemWidth = isMobile ? 130 : 180; const itemHeight = isMobile ? 130 : 180
  const hSpacing = isMobile ? 230 : 320; const vSpacing = isMobile ? 260 : 300
  const positions = [
    { x: s.logicalWidth / 2 - hSpacing / 2, y: isMobile ? 300 : 280 },
    { x: s.logicalWidth / 2 + hSpacing / 2, y: isMobile ? 300 : 280 },
    { x: s.logicalWidth / 2, y: isMobile ? 300 + vSpacing : 280 + vSpacing }
  ]
  quizChallenge.items.slice(0, 3).forEach((item, idx) => {
    const pos = positions[idx]
    s.powerups.push({
      x: pos.x, y: pos.y, width: itemWidth, height: itemHeight, vx: 0, vy: 0,
      type: 'quiz-item', color: item.color, threatId: item.id,
      sentBy: { id: item.id, name: item.label, level: 0, speciality: item.description || item.visual, category: 'password' },
      category: quizChallenge.type
    })
  })
  s.playerX = s.logicalWidth / 2
  s.playerY = isMobile ? 220 : s.logicalHeight / 2 - 50
}

export function checkQuizCompletion(
  s: GameState,
  quizActiveRef: boolean, quizCompletedRef: boolean, countdownRef: number,
  currentPoints: number, passingScore: number,
  endQuizFn: (success: boolean) => void
): void {
  if (!quizActiveRef || quizCompletedRef || countdownRef > 0) return
  const allGone = s.powerups.filter(p => p.type === 'quiz-item').length === 0
  if (allGone || currentPoints >= passingScore) {
    endQuizFn(currentPoints >= passingScore)
  }
}

export function advanceLevel(
  s: GameState, cb: QuizCallbacks,
  startPreQuizTeachingFn: (quiz: QuizChallenge, level: number, auto: boolean) => void,
  startInGameQuizFn: (quiz: QuizChallenge) => void
): void {
  if (s.isAdvancingLevel) return
  s.isAdvancingLevel = true
  s.currentLevel++
  s.kitDiscount = 1 // quiz discount applies per level only
  // Level transition: fresh stage — clear threats and grant grace so the
  // level-up/sector overlays can never kill the player (or teleport them
  // into a hazard).
  s.obstacles.forEach(obs => returnObstacleToPool(obs))
  s.obstacles.length = 0
  s.levelGraceUntil = s.gameTime + 3000
  cb.setLevel(s.currentLevel)
  audioManager.play('level-up')
  trackLevelUp(s.currentLevel)
  if (s.currentLevel % 5 === 0) cgHappyTime()
  s.playerX = 200 + Math.random() * (s.logicalWidth - 400)
  s.playerY = 200 + Math.random() * (s.logicalHeight - 400)
  const diff = getDifficultyForLevel(s.currentLevel)
  s.obstacleSpeed = diff.obstacleSpeed; s.spawnFrequency = diff.spawnInterval; s.threatSpeedFactor = diff.threatFactor
  const posInCycle = ((s.currentLevel - 1) % 4) + 1
  s.showingLevelUp = true; s.levelUpTimer = s.LEVEL_UP_DURATION
  if (posInCycle === 1 && s.currentLevel > 4) {
    const zone = getCurrentZone(s.currentLevel)
    s.sectorChangeName = `${zone.name} - SPEED INCREASED!`
    s.showingSectorChange = true; s.sectorChangeTimer = s.SECTOR_CHANGE_DURATION * 1.5
  }
  const quizChallenge = getQuizForLevel(s.currentLevel)
  const nextLevel = s.currentLevel + 1; const nextQuiz = getQuizForLevel(nextLevel)
  if (quizChallenge && !cb.quizActiveRef()) {
    const tid = setTimeout(() => {
      if (s.taughtQuizLevels.has(s.currentLevel)) { startInGameQuizFn(quizChallenge) }
      else if (s.currentLevel >= 6) { startPreQuizTeachingFn(quizChallenge, s.currentLevel, true) }
      else { startInGameQuizFn(quizChallenge) }
    }, 2000)
    cb.timeoutRefs.current.push(tid)
  } else if (nextQuiz && nextLevel >= 6 && !s.taughtQuizLevels.has(nextLevel)) {
    const tid = setTimeout(() => startPreQuizTeachingFn(nextQuiz, nextLevel, false), 1500)
    cb.timeoutRefs.current.push(tid)
  }
  const tid = setTimeout(() => { s.isAdvancingLevel = false }, 1000)
  cb.timeoutRefs.current.push(tid)
}
