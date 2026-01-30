import Phaser from 'phaser'

// Global event emitter for Phaser-React communication
class GameEventEmitter extends Phaser.Events.EventEmitter {
  private static instance: GameEventEmitter

  private constructor() {
    super()
  }

  static getInstance(): GameEventEmitter {
    if (!GameEventEmitter.instance) {
      GameEventEmitter.instance = new GameEventEmitter()
    }
    return GameEventEmitter.instance
  }
}

export const gameEvents = GameEventEmitter.getInstance()

// Event types
export enum GameEvent {
  COLLECT = 'game:collect',
  COLLISION = 'game:collision',
  DISTANCE = 'game:distance',
  SCORE = 'game:score',
  GAME_OVER = 'game:gameover',
  GAME_START = 'game:start',
  GAME_PAUSE = 'game:pause',
  GAME_RESUME = 'game:resume',
  PUZZLE_START = 'game:puzzle-start',
  PUZZLE_COMPLETE = 'game:puzzle-complete',
  SPEED_CHANGE = 'game:speed-change',
}

// Event data types
export interface CollectEvent {
  type: string
  points: number
}

export interface CollisionEvent {
  type: string
  effect: string
  damage?: number
}

export interface DistanceEvent {
  distance: number
}

export interface ScoreEvent {
  score: number
  delta: number
}
