'use client'

import { useEffect, useRef } from 'react'

export default function CyberspaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.log('❌ Canvas ref not found')
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.log('❌ Canvas context not found')
      return
    }

    console.log('✅ Cyberspace background started!', { width: canvas.width, height: canvas.height })

    // Set canvas size to actual screen size
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Globe parameters - make it BIG and visible!
    let centerX = canvas.width / 2
    let centerY = canvas.height / 2
    let radius = Math.min(canvas.width, canvas.height) * 0.25
    let rotation = 0

    // Grid lines for the globe
    const gridLines = 20
    const meridians = 24

    // Particles for cyberspace effect
    const particles: Array<{
      x: number
      y: number
      z: number
      speed: number
      color: string
    }> = []

    for (let i = 0; i < 150; i++) {
      // 70% green particles (safe), 30% red particles (danger!)
      const isRed = Math.random() < 0.3
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        speed: Math.random() * 2 + 0.5,
        color: isRed 
          ? ['#ff0000', '#ff3333', '#ff6666', '#ff0044'][Math.floor(Math.random() * 4)]
          : ['#00ff00', '#00ffaa', '#00ff88', '#88ff88'][Math.floor(Math.random() * 4)]
      })
    }

    // Animation loop
    const animate = () => {
      // Update center and radius on each frame for responsiveness
      centerX = canvas.width / 2
      centerY = canvas.height / 2
      radius = Math.min(canvas.width, canvas.height) * 0.25

      // Clear with dark background - darker for better UI contrast
      ctx.fillStyle = 'rgba(0, 0, 8, 0.25)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw floating particles (GREEN and RED theme) - bright and visible
      particles.forEach(p => {
        p.z -= p.speed
        if (p.z <= 0) {
          p.z = 1000
          p.x = Math.random() * canvas.width
          p.y = Math.random() * canvas.height
        }

        const scale = 1000 / (1000 + p.z)
        const x = (p.x - canvas.width / 2) * scale + canvas.width / 2
        const y = (p.y - canvas.height / 2) * scale + canvas.height / 2
        const size = (1 - p.z / 1000) * 4

        ctx.fillStyle = p.color
        ctx.globalAlpha = (1 - p.z / 1000) * 0.9 // Much more visible
        ctx.fillRect(x, y, size, size)
        ctx.globalAlpha = 1
      })

      rotation += 0.005

      // Glowing half-sphere globe (like mock) behind title
      const domeRadius = Math.min(canvas.width, canvas.height) * 0.28
      const domeY = canvas.height * 0.46
      
      // Large soft glow
      const glowGradient = ctx.createRadialGradient(centerX, domeY, domeRadius * 0.2, centerX, domeY, domeRadius * 1.8)
      glowGradient.addColorStop(0, 'rgba(0, 255, 120, 0.35)')
      glowGradient.addColorStop(0.35, 'rgba(0, 255, 120, 0.2)')
      glowGradient.addColorStop(0.7, 'rgba(0, 255, 120, 0.08)')
      glowGradient.addColorStop(1, 'rgba(0, 255, 120, 0)')
      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(centerX, domeY, domeRadius * 2, 0, Math.PI * 2)
      ctx.fill()

      // Draw the dome with bright grid lines
      ctx.shadowBlur = 12
      ctx.shadowColor = '#00ff66'
      
      // Latitude lines on dome (horizontal ellipses)
      for (let i = 0; i <= 9; i++) {
        const angle = (i / 10) * (Math.PI / 2) // Only draw top half of sphere
        const y = -Math.cos(angle) * domeRadius
        const r = Math.sin(angle) * domeRadius
        
        ctx.strokeStyle = `rgba(0, 255, 120, ${0.45 + Math.sin(angle) * 0.35})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.ellipse(centerX, domeY + y, r, r * 0.32, 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Longitude lines on dome (vertical meridians)
      const meridianCount = 18
      for (let i = 0; i < meridianCount; i++) {
        const angle = (i / meridianCount) * Math.PI + rotation * 0.7
        const visible = Math.abs(Math.sin(angle))
        
        ctx.strokeStyle = `rgba(0, 255, 120, ${0.35 + visible * 0.35})`
        ctx.lineWidth = 2
        ctx.beginPath()
        
        // Draw arc from bottom to top of dome
        for (let j = 0; j <= 20; j++) {
          const t = j / 20
          const latAngle = t * (Math.PI / 2)
          const y = -Math.cos(latAngle) * domeRadius
          const r = Math.sin(latAngle) * domeRadius
          const x = centerX + Math.sin(angle) * r
          const z = Math.cos(angle) * r
          
          if (z > 0) {
            if (j === 0) ctx.moveTo(x, domeY + y)
            else ctx.lineTo(x, domeY + y)
          }
        }
        ctx.stroke()
      }
      
      ctx.shadowBlur = 0

      // Grid floor connected to dome (brighter but not overpowering)
      const gridSize = 42
      const gridCount = 10
      const horizonY = domeY + domeRadius * 0.15
      
      ctx.shadowBlur = 10
      ctx.shadowColor = '#00ff66'
      
      // Horizontal lines
      for (let i = 0; i < gridCount; i++) {
        const t = i / gridCount
        const fade = 1 - t * 0.7
        const y = horizonY + t * t * (canvas.height - horizonY) * 1.05
        
        if (y <= canvas.height) {
          ctx.strokeStyle = `rgba(0, 255, 120, ${0.55 * fade})`
          ctx.lineWidth = 2.2 * fade
          
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(canvas.width, y)
          ctx.stroke()
        }
      }

      // Vertical lines with perspective convergence
      const verticalLineCount = 18
      for (let i = -verticalLineCount; i <= verticalLineCount; i++) {
        const fade = 1 - Math.abs(i / verticalLineCount) * 0.6
        ctx.strokeStyle = `rgba(0, 255, 120, ${0.5 * fade})`
        ctx.lineWidth = 2.2 * fade
        
        const startX = centerX + i * gridSize * 3.2
        const endX = centerX + i * gridSize * 0.08
        
        ctx.beginPath()
        ctx.moveTo(startX, canvas.height)
        ctx.lineTo(endX, horizonY)
        ctx.stroke()
      }
      
      ctx.shadowBlur = 0

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-screen h-screen pointer-events-none"
      style={{ 
        background: 'linear-gradient(180deg, #000000 0%, #000011 50%, #000022 100%)',
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  )
}
