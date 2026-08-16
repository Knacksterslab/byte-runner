import type { CanvasDims } from "../engine/GameState"
interface LevelUpParams {
  levelUpTimer: number
  LEVEL_UP_DURATION: number
  currentLevel: number
  totalKitsCollected: number
}

function getRankLabel(kits: number): string {
  if (kits < 10) return 'Newbie'
  if (kits < 30) return 'Analyst'
  if (kits < 60) return 'Expert'
  return 'Commando'
}

export function drawLevelUpOverlay(
  ctx: CanvasRenderingContext2D,
  canvas: CanvasDims,
  p: LevelUpParams
): void {
  const pulse = Math.sin(Date.now() / 100) * 0.2 + 0.8

  ctx.fillStyle = `rgba(255, 215, 0, ${0.3 * (p.levelUpTimer / p.LEVEL_UP_DURATION)})`
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const overlayWidth = 500
  const overlayHeight = 200
  const overlayX = canvas.width / 2 - overlayWidth / 2
  const overlayY = canvas.height / 2 - overlayHeight / 2

  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
  ctx.fillRect(overlayX, overlayY, overlayWidth, overlayHeight)

  ctx.strokeStyle = '#ffd700'
  ctx.lineWidth = 4
  ctx.shadowBlur = 20
  ctx.shadowColor = '#ffd700'
  ctx.strokeRect(overlayX, overlayY, overlayWidth, overlayHeight)
  ctx.shadowBlur = 0

  ctx.font = `bold ${Math.floor(48 * pulse)}px monospace`
  ctx.fillStyle = '#ffd700'
  ctx.textAlign = 'center'
  ctx.fillText('LEVEL UP!', canvas.width / 2, canvas.height / 2 - 40)

  ctx.font = 'bold 36px monospace'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(`Level ${p.currentLevel}`, canvas.width / 2, canvas.height / 2 + 10)

  ctx.font = 'bold 24px monospace'
  ctx.fillStyle = '#00ffff'
  ctx.fillText(`Rank: ${getRankLabel(p.totalKitsCollected)}`, canvas.width / 2, canvas.height / 2 + 50)

  let directionInfo = ''
  if (p.currentLevel === 2) directionInfo = '⬇️ NEW: Obstacles from BOTTOM!'
  else if (p.currentLevel === 3) directionInfo = '➡️ NEW: Obstacles from Right!'
  else if (p.currentLevel === 4) directionInfo = '⬅️ NEW: Obstacles from Left!'
  else if (p.currentLevel > 4) directionInfo = '🔥 All directions active!'

  ctx.font = '18px monospace'
  ctx.fillStyle = '#ff6600'
  ctx.fillText(directionInfo || 'Difficulty Increased!', canvas.width / 2, canvas.height / 2 + 85)
  ctx.textAlign = 'left'
}
