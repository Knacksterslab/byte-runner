import type { CanvasDims } from "../engine/GameState"
import { getCurrentZone, isZoneTransition } from '@/lib/game/zones'

interface SectorChangeParams {
  sectorChangeTimer: number
  SECTOR_CHANGE_DURATION: number
  sectorChangeName: string
  currentLevel: number
}

export function drawSectorChangeOverlay(
  ctx: CanvasRenderingContext2D,
  canvas: CanvasDims,
  p: SectorChangeParams
): void {
  const zone = getCurrentZone(p.currentLevel)
  const isZoneChange = isZoneTransition(p.currentLevel)
  const flashOpacity = p.sectorChangeTimer / p.SECTOR_CHANGE_DURATION
  const flashIntensity = isZoneChange ? 0.4 : 0.2

  ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity * flashOpacity})`
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const pulse = Math.sin(Date.now() / 80) * 0.3 + 0.7

  ctx.font = `bold ${Math.floor(isZoneChange ? 84 : 72) * pulse}px monospace`
  ctx.fillStyle = zone.colorScheme.accent
  ctx.textAlign = 'center'
  ctx.shadowBlur = isZoneChange ? 50 : 30
  ctx.shadowColor = zone.colorScheme.accent
  ctx.fillText(p.sectorChangeName, canvas.width / 2, canvas.height / 2)
  ctx.shadowBlur = 0

  if (isZoneChange) {
    ctx.font = 'bold 32px monospace'
    ctx.fillStyle = '#ffaa00'
    ctx.fillText('⚠️ ZONE TRANSITION ⚠️', canvas.width / 2, canvas.height / 2 - 100)

    ctx.font = 'bold 20px monospace'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(zone.description, canvas.width / 2, canvas.height / 2 + 80)

    ctx.font = '16px monospace'
    ctx.fillStyle = '#ff6666'
    const primaryThreats = zone.primaryThreats.map((t: string) => t.toUpperCase()).join(', ')
    ctx.fillText(`Primary Threats: ${primaryThreats}`, canvas.width / 2, canvas.height / 2 + 110)
  } else {
    ctx.font = 'bold 24px monospace'
    ctx.fillStyle = '#ffaa00'
    ctx.fillText('⚠️ ENVIRONMENT CHANGE ⚠️', canvas.width / 2, canvas.height / 2 - 80)
  }
  ctx.textAlign = 'left'
}
