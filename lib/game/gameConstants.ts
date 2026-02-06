// Game configuration constants
// All magic numbers and configuration values in one place

// Player configuration
export const PLAYER_CONFIG = {
  WIDTH: 45,
  HEIGHT: 45,
  SIZE: 30,
  SPEED: 5,
  INITIAL_X: 400,
  INITIAL_Y: 300,
  INVULNERABILITY_DURATION: 2000, // ms
  GRAVITY: 0.0005,
  JUMP_VELOCITY: -0.7,
} as const

// Game mechanics
export const GAME_CONFIG = {
  BASE_SPEED: 3,
  OBSTACLE_SPEED: 3,
  OBSTACLE_SPAWN_INTERVAL: 1500, // ms
  KIT_SPAWN_INTERVAL: 5000, // ms
  SPAWN_FREQUENCY: 1500, // ms
  FRAME_TIME: 16, // ms (60fps)
  QUIZ_SLOW_MOTION_MULTIPLIER: 0.15,
} as const

// Kit system
export const KIT_CONFIG = {
  MAX_CAPACITY: 3,
  SPAWN_INTERVAL: 5000, // ms
} as const

// All kit types in the game
export const ALL_KIT_TYPES = [
  'password-manager',
  'link-analyzer',
  'patch-manager',
  'privacy-optimizer',
  'vpn-shield',
  'mfa-authenticator',
  'backup-system',
  'social-engineering-defense',
] as const

export type KitType = typeof ALL_KIT_TYPES[number]

// Kit icon mapping
export const KIT_ICONS: Record<string, string> = {
  'password-manager': '🔐',
  'link-analyzer': '🔗',
  'patch-manager': '🛡️',
  'privacy-optimizer': '🕵️',
  'vpn-shield': '🔒',
  'mfa-authenticator': '🔑',
  'backup-system': '💾',
  'social-engineering-defense': '🎭',
} as const

/**
 * Get kit icon by kit type
 * @param kitType - The kit type ID
 * @returns Emoji icon for the kit
 */
export function getKitIcon(kitType: string): string {
  return KIT_ICONS[kitType] || '🛡️'
}

// Object pooling
export const POOL_CONFIG = {
  INITIAL_OBSTACLE_POOL_SIZE: 50,
  INITIAL_POWERUP_POOL_SIZE: 30,
} as const

// Background animation
export const BACKGROUND_CONFIG = {
  PARTICLE_COUNT: 100,
  MATRIX_COLUMN_COUNT: 50,
  GRID_OFFSET_SPEED: 1,
  STAR_COUNT: 150,
  GRADIENT: {
    CENTER: '#0b1020',
    MID: '#05080f',
    EDGE: '#02030a',
  },
} as const

// Quiz configuration
export const QUIZ_CONFIG = {
  COUNTDOWN_DURATION: 3, // seconds
  DEFAULT_DURATION: 30, // seconds
  ITEM_SPACING: 150, // pixels
  ITEM_WIDTH: 120,
  ITEM_HEIGHT: 80,
  PASSING_GRADE: 0.67, // 67% correct required
} as const

// Level progression
export const LEVEL_CONFIG = {
  BASE_KITS_NEEDED: 8,
  KITS_INCREMENT_PER_LEVEL: 2,
} as const

// Visual configuration
export const VISUAL_CONFIG = {
  HUD_CORNER_RADIUS: 12,
  MOBILE_HUD_CORNER_RADIUS: 10,
  MOBILE_BREAKPOINT: 768, // pixels
  PLAYER_COLOR: '#00ff88',
  OBSTACLE_COLOR: '#ff4444',
  KIT_COLOR: '#4488ff',
  QUIZ_CORRECT_COLOR: '#00ff88',
  QUIZ_INCORRECT_COLOR: '#ff4444',
} as const
