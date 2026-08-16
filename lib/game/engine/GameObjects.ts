import type { GameState } from './GameState'
import type { GameObject } from './GameState'
import { hexToRgb } from './GameState'
import { drawThreatEntity, drawKitBadge } from '../renderers/entityRenderer'
import { getKitBadge } from '../visuals'
import { mergeRunProfile } from '../weaknessProfile'
import { calculateKitsNeededForNextLevel } from '../difficulty'
import { calculateTotalKits, isColliding } from '../utils'
import { cgGameplayStop } from '@/lib/crazygames'
import { audioManager } from '@/lib/audio'

interface ObjectCallbacks {
  trackKitCollected: (kitType: string, total: number) => void
  advanceLevel: () => void
  spawnConfetti: (x: number, y: number, count: number) => void
  showTutorial: (kitType: string, threatId: string) => void
  setLastAttacker: (attacker: unknown, threatId: string) => void
  returnObstacleToPool: (o: GameObject) => void
  getRequiredKit: (threatId: string) => string
  setSavedGameState: (s: { level: number; kits: Record<string, number>; score: number } | null) => void
  setScore: (v: number) => void
  setGameOver: (v: boolean) => void
  setRunning: (v: boolean) => void
  setIsFirstDeath: (v: boolean) => void
  trackGameOver: (level: number, score: number, threatId: string) => void
  quizCollectItem: (id: string, isCorrect: boolean) => void
  isQuizActive: () => boolean
  isFirstDeath: boolean
  lastAttacker: unknown
  quizCorrectAnswers: () => string[]
  endQuizWrongAnswer: (wrongItemId: string) => void
}

/** Merge the session's tallies into the persistent weakness profile. */
function persistWeaknessProfile(s: GameState): void {
  mergeRunProfile(s.quizMissesByCategory, s.hitsByCategory)
}

