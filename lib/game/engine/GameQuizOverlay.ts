import type { GameState } from './GameState'

type QuizRefs = {
  currentQuizRef: { current: import('../inGameQuizzes').QuizChallenge | null }
  countdownRef: { current: number }
  activeRef: { current: boolean }
  pointsRef: { current: number }
  timeRemainingRef: { current: number }
}

export function renderQuizOverlay(s: GameState, quizRefs: QuizRefs): void {
  if (!quizRefs.currentQuizRef.current) return
  const { ctx, canvas } = s
  const quizData = quizRefs.currentQuizRef.current
  const countdown = quizRefs.countdownRef.current
  const isMobile = canvas.width < 768

  if (countdown > 0) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const pulse = Math.sin(Date.now() / 150) * 0.3 + 0.7
    ctx.font = `bold ${Math.floor((isMobile ? 120 : 180) * pulse)}px monospace`
    ctx.fillStyle = '#00ffff'; ctx.textAlign = 'center'; ctx.shadowBlur = 40; ctx.shadowColor = '#00ffff'
    ctx.fillText(countdown.toString(), canvas.width / 2, canvas.height / 2)
    ctx.font = `bold ${isMobile ? 20 : 32}px monospace`; ctx.fillStyle = '#ffff00'; ctx.shadowBlur = 10
    ctx.fillText('⚡ SECURITY CHALLENGE INCOMING ⚡', canvas.width / 2, canvas.height / 2 - 120)
    ctx.font = `bold ${isMobile ? 18 : 24}px monospace`; ctx.fillStyle = '#ffffff'
    ctx.fillText(quizData.question, canvas.width / 2, canvas.height / 2 + 100)
    ctx.shadowBlur = 0; ctx.textAlign = 'left'
    return
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'; ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.save(); ctx.strokeStyle = 'rgba(0, 255, 255, 0.25)'; ctx.lineWidth = isMobile ? 1 : 2
  const gridSize = isMobile ? 40 : 60; const gridStartY = canvas.height * 0.65
  const vanishX = canvas.width / 2; const vanishY = canvas.height * 0.3
  for (let i = 0; i <= canvas.width; i += gridSize) {
    ctx.beginPath(); ctx.moveTo(i, gridStartY)
    ctx.lineTo(vanishX + (i - vanishX) * 0.3, canvas.height); ctx.stroke()
  }
  const numH = Math.floor((canvas.height - gridStartY) / gridSize)
  for (let i = 0; i <= numH; i++) {
    const y = gridStartY + i * gridSize; const d = i / numH
    ctx.beginPath(); ctx.moveTo(vanishX - vanishX * d, y)
    ctx.lineTo(vanishX + (canvas.width - vanishX) * d, y); ctx.stroke()
  }
  ctx.restore()

  const bannerH = isMobile ? 155 : 120
  ctx.fillStyle = 'rgba(10, 27, 63, 0.95)'; ctx.fillRect(0, 0, canvas.width, bannerH)
  ctx.strokeStyle = '#00ffff'; ctx.lineWidth = isMobile ? 2 : 3; ctx.strokeRect(0, 0, canvas.width, bannerH)
  ctx.font = `bold ${isMobile ? 24 : 32}px monospace`; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'
  ctx.fillText(quizData.question, canvas.width / 2, isMobile ? 32 : 40)
  ctx.font = `${isMobile ? 16 : 20}px monospace`; ctx.fillStyle = '#6ee7ff'
  ctx.fillText(quizData.instructions, canvas.width / 2, isMobile ? 58 : 75)

  ctx.textAlign = 'left'; ctx.font = `bold ${isMobile ? 32 : 42}px monospace`
  ctx.fillStyle = '#6ee7ff'; ctx.shadowBlur = 10; ctx.shadowColor = '#00ffff'
  ctx.fillText(`⚡ ${quizRefs.pointsRef.current.toString().padStart(2, '0')}`, isMobile ? 20 : 40, isMobile ? 110 : 180)
  ctx.shadowBlur = 0

  ctx.textAlign = 'right'
  const timeWarn = quizRefs.timeRemainingRef.current < 10
  ctx.fillStyle = timeWarn ? '#ff4d4d' : '#6ee7ff'; ctx.shadowBlur = timeWarn ? 15 : 10
  ctx.shadowColor = timeWarn ? '#ff0000' : '#00ffff'
  const mins = Math.floor(quizRefs.timeRemainingRef.current / 60)
  const secs = quizRefs.timeRemainingRef.current % 60
  ctx.fillText(`${mins}:${secs.toString().padStart(2, '0')}`, canvas.width - (isMobile ? 20 : 40), isMobile ? 110 : 180)
  ctx.shadowBlur = 0

  ctx.textAlign = 'center'; ctx.font = `${isMobile ? 13 : 18}px monospace`; ctx.fillStyle = '#ffffff'
  ctx.shadowBlur = 3; ctx.shadowColor = '#000000'
  ctx.fillText(quizData.educationalNote, canvas.width / 2, canvas.height - (isMobile ? 60 : 60))
  ctx.font = `${isMobile ? 11 : 16}px monospace`; ctx.fillStyle = '#6ee7ff'
  ctx.fillText(isMobile ? '📱 Swipe to Move' : '💻 WASD to Move', canvas.width / 2, canvas.height - (isMobile ? 40 : 35))
  ctx.shadowBlur = 0; ctx.textAlign = 'left'

  const { EMOJI_FONT_STACK } = s
  for (const item of s.powerups) {
    if (item.type !== 'quiz-item') continue
    const size = isMobile ? 130 : 180
    const pulse = Math.sin(Date.now() / 200) * 0.15 + 0.9
    ctx.shadowBlur = (isMobile ? 35 : 50) * pulse; ctx.shadowColor = '#00ccff'
    ctx.fillStyle = 'rgba(10, 30, 50, 0.85)'
    ctx.fillRect(item.x - size / 2, item.y - size / 2, size, size)
    ctx.fillStyle = 'rgba(0, 200, 255, 0.15)'
    ctx.fillRect(item.x - size / 2 + 4, item.y - size / 2 + 4, size - 8, size - 8)
    ctx.strokeStyle = '#00ccff'; ctx.lineWidth = isMobile ? 4 : 5
    ctx.strokeRect(item.x - size / 2, item.y - size / 2, size, size)
    ctx.shadowBlur = 0
    ctx.font = `bold ${isMobile ? 18 : 24}px monospace`; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'
    ctx.shadowBlur = 3
    const passwordText = item.sentBy.name.replace(/[^\x20-\x7E]/g, '')
    ctx.fillText(passwordText, item.x, item.y - size / 2 + (isMobile ? 35 : 45))
    ctx.font = `${isMobile ? 13 : 16}px monospace`; ctx.fillStyle = '#6ee7ff'
    ctx.fillText((item.sentBy.speciality as string) || 'password type', item.x, item.y + (isMobile ? 8 : 12))
    ctx.font = `bold ${isMobile ? 11 : 14}px monospace`; ctx.fillStyle = '#aaaaaa'
    ctx.fillText(`${item.sentBy.name.length} characters`, item.x, item.y + size / 2 - (isMobile ? 16 : 20))
    ctx.shadowBlur = 0; ctx.textAlign = 'left'
  }
}
