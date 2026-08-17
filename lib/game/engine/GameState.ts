import type { QuizChallenge } from '../inGameQuizzes'
import type { GhostPlayer } from '../ghostPlayers'
import type { GameObject } from '../../../components/game/hooks/useGameLoopTypes'

export type { GameObject }

/** Logical (CSS-pixel) dimensions passed to overlay renderers. */
export interface CanvasDims {
  width: number
  height: number
}

export interface ConfettiParticle {
  x: number; y: number; vx: number; vy: number
  color: string; rotation: number; rotationSpeed: number
  life: number; shape: 'rect' | 'circle'; size: number
}

export interface BackgroundParticle {
  x: number; y: number; size: number; speed: number
}

export interface MatrixColumn {
  x: number; y: number; speed: number; chars: string[]
}

export interface GameImages extends Record<string, HTMLImageElement> {
  background: HTMLImageElement
}

export interface GameState {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  /** Logical (CSS-pixel) dimensions — ALL game math uses these. */
  logicalWidth: number; logicalHeight: number
  images: GameImages
  EMOJI_FONT_STACK: string
  performanceMode: boolean
  /** Gameplay paused (user or auto-pause on tab blur). Loop idles. */
  paused: boolean
  /** Multiplier on the current level's kit requirement (quiz pass ⇒ 0.7). */
  kitDiscount: number
  /** Session tally of threat hits (deaths only) per threat category. */
  hitsByCategory: Record<string, number>
  /** Session tally of quiz misses per category — the primary weakness signal. */
  quizMissesByCategory: Record<string, number>
  /** Type of the most recently started quiz challenge (for miss attribution). */
  lastQuizType: string | null
  /** Hazards can't harm the player until gameTime passes this timestamp. */
  levelGraceUntil: number
  /** Daily-incident modifiers, or null in a standard run. */
  dailyModifiers: { name: string; boostedThreats: string[]; scarceKits: string[] } | null
  /** Perf caches: pre-rendered background, cached gradients, glow sprites. */
  bgCache: HTMLCanvasElement | null
  vignetteCache: CanvasGradient | null
  horizonCache: CanvasGradient | null
  glowSprites: Map<string, HTMLCanvasElement>
  /** Timestamp of the last rendered frame — caps the loop at ~60fps. */
  lastRenderTs: number

  // Player
  playerX: number; playerY: number; playerSize: number; playerSpeed: number
  playerTilt: number; previousPlayerX: number; previousPlayerY: number
  animationTime: number

  // Scores / Level
  localScore: number; currentLevel: number

  // Speed / Difficulty
  obstacleSpeed: number; spawnFrequency: number; speedFactor: number
  threatSpeedFactor: number; effectiveObstacleSpeed: number
  effectivePlayerSpeed: number; effectiveSpawnFrequency: number
  kitSpawnTimer: number; lastSpawn: number

  // Counters
  powerupsNeeded: number; powerupsCollected: number; totalKitsCollected: number
  isAdvancingLevel: boolean; gameTime: number; gameFrameCount: number
  lastGameFrameTs: number; frameScale: number; animationId: number
  perfSamples: number[]

  // Inventory / Objects
  kitInventory: Record<string, number>
  obstacles: GameObject[]
  powerups: GameObject[]
  obstaclePool: GameObject[]
  keys: Record<string, boolean>
  lastHitThreatId: string | null

  // Timers / Flags
  showingTutorial: boolean; tutorialKit: string; tutorialTimer: number; isHealing: boolean
  showQuizCompletionMessage: boolean; quizCompletionSuccess: boolean; quizCompletionTimer: number
  isRestoring: boolean; restorationTimer: number
  showingLevelUp: boolean; levelUpTimer: number
  perfectPlayDurationMs: number; turboBoostCelebrationTimer: number
  showingSectorChange: boolean; sectorChangeTimer: number; sectorChangeName: string
  showingPreQuizTeaching: boolean; preQuizTeachingTimer: number
  pendingQuizChallenge: QuizChallenge | null; pendingQuizLevel: number | null
  pendingQuizAutoStart: boolean; taughtQuizLevels: Set<number>
  quizWrongItemId: string | null; quizFailChallenge: QuizChallenge | null
  celebrationTimer: number; isVictoryDancing: boolean; victoryDanceTimer: number

  // Background / Visuals
  bgOffset: number; safeTopInset: number
  particles: BackgroundParticle[]; matrixColumns: MatrixColumn[]
  confettiParticles: ConfettiParticle[]
  cachedGradient: CanvasGradient | null
  cachedGradientWidth: number; cachedGradientHeight: number
  colorCache: Map<string, { r: number; g: number; b: number }>

  // Touch
  touchStartX: number; touchStartY: number; isTouching: boolean

  // Constants
  KIT_SPAWN_INTERVAL: number; DUPLICATE_KIT_POINTS: number; TUTORIAL_DURATION: number
  RESTORATION_DURATION: number; LEVEL_UP_DURATION: number; SECTOR_CHANGE_DURATION: number
  PRE_QUIZ_TEACH_DURATION: number; CELEBRATION_DURATION: number; VICTORY_DANCE_DURATION: number
  PERFECT_PLAY_DURATION_MS: number; TURBO_BOOST_SCORE: number
  TURBO_BOOST_CELEBRATION_DURATION: number; MAX_KIT_CAPACITY: number
}

export function hexToRgb(
  state: Pick<GameState, 'colorCache'>,
  hex: string
): { r: number; g: number; b: number } {
  if (state.colorCache.has(hex)) return state.colorCache.get(hex)!
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const rgb = { r, g, b }
  state.colorCache.set(hex, rgb)
  return rgb
}
