import { ALL_KIT_TYPES } from './gameConstants'

export type DifficultyProfile = {
  obstacleSpeed: number
  spawnInterval: number
  threatFactor: number
}

export function getDifficultyForLevel(level: number): DifficultyProfile {
  const clampedLevel = Math.max(1, Math.min(50, level))

  let obstacle = 4.0
  let spawn = 750
  let threat = 0.38

  for (let lvl = 2; lvl <= clampedLevel; lvl++) {
    if (lvl <= 4) {
      spawn -= 10
      threat += 0.01
      continue
    }

    const isCycleStart = (lvl - 1) % 4 === 0
    if (isCycleStart) {
      if (lvl <= 21) {
        obstacle += 0.4
      } else if (lvl <= 33) {
        obstacle += 0.35
      } else {
        obstacle += 0.3
      }
      spawn -= 15
      threat += 0.03
    } else {
      spawn -= 10
      threat += 0.01
    }
  }

  return {
    obstacleSpeed: Math.min(7.8, Number(obstacle.toFixed(2))),
    spawnInterval: Math.max(360, spawn),
    threatFactor: Math.min(1.1, Number(threat.toFixed(2))),
  }
}

export function calculateKitsNeededForNextLevel(level: number): number {
  return level * ALL_KIT_TYPES.length
}
