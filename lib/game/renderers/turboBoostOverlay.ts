import type { CanvasDims } from "../engine/GameState"
interface TurboBoostParams {
  turboBoostCelebrationTimer: number
  TURBO_BOOST_CELEBRATION_DURATION: number
  TURBO_BOOST_SCORE: number
}

export function drawTurboBoostCelebration(
  ctx: CanvasRenderingContext2D,
  canvas: CanvasDims,
  p: TurboBoostParams
): void {
  const progress = 1 - p.turboBoostCelebrationTimer / p.TURBO_BOOST_CELEBRATION_DURATION
  const pulse = Math.sin(Date.now() / 80) * 0.15 + 0.85

  ctx.fillStyle = `rgba(255, 215, 0, ${0.25 * (1 - progress)})`
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = `rgba(0, 255, 255, ${0.15 * (1 - progress)})`
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const overlayWidth = Math.min(560, canvas.width - 40)
  const overlayHeight = 260
  const overlayX = canvas.width / 2 - overlayWidth / 2
  const overlayY = canvas.height / 2 - overlayHeight / 2

  ctx.fillStyle = 'rgba(0, 8, 20, 0.95)'
  ctx.beginPath()
  ctx.roundRect(overlayX, overlayY, overlayWidth, overlayHeight, 20)
  ctx.fill()

  ctx.strokeStyle = '#ffd700'
  ctx.lineWidth = 5
  ctx.shadowBlur = 30
  ctx.shadowColor = '#ffd700'
  ctx.stroke()
  ctx.shadowBlur = 0

  ctx.strokeStyle = '#00ffff'
  ctx.lineWidth = 2
  ctx.shadowBlur = 15
  ctx.shadowColor = '#00ffff'
  ctx.stroke()
  ctx.shadowBlur = 0

  ctx.textAlign = 'center'
  const cx = canvas.width / 2
  const cy = canvas.height / 2

  ctx.font = `bold ${Math.floor(52 * pulse)}px monospace`
  ctx.fillStyle = '#ffd700'
  ctx.fillText('⚡ TURBO BOOST! ⚡', cx, cy - 70)
  ctx.font = 'bold 28px monospace'
  ctx.fillStyle = '#00ffff'
  ctx.fillText('PERFECT PLAY', cx, cy - 30)
  ctx.font = 'bold 36px monospace'
  ctx.fillStyle = '#00ff88'
  ctx.fillText(`+${p.TURBO_BOOST_SCORE} pts`, cx, cy + 20)
  ctx.font = 'bold 24px monospace'
  ctx.fillStyle = '#ffffff'
  ctx.fillText('Level up!', cx, cy + 60)
  ctx.font = '18px monospace'
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.fillText('Full inventory sustained — keep going!', cx, cy + 95)
  ctx.textAlign = 'left'
}
