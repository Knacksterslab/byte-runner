import type { GameState } from './GameState'
import { calculateTotalKits } from '../utils'
import { ALL_KIT_TYPES } from '../gameConstants'
import { spawnConfetti } from './GameBackground'

const MAX_FULL_INVENTORY = ALL_KIT_TYPES.length * 3 // MAX_KIT_CAPACITY = 3

export function updateAndRenderPlayer(
  s: GameState,
  frameMs: number,
  animationSpeed: number,
  quizActive: boolean,
  advanceLevel: () => void
): string {
  const { ctx, playerX, playerY, playerSize, performanceMode } = s

  const totalKits = calculateTotalKits(s.kitInventory)
  if (totalKits >= MAX_FULL_INVENTORY) {
    s.perfectPlayDurationMs += frameMs
    if (s.perfectPlayDurationMs >= s.PERFECT_PLAY_DURATION_MS && s.turboBoostCelebrationTimer <= 0) {
      s.localScore += s.TURBO_BOOST_SCORE
      advanceLevel()
      s.perfectPlayDurationMs = 0
      s.turboBoostCelebrationTimer = s.TURBO_BOOST_CELEBRATION_DURATION
      spawnConfetti(s, s.logicalWidth / 2, s.logicalHeight / 2, 50)
    }
  } else {
    s.perfectPlayDurationMs = 0
  }

  let glowColor = '#00ffff'
  if (quizActive) {
    glowColor = '#ffd700'
  } else {
    if (s.totalKitsCollected >= 60) glowColor = '#ffd700'
    else if (s.totalKitsCollected >= 30) glowColor = '#ffaa00'
    else if (s.totalKitsCollected >= 10) glowColor = '#00ff00'
  }

  // PERF: capped — this used to grow unbounded with kit count (hundreds of
  // pixels of shadowBlur late-game was a major CPU cost).
  ctx.shadowBlur = performanceMode ? 0 : Math.min(quizActive ? 40 : 20 + totalKits * 10 + s.totalKitsCollected * 2, 32)
  ctx.shadowColor = glowColor

  if (s.totalKitsCollected > 10) {
    const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7
    ctx.globalAlpha = 0.3; ctx.fillStyle = glowColor
    ctx.beginPath(); ctx.arc(playerX, playerY, playerSize * pulse, 0, Math.PI * 2); ctx.fill()
    ctx.globalAlpha = 1
  }

  drawHealingEffect(s)
  drawRestoringEffect(s)
  drawQuizShield(s, quizActive, glowColor)

  ctx.shadowBlur = 0
  s.animationTime += animationSpeed * s.frameScale

  const legSwing = Math.sin(s.animationTime) * 25
  const armSwing = s.celebrationTimer > 0 ? -90 : Math.sin(s.animationTime) * 20
  const headRadius = playerSize * 0.25; const bodyHeight = playerSize * 0.4
  const limbLength = playerSize * 0.3; const limbWidth = playerSize * 0.12

  let danceJump = 0; let danceArmAngle = armSwing
  if (s.isVictoryDancing) {
    const bp = (s.VICTORY_DANCE_DURATION - s.victoryDanceTimer) / s.VICTORY_DANCE_DURATION
    danceJump = Math.abs(Math.sin(bp * Math.PI * 8)) * 15
    danceArmAngle = Math.sin(bp * Math.PI * 16) * 60
  }

  ctx.save(); ctx.translate(playerX, playerY - danceJump)
  ctx.rotate((s.playerTilt * Math.PI) / 180)

  ctx.fillStyle = glowColor; ctx.beginPath()
  ctx.arc(0, -bodyHeight / 2 - headRadius, headRadius, 0, Math.PI * 2); ctx.fill()

  ctx.fillStyle = '#000000'; ctx.lineWidth = 2
  if (s.isVictoryDancing) {
    ctx.beginPath()
    ctx.arc(-headRadius * 0.35, -bodyHeight / 2 - headRadius - 2, headRadius * 0.25, 0, Math.PI, true)
    ctx.arc(headRadius * 0.35, -bodyHeight / 2 - headRadius - 2, headRadius * 0.25, 0, Math.PI, true)
    ctx.stroke()
    ctx.beginPath(); ctx.arc(0, -bodyHeight / 2 - headRadius + 3, headRadius * 0.4, 0.2, Math.PI - 0.2); ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.arc(-headRadius * 0.3, -bodyHeight / 2 - headRadius - 2, headRadius * 0.15, 0, Math.PI * 2)
    ctx.arc(headRadius * 0.3, -bodyHeight / 2 - headRadius - 2, headRadius * 0.15, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = glowColor; ctx.fillRect(-playerSize * 0.15, -bodyHeight / 2, playerSize * 0.3, bodyHeight)

  const drawLimb = (tx: number, ty: number, angle: number) => {
    ctx.save(); ctx.translate(tx, ty); ctx.rotate((angle * Math.PI) / 180)
    ctx.fillStyle = glowColor; ctx.fillRect(-limbWidth / 2, 0, limbWidth, limbLength); ctx.restore()
  }
  drawLimb(-playerSize * 0.1, bodyHeight / 2, legSwing)
  drawLimb(playerSize * 0.1, bodyHeight / 2, -legSwing)
  drawLimb(-playerSize * 0.25, -bodyHeight * 0.3, s.isVictoryDancing ? -danceArmAngle : -armSwing)
  drawLimb(playerSize * 0.25, -bodyHeight * 0.3, s.isVictoryDancing ? danceArmAngle : armSwing)
  ctx.restore()

  if (s.celebrationTimer > 0) {
    const op = s.celebrationTimer / s.CELEBRATION_DURATION
    const sz = 1 + (1 - op) * 0.5
    ctx.font = `bold ${Math.floor(30 * sz)}px monospace`
    ctx.fillStyle = `rgba(255, 215, 0, ${op})`; ctx.textAlign = 'center'
    ctx.shadowBlur = 20; ctx.shadowColor = '#ffd700'
    ctx.fillText('⭐', playerX, playerY - playerSize - 20 - (1 - op) * 20)
    ctx.shadowBlur = 0; ctx.textAlign = 'left'
  }
  return glowColor
}

function drawHealingEffect(s: GameState): void {
  if (!s.isHealing) return
  const { ctx, playerX, playerY, playerSize } = s
  const hp = Math.sin(Date.now() / 150) * 0.4 + 0.6
  const rot = (Date.now() / 30) % 360
  ctx.save(); ctx.translate(playerX, playerY); ctx.rotate((rot * Math.PI) / 180)
  ctx.strokeStyle = `rgba(0, 255, 255, ${0.6 * hp})`; ctx.lineWidth = 4; ctx.shadowBlur = 15; ctx.shadowColor = '#00ffff'
  ctx.beginPath(); ctx.arc(0, 0, playerSize * 1.5, 0, Math.PI * 2); ctx.stroke()
  ctx.rotate(-(rot * 2 * Math.PI) / 180)
  ctx.strokeStyle = `rgba(0, 255, 100, ${0.5 * hp})`; ctx.lineWidth = 3
  ctx.beginPath(); ctx.arc(0, 0, playerSize * 1.2, 0, Math.PI * 2); ctx.stroke()
  ctx.restore(); ctx.shadowBlur = 0
  ctx.font = 'bold 24px monospace'; ctx.fillStyle = `rgba(0, 255, 0, ${hp})`; ctx.textAlign = 'center'
  ctx.shadowBlur = 10; ctx.shadowColor = '#00ff00'
  ctx.fillText('+', playerX, playerY - playerSize - 10); ctx.shadowBlur = 0; ctx.textAlign = 'left'
}

function drawRestoringEffect(s: GameState): void {
  if (!s.isRestoring) return
  const { ctx, playerX, playerY, playerSize } = s
  const rp = Math.sin(Date.now() / 100) * 0.4 + 0.6
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = `rgba(0, 200, 255, ${0.8 - i * 0.25})`; ctx.lineWidth = 3; ctx.shadowBlur = 20; ctx.shadowColor = '#00ccff'
    ctx.beginPath(); ctx.arc(playerX, playerY, playerSize * (1 + i * 0.5) * rp, 0, Math.PI * 2); ctx.stroke()
  }
  ctx.shadowBlur = 0
  const dr = (Date.now() / 50) % 360
  ctx.save(); ctx.translate(playerX, playerY - playerSize - 30); ctx.rotate((dr * Math.PI) / 180)
  ctx.font = 'bold 32px monospace'; ctx.fillStyle = `rgba(0, 200, 255, ${rp})`; ctx.textAlign = 'center'
  ctx.shadowBlur = 15; ctx.shadowColor = '#00ccff'; ctx.fillText('💾', 0, 0); ctx.restore()
  ctx.shadowBlur = 0; ctx.textAlign = 'left'
}

function drawQuizShield(s: GameState, quizActive: boolean, glowColor: string): void {
  if (!quizActive) return
  const { ctx, playerX, playerY, playerSize } = s
  const sp = Math.sin(Date.now() / 200) * 0.3 + 0.7
  const rot = (Date.now() / 40) % 360
  ctx.save(); ctx.translate(playerX, playerY); ctx.rotate((rot * Math.PI) / 180)
  ctx.strokeStyle = `rgba(0, 255, 255, ${0.7 * sp})`; ctx.lineWidth = 5; ctx.shadowBlur = 25; ctx.shadowColor = '#00ffff'
  ctx.beginPath(); ctx.arc(0, 0, playerSize * 1.6, 0, Math.PI * 2); ctx.stroke()
  ctx.rotate(-((rot * 1.5 * Math.PI) / 180)); ctx.strokeStyle = `rgba(0, 200, 255, ${0.6 * sp})`; ctx.lineWidth = 3
  ctx.beginPath()
  for (let i = 0; i <= 6; i++) {
    const a = (i * 2 * Math.PI) / 6; const r = playerSize * 1.3
    i === 0 ? ctx.moveTo(r * Math.cos(a), r * Math.sin(a)) : ctx.lineTo(r * Math.cos(a), r * Math.sin(a))
  }
  ctx.stroke(); ctx.restore()
  ctx.font = 'bold 16px monospace'; ctx.fillStyle = `rgba(0, 255, 255, ${sp})`; ctx.textAlign = 'center'
  ctx.shadowBlur = 15; ctx.shadowColor = '#00ffff'
  ctx.fillText('INVINCIBLE', playerX, playerY - playerSize - 50)
  ctx.shadowBlur = 0; ctx.textAlign = 'left'
}
