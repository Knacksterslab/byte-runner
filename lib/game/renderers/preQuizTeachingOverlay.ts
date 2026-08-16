import type { CanvasDims } from "../engine/GameState"
import { getPreQuizLesson } from '@/lib/game/data/preQuizLessons'
import type { QuizChallenge } from '@/lib/game/inGameQuizzes'

interface PreQuizTeachingParams {
  preQuizTeachingTimer: number
  pendingQuizChallenge: QuizChallenge
  pendingQuizAutoStart: boolean
}

export function drawPreQuizTeachingOverlay(
  ctx: CanvasRenderingContext2D,
  canvas: CanvasDims,
  p: PreQuizTeachingParams
): void {
  const lesson = getPreQuizLesson(p.pendingQuizChallenge.type)
  const timeLeft = Math.max(0, Math.ceil(p.preQuizTeachingTimer / 1000))
  const isMobile = canvas.width < 768
  const boxWidth = isMobile ? 340 : 720
  const boxHeight = isMobile ? 260 : 320
  const boxX = canvas.width / 2 - boxWidth / 2
  const boxY = canvas.height / 2 - boxHeight / 2

  ctx.fillStyle = 'rgba(0, 0, 0, 0.82)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'rgba(5, 12, 22, 0.95)'
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight)
  ctx.strokeStyle = '#00ccff'
  ctx.lineWidth = 3
  ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)

  ctx.textAlign = 'center'
  ctx.font = `bold ${isMobile ? 24 : 36}px monospace`
  ctx.fillStyle = '#6ee7ff'
  ctx.fillText('DID YOU KNOW?', canvas.width / 2, boxY + (isMobile ? 50 : 64))

  ctx.font = `bold ${isMobile ? 16 : 24}px monospace`
  ctx.fillStyle = '#ffffff'
  ctx.fillText(lesson.title, canvas.width / 2, boxY + (isMobile ? 84 : 110))

  ctx.textAlign = 'left'
  ctx.font = `${isMobile ? 13 : 18}px monospace`
  ctx.fillStyle = '#d8f8ff'
  lesson.points.forEach((point, index) => {
    ctx.fillText(
      `• ${point}`,
      boxX + (isMobile ? 22 : 40),
      boxY + (isMobile ? 122 : 162) + index * (isMobile ? 28 : 38)
    )
  })

  ctx.textAlign = 'center'
  ctx.font = `bold ${isMobile ? 14 : 18}px monospace`
  ctx.fillStyle = '#00ff88'
  const statusText = p.pendingQuizAutoStart
    ? `Challenge starts in ${timeLeft}s`
    : `Briefing complete in ${timeLeft}s`
  ctx.fillText(statusText, canvas.width / 2, boxY + boxHeight - (isMobile ? 22 : 28))
  ctx.textAlign = 'left'
}
