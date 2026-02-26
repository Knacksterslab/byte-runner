import type { QuizChallenge } from '../inGameQuizzes'
import type { GhostPlayer } from '../ghostPlayers'
import type { GameObject } from '../../../components/game/hooks/useGameLoopTypes'

export type { GameObject }

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
  virus: HTMLImageElement; firewall: HTMLImageElement; malware: HTMLImageElement
  dataBreach: HTMLImageElement; spamWave: HTMLImageElement
  dataPacket: HTMLImageElement; background: HTMLImageElement
}

export interface GameState {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  images: GameImages
  EMOJI_FONT_STACK: string
  performanceMode: boolean

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
