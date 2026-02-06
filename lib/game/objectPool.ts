// Object pooling system for efficient game object management
import type { GhostPlayer } from './ghostPlayers'

export interface GameObject {
  x: number
  y: number
  width: number
  height: number
  vx: number
  vy: number
  type: string
  color: string
  threatId: string
  sentBy: GhostPlayer
  category: string
  spawnTime?: number
  active?: boolean
  // Optional properties for specific object types
  speed?: number
  lane?: number
  icon?: string
  kitType?: string
  id?: string
  isCorrect?: boolean
  label?: string
}

export class ObjectPool {
  private pool: GameObject[] = []

  constructor(initialSize: number) {
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createEmptyObject())
    }
  }

  private createEmptyObject(): GameObject {
    return {
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      vx: 0,
      vy: 0,
      type: '',
      color: '#ff0000',
      threatId: '',
      sentBy: { id: '', name: '', emoji: '', level: 1, speciality: '', category: 'password' },
      category: 'password',
      spawnTime: 0,
      active: false,
    }
  }

  /**
   * Get an inactive object from the pool
   * @returns An inactive object, or null if pool is exhausted
   */
  getObject(): GameObject | null {
    const obj = this.pool.find(o => !o.active)
    return obj || null
  }

  /**
   * Return an object to the pool
   * @param obj - The object to return
   */
  returnObject(obj: GameObject): void {
    obj.active = false
  }

  /**
   * Get all active objects
   * @returns Array of active objects
   */
  getActiveObjects(): GameObject[] {
    return this.pool.filter(o => o.active)
  }

  /**
   * Clear all active objects
   */
  clearAll(): void {
    this.pool.forEach(o => (o.active = false))
  }
}
