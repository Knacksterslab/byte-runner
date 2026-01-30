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

    for (let i = 0; i < 200; i++) {
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

      // Clear with dark background
      ctx.fillStyle = 'rgba(0, 0, 17, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw floating particles (GREEN theme)
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
        ctx.globalAlpha = 1 - p.z / 1000
        ctx.fillRect(x, y, size, size)
        ctx.globalAlpha = 1
      })

      // Draw rotating 3D GREEN globe
      rotation += 0.005

      // Globe glow effect - GREEN!
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.7, centerX, centerY, radius * 1.3)
      gradient.addColorStop(0, 'rgba(0, 255, 0, 0.2)')
      gradient.addColorStop(0.5, 'rgba(0, 255, 0, 0.1)')
      gradient.addColorStop(1, 'rgba(0, 255, 0, 0)')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2)
      ctx.fill()

      // Draw latitude lines (parallels) - GREEN!
      for (let i = 0; i <= gridLines; i++) {
        const lat = (i / gridLines) * Math.PI
        const y = Math.cos(lat) * radius
        const r = Math.sin(lat) * radius

        ctx.strokeStyle = `rgba(0, 255, 0, ${0.4 + Math.abs(Math.sin(lat)) * 0.4})`
        ctx.lineWidth = 2
        ctx.beginPath()

        for (let j = 0; j <= meridians; j++) {
          const lon = (j / meridians) * Math.PI * 2 + rotation
          const x = Math.cos(lon) * r
          const z = Math.sin(lon) * r

          // Simple 3D projection - only draw front side
          if (z > -radius * 0.2) {
            const screenX = centerX + x
            const screenY = centerY + y
            const alpha = (z + radius * 0.2) / (radius * 1.2)
            if (j === 0) {
              ctx.moveTo(screenX, screenY)
            } else {
              ctx.lineTo(screenX, screenY)
            }
          }
        }
        ctx.stroke()
      }

      // Draw longitude lines (meridians) - GREEN!
      for (let i = 0; i < meridians; i++) {
        const lon = (i / meridians) * Math.PI * 2 + rotation

        ctx.strokeStyle = `rgba(0, 255, 0, ${0.3 + Math.abs(Math.cos(lon)) * 0.4})`
        ctx.lineWidth = 2
        ctx.beginPath()

        let firstPoint = true
        for (let j = 0; j <= gridLines; j++) {
          const lat = (j / gridLines) * Math.PI
          const y = Math.cos(lat) * radius
          const r = Math.sin(lat) * radius
          const x = Math.cos(lon) * r
          const z = Math.sin(lon) * r

          // Only draw visible parts
          if (z > -radius * 0.2) {
            const screenX = centerX + x
            const screenY = centerY + y
            if (firstPoint) {
              ctx.moveTo(screenX, screenY)
              firstPoint = false
            } else {
              ctx.lineTo(screenX, screenY)
            }
          } else {
            firstPoint = true
          }
        }
        ctx.stroke()
      }

      // Draw globe outline - BRIGHT GREEN!
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)'
      ctx.lineWidth = 3
      ctx.shadowBlur = 15
      ctx.shadowColor = '#00ff00'
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.shadowBlur = 0

      // Add rotating data points - GREEN (safe) and RED (threats)!
      const dataPoints = 40
      for (let i = 0; i < dataPoints; i++) {
        const angle1 = (i / dataPoints) * Math.PI
        const angle2 = (i * 2.4) + rotation * 3
        const lat = angle1
        const lon = angle2
        const y = Math.cos(lat) * radius
        const r = Math.sin(lat) * radius
        const x = Math.cos(lon) * r
        const z = Math.sin(lon) * r

        if (z > 0) {
          const screenX = centerX + x
          const screenY = centerY + y
          const pulse = Math.sin(Date.now() * 0.003 + i) * 0.5 + 0.5
          
          // 40% of data points are RED (threats), 60% green (safe)
          const isRedThreat = (i % 5) < 2

          if (isRedThreat) {
            ctx.fillStyle = `rgba(255, ${Math.floor(pulse * 50)}, 0, ${pulse * 0.9})`
            ctx.shadowBlur = 8
            ctx.shadowColor = '#ff0000'
          } else {
            ctx.fillStyle = `rgba(0, 255, ${Math.floor(pulse * 100)}, ${pulse * 0.8})`
            ctx.shadowBlur = 5
            ctx.shadowColor = '#00ff00'
          }
          
          ctx.beginPath()
          ctx.arc(screenX, screenY, 2 + pulse * 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }

      // Draw grid floor - GREEN!
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)'
      ctx.lineWidth = 1
      const gridSize = 40
      const gridCount = 15
      const gridY = canvas.height * 0.8

      for (let i = -gridCount; i < gridCount; i++) {
        const fade = 1 - Math.abs(i / gridCount) * 0.7
        ctx.strokeStyle = `rgba(0, 255, 0, ${0.15 * fade})`
        
        // Horizontal lines
        ctx.beginPath()
        ctx.moveTo(0, gridY + i * gridSize)
        ctx.lineTo(canvas.width, gridY + i * gridSize)
        ctx.stroke()
      }

      for (let i = -gridCount; i < gridCount; i++) {
        const fade = 1 - Math.abs(i / gridCount) * 0.7
        ctx.strokeStyle = `rgba(0, 255, 0, ${0.15 * fade})`
        
        // Vertical lines with perspective
        const centerOffset = canvas.width / 2
        const x = centerOffset + i * gridSize
        ctx.beginPath()
        ctx.moveTo(x, gridY - gridCount * gridSize)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

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
        background: 'linear-gradient(180deg, #000033 0%, #000011 50%, #001122 100%)',
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
