import { getProtectionKitForThreat } from '@/lib/game/protectionKits'
import { getThreatName } from '@/lib/game/threatData'

interface RestorationParams {
  restorationTimer: number
  RESTORATION_DURATION: number
  lastThreatType: string | null
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export function drawRestorationOverlay(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  p: RestorationParams
): void {
  const protectionKit = p.lastThreatType ? getProtectionKitForThreat(p.lastThreatType) : null
  const threatName = p.lastThreatType ? getThreatName(p.lastThreatType) : 'Unknown Threat'
  const protectionName = protectionKit?.name ?? 'Protection Kit'
  const learningPoints = protectionKit?.learningPoints?.slice(0, 3) ?? [
    'Reduce exposure', 'Block common attacks', 'Keep data safe',
  ]
  const equivalents = protectionKit?.howToGetIt?.slice(0, 3) ?? [
    'Use trusted tools', 'Enable built-in protections', 'Follow best practices',
  ]
  const tipText = protectionKit?.learningPoints?.[0] ?? 'Review your privacy settings regularly.'
  const progress = Math.max(0, Math.min(1, 1 - p.restorationTimer / p.RESTORATION_DURATION))
  const timeLeft = Math.max(0, Math.ceil(p.restorationTimer / 1000))
  const scale = Math.min(1, canvas.width / 900, canvas.height / 720)
  const panelW = Math.min(canvas.width * 0.86, 760 * scale)
  const panelH = Math.min(canvas.height * 0.78, 620 * scale)
  const panelX = (canvas.width - panelW) / 2
  const panelY = (canvas.height - panelH) / 2
  const padding = 28 * scale

  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  ctx.shadowBlur = 30 * scale
  ctx.shadowColor = 'rgba(0, 220, 255, 0.35)'
  drawRoundRect(ctx, panelX, panelY, panelW, panelH, 18 * scale)
  ctx.fillStyle = 'rgba(5, 16, 24, 0.92)'
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.lineWidth = 2 * scale
  ctx.strokeStyle = 'rgba(0, 210, 255, 0.7)'
  ctx.stroke()
  ctx.restore()

  ctx.textAlign = 'center'
  ctx.font = `bold ${34 * scale}px monospace`
  ctx.fillStyle = '#7be9ff'
  ctx.fillText('🛡️', canvas.width / 2, panelY + padding + 10 * scale)
  ctx.font = `bold ${28 * scale}px monospace`
  ctx.fillText('Recovery in Progress', canvas.width / 2, panelY + padding + 48 * scale)
  ctx.font = `${14 * scale}px monospace`
  ctx.fillStyle = '#9fb7c9'
  ctx.fillText('You were hit by a privacy threat — protection activated.', canvas.width / 2, panelY + padding + 72 * scale)

  ctx.strokeStyle = 'rgba(0, 180, 220, 0.35)'
  ctx.lineWidth = 1 * scale
  ctx.beginPath()
  ctx.moveTo(panelX + padding, panelY + padding + 90 * scale)
  ctx.lineTo(panelX + panelW - padding, panelY + padding + 90 * scale)
  ctx.stroke()

  ctx.textAlign = 'left'
  const rowY = panelY + padding + 120 * scale
  ctx.font = `bold ${14 * scale}px monospace`
  ctx.fillStyle = '#ffcc66'
  ctx.fillText('⚠️ Threat:', panelX + padding, rowY)
  ctx.fillStyle = '#dfe9f2'
  ctx.fillText(threatName, panelX + padding, rowY + 22 * scale)
  ctx.fillStyle = '#7ee0a2'
  ctx.fillText('🛡️ Protection Used:', panelX + panelW / 2, rowY)
  ctx.fillStyle = '#dfe9f2'
  ctx.fillText(protectionName, panelX + panelW / 2, rowY + 22 * scale)

  const listY = rowY + 65 * scale
  ctx.fillStyle = '#9fb7c9'
  ctx.font = `bold ${14 * scale}px monospace`
  ctx.fillText('What it stops:', panelX + padding, listY)
  ctx.font = `${13 * scale}px monospace`
  learningPoints.forEach((item, idx) => {
    const y = listY + 24 * scale + idx * 22 * scale
    ctx.fillStyle = '#7ee0a2'
    ctx.fillText('✓', panelX + padding, y)
    ctx.fillStyle = '#dfe9f2'
    ctx.fillText(item, panelX + padding + 18 * scale, y)
  })

  const rightColX = panelX + panelW / 2
  ctx.fillStyle = '#9fb7c9'
  ctx.font = `bold ${14 * scale}px monospace`
  ctx.fillText('Real-world equivalents:', rightColX, listY)
  ctx.font = `${13 * scale}px monospace`
  equivalents.forEach((item, idx) => {
    const y = listY + 24 * scale + idx * 22 * scale
    ctx.fillStyle = '#7ee0a2'
    ctx.fillText('✓', rightColX, y)
    ctx.fillStyle = '#dfe9f2'
    ctx.fillText(item, rightColX + 18 * scale, y)
  })

  const tipY = listY + 24 * scale + 3 * 22 * scale + 12 * scale
  ctx.fillStyle = '#cfd7e3'
  ctx.font = `bold ${13 * scale}px monospace`
  ctx.fillText('Tip:', panelX + padding, tipY)
  ctx.font = `${13 * scale}px monospace`
  ctx.fillStyle = '#9fb7c9'
  ctx.fillText(tipText, panelX + padding + 36 * scale, tipY)

  ctx.textAlign = 'center'
  ctx.font = `bold ${15 * scale}px monospace`
  ctx.fillStyle = '#9fb7c9'
  ctx.fillText(`Recovery completes in ${timeLeft}s`, canvas.width / 2, panelY + panelH - 70 * scale)

  const barW = panelW - padding * 2
  const barH = 14 * scale
  const barX = panelX + padding
  const barY = panelY + panelH - 48 * scale
  drawRoundRect(ctx, barX, barY, barW, barH, 8 * scale)
  ctx.strokeStyle = 'rgba(0, 200, 255, 0.8)'
  ctx.lineWidth = 1 * scale
  ctx.stroke()
  drawRoundRect(ctx, barX + 2, barY + 2, (barW - 4) * progress, barH - 4, 6 * scale)
  ctx.fillStyle = 'rgba(0, 255, 180, 0.8)'
  ctx.fill()

  ctx.font = `${16 * scale}px monospace`
  ctx.fillStyle = '#ffcc66'
  ctx.beginPath()
  ctx.arc(barX + 12 * scale, barY - 10 * scale, 10 * scale, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#1b2533'
  ctx.fillText('🙂', barX + 6 * scale, barY - 4 * scale)
  ctx.textAlign = 'left'
}
