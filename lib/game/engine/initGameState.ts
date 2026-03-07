import { KIT_CONFIG, ALL_KIT_TYPES, GAME_CONFIG } from '../gameConstants'
import { getDifficultyForLevel } from '../difficulty'
import type { UseGameLoopOptions } from '../../../components/game/hooks/useGameLoopTypes'
import type { GameState, GameImages } from './GameState'
import type { GameObject } from '../../../components/game/hooks/useGameLoopTypes'

function createEmptyInventory(): Record<string, number> {
  return ALL_KIT_TYPES.reduce((acc, kitId) => { acc[kitId] = 0; return acc }, {} as Record<string, number>)
}

function createObstaclePool(size = 50): GameObject[] {
  return Array(size).fill(null).map(() => ({
    x: 0, y: -1000, width: 50, height: 50, vx: 0, vy: 0,
    type: '', color: '#ffffff', threatId: '',
    sentBy: { id: '', name: '', level: 0, speciality: '', category: 'password' as const },
    category: '', spawnTime: 0, active: false
  }))
}

export function initGameState(canvas: HTMLCanvasElement, opts: UseGameLoopOptions): GameState {
  const { savedGameState, bonusKitType } = opts
  const ctx = canvas.getContext('2d')!
  const isChrome = /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent)
  const performanceMode = isChrome

  ctx.imageSmoothingEnabled = false

  const images: GameImages = {
    virus: Object.assign(new Image(), { src: '/assets/sprites/virus.png' }),
    firewall: Object.assign(new Image(), { src: '/assets/sprites/firewall.png' }),
    malware: Object.assign(new Image(), { src: '/assets/sprites/malware.png' }),
    dataBreach: Object.assign(new Image(), { src: '/assets/sprites/data-breach.png' }),
    spamWave: Object.assign(new Image(), { src: '/assets/sprites/spam-wave.png' }),
    dataPacket: Object.assign(new Image(), { src: '/assets/sprites/data-packet.png' }),
    background: Object.assign(new Image(), { src: '/space-background-final.png' })
  }

  const currentLevel = savedGameState ? savedGameState.level : 1
  const difficulty = getDifficultyForLevel(currentLevel)
  const particleCount = performanceMode ? 20 : 100
  const matrixCount = performanceMode ? 30 : 50

  const baseInventory = createEmptyInventory()
  let kitInventory = savedGameState ? { ...baseInventory, ...savedGameState.kits } : baseInventory
  if (!savedGameState && bonusKitType && kitInventory[bonusKitType] !== undefined) {
    kitInventory[bonusKitType] = 1
  }

  const state: GameState = {
    canvas, ctx, images,
    EMOJI_FONT_STACK: '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",monospace',
    performanceMode,

    playerX: 100, playerY: 100, playerSize: 45, playerSpeed: 5,
    playerTilt: 0, previousPlayerX: 100, previousPlayerY: 100, animationTime: 0,

    localScore: savedGameState?.score ?? 0,
    currentLevel,

    obstacleSpeed: difficulty.obstacleSpeed, spawnFrequency: difficulty.spawnInterval,
    speedFactor: 0.55, threatSpeedFactor: difficulty.threatFactor,
    effectiveObstacleSpeed: difficulty.obstacleSpeed, effectivePlayerSpeed: 5,
    effectiveSpawnFrequency: difficulty.spawnInterval,
    kitSpawnTimer: 0, lastSpawn: 0,

    powerupsNeeded: 0, powerupsCollected: 0, totalKitsCollected: 0,
    isAdvancingLevel: false, gameTime: 0, gameFrameCount: 0,
    lastGameFrameTs: 0, frameScale: 1, animationId: 0,

    kitInventory, obstacles: [], powerups: [],
    obstaclePool: createObstaclePool(), keys: {}, lastHitThreatId: null,

    showingTutorial: false, tutorialKit: '', tutorialTimer: 0, isHealing: false,
    showQuizCompletionMessage: false, quizCompletionSuccess: false, quizCompletionTimer: 0,
    isRestoring: false, restorationTimer: 0,
    showingLevelUp: false, levelUpTimer: 0,
    perfectPlayDurationMs: 0, turboBoostCelebrationTimer: 0,
    showingSectorChange: false, sectorChangeTimer: 0, sectorChangeName: '',
    showingPreQuizTeaching: false, preQuizTeachingTimer: 0,
    pendingQuizChallenge: null, pendingQuizLevel: null, pendingQuizAutoStart: false,
    taughtQuizLevels: new Set(),
    quizWrongItemId: null, quizFailChallenge: null,
    celebrationTimer: 0, isVictoryDancing: false, victoryDanceTimer: 0,

    bgOffset: 0, safeTopInset: 0,
    particles: Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1, speed: Math.random() * 1 + 0.5
    })),
    matrixColumns: Array.from({ length: matrixCount }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      speed: Math.random() * 3 + 1,
      chars: '01アイウエオカキクケコサシスセソタチツテト'.split('')
    })),
    confettiParticles: [],
    cachedGradient: null, cachedGradientWidth: 0, cachedGradientHeight: 0,
    colorCache: new Map(),

    touchStartX: 0, touchStartY: 0, isTouching: false,

    KIT_SPAWN_INTERVAL: 4000, DUPLICATE_KIT_POINTS: 10, TUTORIAL_DURATION: 9000,
    RESTORATION_DURATION: 3000, LEVEL_UP_DURATION: 2000, SECTOR_CHANGE_DURATION: 2000,
    PRE_QUIZ_TEACH_DURATION: 7500, CELEBRATION_DURATION: 300, VICTORY_DANCE_DURATION: 2000,
    PERFECT_PLAY_DURATION_MS: 45000, TURBO_BOOST_SCORE: 1000,
    TURBO_BOOST_CELEBRATION_DURATION: 3500, MAX_KIT_CAPACITY: KIT_CONFIG.MAX_CAPACITY
  }

  return state
}
