import { ALL_KIT_TYPES } from '../gameConstants'
import { getProtectionKitById } from '../protectionKits'
import { THREAT_KIT_MAP } from '../threatKitMap'
import { getRandomGhostPlayer } from '../ghostPlayers'
import { getThreatSpawnWeight, getCurrentZone } from '../zones'
import { threatTypes } from '../threatData'
import type { GameState } from './GameState'
import type { GameObject } from './GameState'

export function getObstacleFromPool(s: GameState): GameObject | null {
  return s.obstaclePool.find(o => !o.active) ?? null
}

export function returnObstacleToPool(obstacle: GameObject): void {
  obstacle.active = false
  obstacle.y = -1000
}

export function getRequiredKit(threatId: string): string {
  return THREAT_KIT_MAP[threatId] || 'password-manager'
}

function getZoneWeightedThreat(level: number) {
  const weighted: typeof threatTypes[number][] = []
  for (const threat of threatTypes) {
    const weight = getThreatSpawnWeight(threat.category, level)
    for (let i = 0; i < Math.floor(weight * 2); i++) weighted.push(threat)
  }
  return weighted[Math.floor(Math.random() * weighted.length)]
}

export function spawnObstacle(s: GameState): void {
  const obstacle = getObstacleFromPool(s)
  if (!obstacle) return

  const speedMultiplier = 1.0
  let threat = getZoneWeightedThreat(s.currentLevel)
  // Daily incident: boosted categories show up ~3× as often.
  const boosted = s.dailyModifiers?.boostedThreats
  if (boosted && boosted.length > 0) {
    for (let tries = 0; tries < 3 && !boosted.includes(threat.category); tries++) {
      threat = getZoneWeightedThreat(s.currentLevel)
    }
  }
  const ghostPlayer = getRandomGhostPlayer(threat.category)
  const positionInCycle = ((s.currentLevel - 1) % 4) + 1
  const dirs = ['top']
  if (positionInCycle >= 2) dirs.push('bottom')
  if (positionInCycle >= 3) dirs.push('right')
  if (positionInCycle >= 4) dirs.push('left')
  const dir = dirs[Math.floor(Math.random() * dirs.length)]

  obstacle.active = true
  obstacle.width = 40 + Math.random() * 20
  obstacle.height = 40 + Math.random() * 20

  switch (dir) {
    case 'top':
      obstacle.x = Math.random() * s.logicalWidth; obstacle.y = -50
      obstacle.vx = (Math.random() - 0.5) * 2
      obstacle.vy = s.effectiveObstacleSpeed * speedMultiplier; break
    case 'bottom':
      obstacle.x = Math.random() * s.logicalWidth; obstacle.y = s.logicalHeight + 50
      obstacle.vx = (Math.random() - 0.5) * 2
      obstacle.vy = -s.effectiveObstacleSpeed * speedMultiplier; break
    case 'right':
      obstacle.x = s.logicalWidth + 50; obstacle.y = Math.random() * s.logicalHeight
      obstacle.vx = -s.effectiveObstacleSpeed * speedMultiplier
      obstacle.vy = (Math.random() - 0.5) * 2; break
    case 'left':
      obstacle.x = -50; obstacle.y = Math.random() * s.logicalHeight
      obstacle.vx = s.effectiveObstacleSpeed * speedMultiplier
      obstacle.vy = (Math.random() - 0.5) * 2; break
  }

  obstacle.type = threat.id; obstacle.color = threat.color; obstacle.threatId = threat.id
  obstacle.sentBy = ghostPlayer; obstacle.category = threat.category
  obstacle.damage = threat.damage; obstacle.spawnTime = s.gameTime
  s.obstacles.push(obstacle)
}

export function spawnKit(s: GameState): void {
  let kitType = ALL_KIT_TYPES[Math.floor(Math.random() * ALL_KIT_TYPES.length)]
  // Daily incident: scarce kits usually re-roll into something else.
  if (s.dailyModifiers?.scarceKits.includes(kitType) && Math.random() < 0.7) {
    kitType = ALL_KIT_TYPES[Math.floor(Math.random() * ALL_KIT_TYPES.length)]
  }
  const kitData = getProtectionKitById(kitType)
  s.powerups.push({
    x: Math.random() * (s.logicalWidth - 200) + 100,
    y: Math.random() * (s.logicalHeight - 200) + 100,
    width: 35, height: 35, vx: 0, vy: 0,
    type: `kit-${kitType}`,
    color: kitData?.color || '#00ffff',
    threatId: kitType,
    sentBy: { id: '', name: '', level: 0, speciality: '', category: 'password' },
    category: kitData?.protectsAgainst || ''
  })
}
