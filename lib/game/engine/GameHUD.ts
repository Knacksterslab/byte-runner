import type { GameState } from './GameState'

type QuizRefs = {
  activeRef: { current: boolean }
  countdownRef: { current: number }
  pointsRef: { current: number }
  timeRemainingRef: { current: number }
}

export function drawHUD(
  s: GameState,
  quizActiveRef: boolean,
  showQuizOverlay: boolean,
  isHealingOrPre: boolean,
  turboCelebTimer: number
): void {
  const { ctx, canvas, currentLevel, localScore, EMOJI_FONT_STACK, safeTopInset } = s
  const shouldHide = showQuizOverlay || quizActiveRef || isHealingOrPre || turboCelebTimer > 0
  if (shouldHide) return

  const hudX = 18
  const hudY = 18 + (s.logicalWidth < 768 ? safeTopInset : 0)
  const hudWidth = s.logicalWidth < 768 ? 238 : 270
  const hudHeight = s.logicalWidth < 768 ? 40 : 44

  ctx.fillStyle = 'rgba(3, 10, 20, 0.86)'
  ctx.beginPath(); ctx.roundRect(hudX, hudY, hudWidth, hudHeight, 10); ctx.fill()
  ctx.strokeStyle = 'rgba(50, 245, 255, 0.9)'; ctx.lineWidth = 2; ctx.stroke()

  ctx.font = `20px ${EMOJI_FONT_STACK}`; ctx.fillStyle = '#ffb648'; ctx.textAlign = 'left'
  ctx.fillText('🧰', hudX + 10, hudY + 28)

  ctx.font = s.logicalWidth < 768 ? 'bold 19px monospace' : 'bold 22px monospace'
  ctx.fillStyle = '#d8f8ff'
  ctx.fillText(`L${currentLevel} • SCORE:`, hudX + 42, hudY + (s.logicalWidth < 768 ? 26 : 29))

  ctx.font = s.logicalWidth < 768 ? 'bold 21px monospace' : 'bold 24px monospace'
  ctx.fillStyle = '#6ee7ff'; ctx.textAlign = 'right'
  ctx.fillText(`${localScore}`, hudX + hudWidth - 16, hudY + (s.logicalWidth < 768 ? 27 : 30))
  ctx.textAlign = 'left'

  // Daily-incident badge: makes the themed day visible in-run.
  if (s.dailyModifiers?.name) {
    const badgeY = hudY + hudHeight + 8
    ctx.font = 'bold 11px monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(251, 191, 36, 0.9)'
    ctx.fillText(`⚡ ${s.dailyModifiers.name}`, hudX + hudWidth / 2, badgeY)
    ctx.textAlign = 'left'
  }
}

export function drawThreatPanel(s: GameState, shouldHide: boolean): void {
  const { ctx, canvas, EMOJI_FONT_STACK, obstacles, playerX, playerY } = s
  if (s.logicalWidth < 768 || obstacles.length === 0 || shouldHide) return

  const activeThreats = obstacles.filter(o => o.active && o.sentBy)
  if (activeThreats.length === 0) return

  const closestThreat = activeThreats.reduce((closest, current) => {
    return Math.hypot(current.x - playerX, current.y - playerY) < Math.hypot(closest.x - playerX, closest.y - playerY)
      ? current : closest
  })

  const categoryEmojis: Record<string, string> = {
    password: '🔐', phishing: '📧', updates: '💥', privacy: '🕵️',
    wifi: '📡', authentication: '🔑', 'data-loss': '💾', 'social-engineering': '🎭'
  }
  const uniqueCategories = [...new Set(activeThreats.map(t => t.category))]
  const leadCategory = uniqueCategories[0] || 'password'
  const threatIcons = [closestThreat.sentBy?.emoji || '🕵️', '⚠️', categoryEmojis[leadCategory] || '🔐']

  const panelWidth = 258; const panelHeight = 128
  const panelX = s.logicalWidth - panelWidth - 20; const panelY = 16

  ctx.fillStyle = 'rgba(10, 7, 8, 0.88)'
  ctx.beginPath(); ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 12); ctx.fill()
  ctx.strokeStyle = '#ff6a3d'; ctx.lineWidth = 2; ctx.stroke()

  ctx.font = 'bold 14px monospace'; ctx.fillStyle = '#ff9e6b'; ctx.textAlign = 'center'
  ctx.fillText('CURRENT THREAT', panelX + panelWidth / 2, panelY + 22)

  ctx.font = `32px ${EMOJI_FONT_STACK}`; ctx.fillStyle = '#ffffff'
  const iconSpacing = 64; const startX = panelX + (panelWidth - (threatIcons.length - 1) * iconSpacing) / 2
  threatIcons.forEach((icon, i) => ctx.fillText(icon, startX + i * iconSpacing, panelY + 64))

  ctx.font = 'bold 16px monospace'; ctx.fillStyle = '#ffffff'
  const name = closestThreat.sentBy?.name || 'UNKNOWN'
  ctx.fillText(name.length > 22 ? name.substring(0, 22) + '...' : name, panelX + panelWidth / 2, panelY + 94)

  ctx.font = 'bold 14px monospace'
  const dist = Math.floor(Math.hypot(closestThreat.x - playerX, closestThreat.y - playerY))
  const status = dist < 100 ? 'CRITICAL' : dist < 200 ? 'NEAR' : 'SAFE'
  ctx.fillStyle = dist < 100 ? '#ff5a4a' : dist < 200 ? '#ff7f66' : '#ffb480'
  ctx.fillText(status, panelX + panelWidth / 2, panelY + 112)

  const segments = 7; const segmentGap = 4
  const barWidth = panelWidth - 26; const segmentWidth = (barWidth - (segments - 1) * segmentGap) / segments
  const barX = panelX + 13; const barY = panelY + panelHeight - 16
  const fillCount = dist < 100 ? 7 : dist < 200 ? 5 : 3
  for (let i = 0; i < segments; i++) {
    ctx.fillStyle = i < fillCount ? '#ff6e4b' : 'rgba(255,120,90,0.2)'
    ctx.fillRect(barX + i * (segmentWidth + segmentGap), barY, segmentWidth, 6)
  }
  ctx.textAlign = 'left'
}
