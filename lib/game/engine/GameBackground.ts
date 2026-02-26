import type { GameState, ConfettiParticle } from './GameState'

export function drawBackground(s: GameState): void {
  const { ctx, canvas, images, particles, frameScale, performanceMode, effectiveObstacleSpeed } = s
  if (images.background.complete && images.background.naturalWidth > 0) {
    const img = images.background
    const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight)
    const drawWidth = img.naturalWidth * scale
    const drawHeight = img.naturalHeight * scale
    ctx.save()
    ctx.filter = 'saturate(0.82) brightness(0.88)'
    ctx.globalAlpha = 0.86
    ctx.drawImage(img, (canvas.width - drawWidth) / 2, (canvas.height - drawHeight) / 2, drawWidth, drawHeight)
    ctx.restore()
    const vignette = ctx.createRadialGradient(canvas.width / 2, canvas.height * 0.42, 0, canvas.width / 2, canvas.height * 0.42, canvas.width * 0.75)
    vignette.addColorStop(0, 'rgba(0,0,0,0.04)')
    vignette.addColorStop(1, 'rgba(2,4,10,0.46)')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const horizonGlow = ctx.createRadialGradient(canvas.width / 2, canvas.height * 0.62, 0, canvas.width / 2, canvas.height * 0.62, canvas.width * 0.5)
    horizonGlow.addColorStop(0, 'rgba(36, 180, 130, 0.16)')
    horizonGlow.addColorStop(1, 'rgba(10, 40, 30, 0)')
    ctx.fillStyle = horizonGlow
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  } else {
    if (!s.cachedGradient || s.cachedGradientWidth !== canvas.width || s.cachedGradientHeight !== canvas.height) {
      s.cachedGradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width)
      s.cachedGradient.addColorStop(0, '#0b1020')
      s.cachedGradient.addColorStop(1, '#02030a')
      s.cachedGradientWidth = canvas.width
      s.cachedGradientHeight = canvas.height
    }
    ctx.fillStyle = s.cachedGradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  ctx.fillStyle = '#ffffff'
  const now = Date.now()
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]
    p.y += p.speed * frameScale
    if (p.y > canvas.height) { p.y = 0; p.x = Math.random() * canvas.width }
    const twinkle = performanceMode ? 0.6 : Math.sin(now / 800 + p.x) * 0.3 + 0.7
    ctx.globalAlpha = twinkle * 0.42
    const sz = p.size * 0.8
    ctx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz)
  }
  ctx.globalAlpha = 1.0
  s.bgOffset += effectiveObstacleSpeed * frameScale
  if (s.bgOffset > 50) s.bgOffset = 0
}

export function spawnConfetti(s: GameState, x: number, y: number, count: number): void {
  const colors = ['#00ff88', '#00ffff', '#ffff00', '#ff00ff', '#ff0080', '#0080ff', '#80ff00']
  const isMobile = s.canvas.width < 768
  const maxParticles = isMobile ? 30 : 60
  if (s.confettiParticles.length >= maxParticles) return
  const spawnCount = Math.min(count, maxParticles - s.confettiParticles.length)
  for (let i = 0; i < spawnCount; i++) {
    const angle = (Math.PI * 2 * i) / spawnCount + (Math.random() - 0.5) * 0.5
    const speed = 3 + Math.random() * 4
    s.confettiParticles.push({
      x, y,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2, rotationSpeed: (Math.random() - 0.5) * 0.3,
      life: 1, shape: Math.random() > 0.5 ? 'rect' : 'circle',
      size: isMobile ? 4 + Math.random() * 4 : 6 + Math.random() * 6
    })
  }
}

export function updateConfetti(s: GameState, frameMs: number): void {
  const gravity = 0.15; const decay = 0.015; const timeScale = frameMs / 16.67
  for (let i = s.confettiParticles.length - 1; i >= 0; i--) {
    const p = s.confettiParticles[i]
    p.vy += gravity * timeScale; p.x += p.vx * timeScale; p.y += p.vy * timeScale
    p.rotation += p.rotationSpeed * timeScale; p.life -= decay * timeScale
    if (p.life <= 0 || p.y > s.canvas.height + 50) s.confettiParticles.splice(i, 1)
  }
}

export function drawConfetti(s: GameState): void {
  for (const p of s.confettiParticles) {
    s.ctx.save(); s.ctx.globalAlpha = p.life; s.ctx.translate(p.x, p.y)
    s.ctx.rotate(p.rotation); s.ctx.fillStyle = p.color
    if (p.shape === 'rect') {
      s.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
    } else {
      s.ctx.beginPath(); s.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); s.ctx.fill()
    }
    s.ctx.restore()
  }
}
