import type { GameState, ConfettiParticle } from './GameState'

export function drawBackground(s: GameState): void {
  const { ctx, canvas, images, particles, frameScale, performanceMode, effectiveObstacleSpeed } = s
  if (images.background.complete && images.background.naturalWidth > 0) {
    // PERF: the filtered background + full-screen gradients are pre-rendered
    // once per size into an offscreen canvas and blitted every frame.
    // (ctx.filter per frame was the single biggest CPU cost in Chrome.)
    if (
      !s.bgCache ||
      s.bgCache.width !== Math.floor(s.logicalWidth) ||
      s.bgCache.height !== Math.floor(s.logicalHeight)
    ) {
      const off = s.bgCache ?? document.createElement('canvas')
      off.width = Math.floor(s.logicalWidth)
      off.height = Math.floor(s.logicalHeight)
      const octx = off.getContext('2d')!
      const img = images.background
      const scale = Math.max(s.logicalWidth / img.naturalWidth, s.logicalHeight / img.naturalHeight)
      const drawWidth = img.naturalWidth * scale
      const drawHeight = img.naturalHeight * scale
      octx.filter = 'saturate(0.82) brightness(0.88)'
      octx.globalAlpha = 0.86
      octx.drawImage(img, (s.logicalWidth - drawWidth) / 2, (s.logicalHeight - drawHeight) / 2, drawWidth, drawHeight)
      octx.filter = 'none'
      octx.globalAlpha = 1
      const vignette = octx.createRadialGradient(s.logicalWidth / 2, s.logicalHeight * 0.42, 0, s.logicalWidth / 2, s.logicalHeight * 0.42, s.logicalWidth * 0.75)
      vignette.addColorStop(0, 'rgba(0,0,0,0.04)')
      vignette.addColorStop(1, 'rgba(2,4,10,0.46)')
      octx.fillStyle = vignette
      octx.fillRect(0, 0, s.logicalWidth, s.logicalHeight)
      const horizonGlow = octx.createRadialGradient(s.logicalWidth / 2, s.logicalHeight * 0.62, 0, s.logicalWidth / 2, s.logicalHeight * 0.62, s.logicalWidth * 0.5)
      horizonGlow.addColorStop(0, 'rgba(36, 180, 130, 0.16)')
      horizonGlow.addColorStop(1, 'rgba(10, 40, 30, 0)')
      octx.fillStyle = horizonGlow
      octx.fillRect(0, 0, s.logicalWidth, s.logicalHeight)
      s.bgCache = off
      s.vignetteCache = null
      s.horizonCache = null
    }
    ctx.drawImage(s.bgCache, 0, 0, s.logicalWidth, s.logicalHeight)
  } else {
    if (!s.cachedGradient || s.cachedGradientWidth !== s.logicalWidth || s.cachedGradientHeight !== s.logicalHeight) {
      s.cachedGradient = ctx.createRadialGradient(s.logicalWidth / 2, s.logicalHeight / 2, 0, s.logicalWidth / 2, s.logicalHeight / 2, s.logicalWidth)
      s.cachedGradient.addColorStop(0, '#0b1020')
      s.cachedGradient.addColorStop(1, '#02030a')
      s.cachedGradientWidth = s.logicalWidth
      s.cachedGradientHeight = s.logicalHeight
    }
    ctx.fillStyle = s.cachedGradient
    ctx.fillRect(0, 0, s.logicalWidth, s.logicalHeight)
  }
  ctx.fillStyle = '#ffffff'
  const now = Date.now()
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]
    p.y += p.speed * frameScale
    if (p.y > s.logicalHeight) { p.y = 0; p.x = Math.random() * s.logicalWidth }
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
  const isMobile = s.logicalWidth < 768
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
    if (p.life <= 0 || p.y > s.logicalHeight + 50) s.confettiParticles.splice(i, 1)
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