export function updateObstacles(
  s: GameState, frameMs: number, slowMo: number, isPlayerInvincible: boolean,
  cb: ObjectCallbacks
): void {
  const { ctx, canvas, performanceMode } = s
  const isQuiz = s.obstacles.length > 0 && cb.isQuizActive()

  for (let i = s.obstacles.length - 1; i >= 0; i--) {
    const obstacle = s.obstacles[i]
    if (!obstacle) continue
    if (!s.isHealing) {
      obstacle.y += obstacle.vy * slowMo * s.frameScale
      obstacle.x += obstacle.vx * slowMo * s.frameScale
    }
    const isVisible = obstacle.y > -100 && obstacle.y < s.logicalHeight + 100
    if (isVisible && !isQuiz) {
      ctx.shadowBlur = 0
      drawThreatEntity(ctx, {
        x: Math.floor(obstacle.x),
        y: Math.floor(obstacle.y),
        size: obstacle.width,
        color: obstacle.color,
        category: obstacle.category,
        damage: obstacle.damage,
        glow: !performanceMode,
      })
      ctx.shadowBlur = 0

      const timeSinceSpawn = s.gameTime - (obstacle.spawnTime || 0)
      if (!performanceMode && timeSinceSpawn < 2000 && obstacle.sentBy && !isQuiz) {
        const opacity = 1 - timeSinceSpawn / 2000
        const nameColor = obstacle.sentBy.level >= 100 ? '#ff0000' : obstacle.sentBy.level >= 71 ? '#ffff00' : obstacle.sentBy.level >= 31 ? '#00ffff' : '#aaaaaa'
        const fontSize = obstacle.sentBy.level >= 100 ? 13 : obstacle.sentBy.level >= 31 ? 12 : 11
        const prefix = obstacle.sentBy.level >= 100 ? '★' : obstacle.sentBy.level >= 71 ? '◆' : ''
        const rgb = hexToRgb(s, nameColor)
        ctx.font = `bold ${fontSize}px monospace`
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})`
        ctx.textAlign = 'center'; ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'
        ctx.fillText(`${prefix}${obstacle.sentBy.name} [${obstacle.sentBy.level}]`, obstacle.x, obstacle.y - obstacle.height / 2 - 10)
        ctx.shadowBlur = 0; ctx.textAlign = 'left'
      }
    }

    if (!isPlayerInvincible) {
      const player = { x: s.playerX - s.playerSize / 2, y: s.playerY - s.playerSize / 2, width: s.playerSize, height: s.playerSize }
      const obsBox = { x: obstacle.x - obstacle.width / 2, y: obstacle.y - obstacle.height / 2, width: obstacle.width, height: obstacle.height }
      if (isColliding(player, obsBox)) {
        const reqKit = cb.getRequiredKit(obstacle.threatId)
        if (reqKit && s.kitInventory[reqKit] !== undefined && s.kitInventory[reqKit] > 0) {
          s.kitInventory[reqKit]--; s.perfectPlayDurationMs = 0
          s.totalKitsCollected = Math.max(0, s.totalKitsCollected - 1)
          s.lastHitThreatId = obstacle.threatId
          cb.setLastAttacker(obstacle.sentBy, obstacle.threatId)
          audioManager.play('threat-hit')
          cb.showTutorial(reqKit, obstacle.threatId); s.localScore -= 25
          cb.returnObstacleToPool(obstacle); s.obstacles.splice(i, 1); continue
        }
        if (s.kitInventory['backup-system'] !== undefined && s.kitInventory['backup-system'] > 0) {
          s.kitInventory['backup-system']--; s.perfectPlayDurationMs = 0
          s.totalKitsCollected = Math.max(0, s.totalKitsCollected - 1)
          s.isRestoring = false; s.restorationTimer = 0
          s.lastHitThreatId = obstacle.threatId
          cb.setLastAttacker(obstacle.sentBy, obstacle.threatId)
          cb.showTutorial('backup-system', obstacle.threatId)
          s.obstacles.forEach(obs => cb.returnObstacleToPool(obs)); s.obstacles.length = 0
          s.localScore -= 100
          cb.returnObstacleToPool(obstacle)
          return
        }
        cb.setScore(s.localScore)
        cb.setSavedGameState({ level: s.currentLevel, kits: { ...s.kitInventory }, score: s.localScore })
        s.hitsByCategory[obstacle.category] = (s.hitsByCategory[obstacle.category] || 0) + 1
        persistWeaknessProfile(s)
        s.lastHitThreatId = obstacle.threatId
        cb.setLastAttacker(obstacle.sentBy, obstacle.threatId)
        cb.trackGameOver(s.currentLevel, s.localScore, obstacle.threatId)
        cgGameplayStop()
        audioManager.stopMusic()
        audioManager.play('game-over')
        cb.setGameOver(true); cb.setRunning(false)
        if (cb.isFirstDeath) cb.setIsFirstDeath(false)
        return
      }
    }
    const off = obstacle.y > s.logicalHeight + 100 || obstacle.y < -100 || obstacle.x > s.logicalWidth + 100 || obstacle.x < -100
    if (off) { cb.returnObstacleToPool(obstacle); s.obstacles.splice(i, 1) }
  }
}

export function updateKits(s: GameState, cb: ObjectCallbacks): void {
  const { ctx, canvas, performanceMode } = s
  const isQuiz = cb.isQuizActive()

  for (let i = s.powerups.length - 1; i >= 0; i--) {
    const kit = s.powerups[i]
    const isQuizItem = kit.type === 'quiz-item'
    if (isQuiz && !isQuizItem) continue

    const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7
    const isMobile = s.logicalWidth < 768
    const size = isQuizItem ? (isMobile ? 130 : 180) : 35 * pulse

    if (!isQuizItem) {
      const badge = getKitBadge(kit.type.replace('kit-', ''))
      drawKitBadge(ctx, {
        x: kit.x,
        y: kit.y,
        size,
        color: kit.color,
        monogram: badge.monogram,
        glow: !performanceMode,
        pulse,
      })
    }

    if (s.isHealing) continue

    const player = { x: s.playerX - s.playerSize / 2, y: s.playerY - s.playerSize / 2, width: s.playerSize, height: s.playerSize }
    const kitBox = { x: kit.x - size / 2, y: kit.y - size / 2, width: size, height: size }
    if (isColliding(player, kitBox)) {
      if (isQuizItem && cb.isQuizActive()) {
        const isCorrect = cb.quizCorrectAnswers().includes(kit.threatId)
        if (isCorrect) {
          audioManager.play('quiz-correct')
          cb.quizCollectItem(kit.threatId, true)
          s.localScore += 100
          ctx.fillStyle = 'rgba(0, 200, 255, 0.2)'; ctx.fillRect(0, 0, s.logicalWidth, s.logicalHeight)
        } else {
          audioManager.play('quiz-wrong')
          cb.endQuizWrongAnswer(kit.threatId)
        }
        s.powerups.splice(i, 1); continue
      }
      const kitType = kit.type.replace('kit-', '')
      if (kitType && s.kitInventory[kitType] !== undefined && s.kitInventory[kitType] < s.MAX_KIT_CAPACITY) {
        s.kitInventory[kitType]++; s.totalKitsCollected++; s.localScore += 50
        audioManager.play('kit-collect')
        cb.trackKitCollected(kitType, s.totalKitsCollected)
        s.celebrationTimer = s.CELEBRATION_DURATION
        // Quiz passes discount the current level's requirement (learning = speed).
        const kitsForNext = Math.ceil(calculateKitsNeededForNextLevel(s.currentLevel) * s.kitDiscount)
        if (s.totalKitsCollected >= kitsForNext) cb.advanceLevel()
        ctx.font = 'bold 20px monospace'; ctx.fillStyle = '#00ff00'; ctx.textAlign = 'center'
        ctx.fillText(`+1 ${kitType.toUpperCase()} KIT!`, kit.x, kit.y - 40)
        ctx.textAlign = 'left'
      } else if (kitType && s.kitInventory[kitType] !== undefined) {
        s.localScore += s.DUPLICATE_KIT_POINTS
        ctx.font = 'bold 16px monospace'; ctx.fillStyle = '#6ee7ff'; ctx.textAlign = 'center'
        ctx.fillText(`KIT FULL +${s.DUPLICATE_KIT_POINTS}`, kit.x, kit.y - 34); ctx.textAlign = 'left'
      }
      s.powerups.splice(i, 1)
    }
  }
}
