import type { QuizChallenge } from '../inGameQuizzes'

interface QuizCompletionParams {
  quizCompletionTimer: number
  quizCompletionSuccess: boolean
  finalPoints: number
  passingScore: number
  quizWrongItemId?: string | null
  quizFailChallenge?: QuizChallenge | null
}

function drawTeachingFailOverlay(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  p: QuizCompletionParams
): void {
  const isMobile = canvas.width < 768
  const DURATION = 4500

  const flashAlpha = 0.35 * (p.quizCompletionTimer / DURATION)
  ctx.fillStyle = `rgba(255, 0, 0, ${flashAlpha})`
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const quiz = p.quizFailChallenge!
  const wrongItem = quiz.items.find(item => item.id === p.quizWrongItemId)
  const correctItem = quiz.items.find(item => item.isCorrect)

  const overlayWidth = isMobile ? 340 : 640
  const overlayHeight = isMobile ? 310 : 420
  const overlayX = canvas.width / 2 - overlayWidth / 2
  const overlayY = canvas.height / 2 - overlayHeight / 2

  ctx.fillStyle = 'rgba(10, 0, 0, 0.95)'
  ctx.fillRect(overlayX, overlayY, overlayWidth, overlayHeight)
  ctx.strokeStyle = '#ff3333'
  ctx.lineWidth = 3
  ctx.shadowBlur = 20; ctx.shadowColor = '#ff0000'
  ctx.strokeRect(overlayX, overlayY, overlayWidth, overlayHeight)
  ctx.shadowBlur = 0

  const cx = canvas.width / 2
  const pulse = Math.sin(Date.now() / 120) * 0.25 + 0.75
  let y = overlayY + (isMobile ? 38 : 52)

  ctx.font = `bold ${Math.floor((isMobile ? 26 : 36) * pulse)}px monospace`
  ctx.fillStyle = '#ff4444'
  ctx.textAlign = 'center'
  ctx.fillText('❌ WRONG ANSWER!', cx, y)
  y += isMobile ? 36 : 48

  ctx.font = `bold ${isMobile ? 15 : 20}px monospace`
  ctx.fillStyle = '#ff9999'
  ctx.fillText(`You chose: "${wrongItem?.label ?? p.quizWrongItemId}"`, cx, y)
  y += isMobile ? 28 : 38

  ctx.font = `bold ${isMobile ? 15 : 20}px monospace`
  ctx.fillStyle = '#66ff88'
  ctx.fillText(`Correct: "${correctItem?.label ?? '—'}"`, cx, y)
  y += isMobile ? 22 : 30

  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(overlayX + 20, y); ctx.lineTo(overlayX + overlayWidth - 20, y)
  ctx.stroke()
  y += isMobile ? 18 : 24

  const note = quiz.educationalNote ?? correctItem?.description
  if (note) {
    ctx.font = `${isMobile ? 12 : 16}px monospace`
    ctx.fillStyle = '#66ccff'
    ctx.textAlign = 'center'
    const maxWidth = overlayWidth - 40
    const words = note.split(' ')
    let line = ''
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, cx, y)
        y += isMobile ? 18 : 22
        line = word
      } else {
        line = test
      }
    }
    if (line) { ctx.fillText(line, cx, y); y += isMobile ? 18 : 22 }
    y += isMobile ? 6 : 8
  }

  ctx.font = `${isMobile ? 11 : 14}px monospace`
  ctx.fillStyle = `rgba(180,180,180,${Math.max(0, p.quizCompletionTimer / DURATION)})`
  ctx.fillText('All powerups lost — keep learning!', cx, overlayY + overlayHeight - (isMobile ? 16 : 20))
  ctx.textAlign = 'left'
}

export function drawQuizCompletionMessage(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  p: QuizCompletionParams
): void {
  if (!p.quizCompletionSuccess && p.quizWrongItemId && p.quizFailChallenge) {
    drawTeachingFailOverlay(ctx, canvas, p)
    return
  }

  const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7
  const isMobile = canvas.width < 768

  const flashAlpha = 0.3 * (p.quizCompletionTimer / 2000)
  ctx.fillStyle = p.quizCompletionSuccess
    ? `rgba(0, 255, 0, ${flashAlpha})`
    : `rgba(255, 0, 0, ${flashAlpha})`
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const overlayWidth = isMobile ? 320 : 600
  const overlayHeight = isMobile ? 180 : 240
  const overlayX = canvas.width / 2 - overlayWidth / 2
  const overlayY = canvas.height / 2 - overlayHeight / 2

  ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'
  ctx.fillRect(overlayX, overlayY, overlayWidth, overlayHeight)

  ctx.strokeStyle = p.quizCompletionSuccess ? '#00ff00' : '#ff0000'
  ctx.lineWidth = 4
  ctx.shadowBlur = 20
  ctx.shadowColor = p.quizCompletionSuccess ? '#00ff00' : '#ff0000'
  ctx.strokeRect(overlayX, overlayY, overlayWidth, overlayHeight)
  ctx.shadowBlur = 0

  ctx.font = `bold ${Math.floor((isMobile ? 32 : 48) * pulse)}px monospace`
  ctx.fillStyle = p.quizCompletionSuccess ? '#00ff00' : '#ff0000'
  ctx.textAlign = 'center'
  ctx.fillText(
    p.quizCompletionSuccess ? '✅ QUIZ PASSED!' : '❌ QUIZ FAILED',
    canvas.width / 2,
    canvas.height / 2 - (isMobile ? 30 : 40)
  )

  ctx.font = `bold ${isMobile ? 24 : 32}px monospace`
  ctx.fillStyle = '#ffff00'
  ctx.fillText(
    `${p.finalPoints} / ${p.passingScore} Points`,
    canvas.width / 2,
    canvas.height / 2 + (isMobile ? 5 : 10)
  )

  ctx.font = `bold ${isMobile ? 16 : 24}px monospace`
  ctx.fillStyle = '#ffffff'
  ctx.fillText(
    p.quizCompletionSuccess ? 'Keep Your Gear! +500 Points' : 'All Powerups Lost!',
    canvas.width / 2,
    canvas.height / 2 + (isMobile ? 40 : 60)
  )
  ctx.textAlign = 'left'
}
