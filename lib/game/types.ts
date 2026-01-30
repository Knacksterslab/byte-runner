// Game types
export interface GameState {
  distance: number
  score: number
  speed: number
  isRunning: boolean
  isPaused: boolean
  dataPackets: number
  currentLane: number
  isGameOver: boolean
  highScore: number
}

export interface ObstacleType {
  key: string
  name: string
  effect: 'gameover' | 'slow' | 'damage' | 'visibility'
  damage?: number
}

export interface CollectibleType {
  key: string
  name: string
  points: number
}

export const OBSTACLE_TYPES: ObstacleType[] = [
  { key: 'firewall', name: 'Firewall', effect: 'gameover' },
  { key: 'virus', name: 'Virus', effect: 'slow', damage: 2 },
  { key: 'data-breach', name: 'Data Breach', effect: 'damage', damage: 50 },
  { key: 'malware', name: 'Malware', effect: 'visibility' },
  { key: 'spam-wave', name: 'Spam Wave', effect: 'gameover' },
]

export const COLLECTIBLE_TYPES: CollectibleType[] = [
  { key: 'data-packet', name: 'Data Packet', points: 10 },
]

export const GAME_CONFIG = {
  LANE_COUNT: 3,
  LANE_WIDTH: 150,
  BASE_SPEED: 5,
  JUMP_FORCE: -600,
  SPAWN_INTERVAL_MIN: 800,
  SPAWN_INTERVAL_MAX: 1200,
  COLLECTIBLE_SPAWN_MIN: 300,
  COLLECTIBLE_SPAWN_MAX: 500,
  PUZZLE_CHECKPOINT: 1000, // Every 1000m trigger puzzle
}
