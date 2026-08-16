/**
 * Procedural neon-vector shape primitives for game entities.
 * Each shape is drawn centered at the origin; `s` is the half-size.
 * Style contract: translucent fill in `color`, hard stroke in `color`,
 * details in `accent`. No text, no emoji, no images.
 */
import type { ShapeKind } from '../visuals'

type Ctx = CanvasRenderingContext2D
type ShapeFn = (ctx: Ctx, s: number, color: string, accent: string) => void

const poly = (ctx: Ctx, pts: number[][], close = true): void => {
  ctx.beginPath()
  pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
  if (close) ctx.closePath()
}

const line = (ctx: Ctx, x1: number, y1: number, x2: number, y2: number): void => {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
}

const dot = (ctx: Ctx, x: number, y: number, r: number, fill: string): void => {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill()
}

/** Filled-outline toggle: `instant` threats render solid, `minor` hollow. */
export const SHAPES: Record<ShapeKind, ShapeFn> = {
  keyhole: (ctx, s, color, accent) => {
    ctx.beginPath(); ctx.arc(0, 0, s * 0.85, 0, Math.PI * 2)
    ctx.fillStyle = color + '2E'; ctx.fill(); ctx.strokeStyle = color; ctx.stroke()
    ctx.beginPath(); ctx.arc(0, -s * 0.2, s * 0.24, 0, Math.PI * 2)
    ctx.moveTo(0, s * 0.05); ctx.lineTo(s * 0.17, s * 0.5); ctx.lineTo(-s * 0.17, s * 0.5); ctx.closePath()
    ctx.fillStyle = accent; ctx.fill()
  },
  hook: (ctx, s, color, accent) => {
    ctx.strokeStyle = color; ctx.lineWidth = s * 0.16; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(s * 0.3, -s * 0.55); ctx.lineTo(s * 0.3, s * 0.15)
    ctx.arc(-s * 0.1, s * 0.15, s * 0.4, 0, Math.PI); ctx.stroke()
    ctx.beginPath(); ctx.arc(s * 0.3, -s * 0.62, s * 0.14, 0, Math.PI * 2)
    ctx.strokeStyle = accent; ctx.lineWidth = s * 0.07; ctx.stroke()
    line(ctx, -s * 0.5, s * 0.15, -s * 0.68, s * 0.38)
  },
  gear: (ctx, s, color, accent) => {
    ctx.save()
    for (let i = 0; i < 8; i++) {
      ctx.save(); ctx.rotate((i * Math.PI) / 4)
      ctx.fillStyle = color + '66'; ctx.fillRect(-s * 0.12, -s * 0.85, s * 0.24, s * 0.28)
      ctx.restore()
    }
    ctx.restore()
    ctx.beginPath(); ctx.arc(0, 0, s * 0.58, 0, Math.PI * 2)
    ctx.fillStyle = color + '2E'; ctx.fill(); ctx.strokeStyle = color; ctx.stroke()
    ctx.beginPath(); ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2)
    ctx.strokeStyle = accent; ctx.stroke()
  },
  eye: (ctx, s, color, accent) => {
    ctx.beginPath(); ctx.moveTo(-s * 0.85, 0)
    ctx.quadraticCurveTo(0, -s * 0.62, s * 0.85, 0)
    ctx.quadraticCurveTo(0, s * 0.62, -s * 0.85, 0); ctx.closePath()
    ctx.fillStyle = color + '2E'; ctx.fill(); ctx.strokeStyle = color; ctx.stroke()
    ctx.beginPath(); ctx.arc(0, 0, s * 0.26, 0, Math.PI * 2)
    ctx.fillStyle = accent; ctx.fill()
    dot(ctx, 0, 0, s * 0.1, '#0a0e1a')
  },
  signal: (ctx, s, color, accent) => {
    dot(ctx, 0, s * 0.6, s * 0.12, color)
    ctx.strokeStyle = accent; ctx.lineWidth = s * 0.09; ctx.lineCap = 'round'
    for (const [r, a] of [[0.32, 1], [0.55, 0.75], [0.78, 0.45]] as const) {
      ctx.globalAlpha *= a === 1 ? 1 : a
      ctx.beginPath(); ctx.arc(0, s * 0.6, s * r, Math.PI * 1.22, Math.PI * 1.78); ctx.stroke()
      ctx.globalAlpha /= a === 1 ? 1 : a
    }
    ctx.strokeStyle = color; ctx.globalAlpha = 1
  },
  badge: (ctx, s, color, accent) => {
    ctx.strokeStyle = color; ctx.lineWidth = s * 0.08
    ctx.strokeRect(-s * 0.6, -s * 0.45, s * 1.2, s * 0.95)
    ctx.fillStyle = color + '2E'; ctx.fillRect(-s * 0.6, -s * 0.45, s * 1.2, s * 0.95)
    ctx.beginPath(); ctx.arc(-s * 0.28, -s * 0.1, s * 0.17, 0, Math.PI * 2)
    ctx.strokeStyle = accent; ctx.lineWidth = s * 0.07; ctx.stroke()
    ctx.strokeStyle = accent; ctx.lineWidth = s * 0.06
    line(ctx, -s * 0.02, -s * 0.2, s * 0.44, -s * 0.2)
    line(ctx, -s * 0.02, s * 0.02, s * 0.44, s * 0.02)
    line(ctx, -s * 0.02, s * 0.24, s * 0.3, s * 0.24)
    dot(ctx, 0, -s * 0.45, s * 0.07, accent)
  },
  dbCrack: (ctx, s, color, accent) => {
    ctx.strokeStyle = color; ctx.lineWidth = s * 0.08
    ctx.beginPath(); ctx.ellipse(0, -s * 0.42, s * 0.48, s * 0.17, 0, 0, Math.PI * 2); ctx.stroke()
    line(ctx, -s * 0.48, -s * 0.42, -s * 0.48, s * 0.42)
    line(ctx, s * 0.48, -s * 0.42, s * 0.48, s * 0.42)
    ctx.beginPath(); ctx.ellipse(0, s * 0.42, s * 0.48, s * 0.17, 0, 0, Math.PI); ctx.stroke()
    ctx.fillStyle = color + '2E'
    ctx.beginPath(); ctx.ellipse(0, -s * 0.42, s * 0.48, s * 0.17, 0, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = accent; ctx.lineWidth = s * 0.07
    poly(ctx, [[-s * 0.1, -s * 0.3], [s * 0.12, -s * 0.05], [-s * 0.08, s * 0.12], [s * 0.1, s * 0.4]], false)
    ctx.stroke()
  },
  mask: (ctx, s, color, accent) => {
    ctx.beginPath(); ctx.arc(0, 0, s * 0.85, 0, Math.PI * 2)
    ctx.strokeStyle = color; ctx.lineWidth = s * 0.08; ctx.stroke()
    ctx.beginPath(); ctx.arc(0, 0, s * 0.85, Math.PI / 2, (Math.PI * 3) / 2)
    ctx.fillStyle = color + '38'; ctx.fill()
    dot(ctx, -s * 0.32, -s * 0.12, s * 0.1, accent)
    dot(ctx, s * 0.32, -s * 0.12, s * 0.1, accent)
    ctx.beginPath(); ctx.arc(0, s * 0.12, s * 0.38, Math.PI * 0.15, Math.PI * 0.85)
    ctx.strokeStyle = accent; ctx.lineWidth = s * 0.07; ctx.stroke()
  },
  door: (ctx, s, color, accent) => {
    ctx.fillStyle = color + '2E'; ctx.strokeStyle = color; ctx.lineWidth = s * 0.08
    ctx.fillRect(-s * 0.4, -s * 0.6, s * 0.8, s * 1.2)
    ctx.strokeRect(-s * 0.4, -s * 0.6, s * 0.8, s * 1.2)
    dot(ctx, s * 0.2, s * 0.08, s * 0.08, accent)
    ctx.strokeStyle = accent; ctx.lineWidth = s * 0.06
    line(ctx, -s * 0.4, -s * 0.25, s * 0.4, -s * 0.25)
    line(ctx, -s * 0.4, s * 0.35, s * 0.4, s * 0.35)
  },
  shredder: (ctx, s, color, accent) => {
    ctx.fillStyle = color + '2E'; ctx.strokeStyle = color; ctx.lineWidth = s * 0.08
    ctx.fillRect(-s * 0.65, -s * 0.55, s * 1.3, s * 0.26)
    ctx.strokeRect(-s * 0.65, -s * 0.55, s * 1.3, s * 0.26)
    poly(ctx, [[-s * 0.55, -s * 0.29], [s * 0.55, -s * 0.29], [s * 0.4, s * 0.62], [-s * 0.4, s * 0.62]])
    ctx.fill(); ctx.stroke()
    ctx.strokeStyle = accent; ctx.lineWidth = s * 0.06
    line(ctx, -s * 0.35, -s * 0.48, s * 0.35, -s * 0.48)
    for (const x of [-0.18, 0.02, 0.22]) line(ctx, x * s, s * 0.0, x * s, s * 0.48)
  },
  book: (ctx, s, color, accent) => {
    ctx.fillStyle = color + '2E'; ctx.strokeStyle = color; ctx.lineWidth = s * 0.08
    ctx.fillRect(-s * 0.5, -s * 0.62, s, s * 1.24); ctx.strokeRect(-s * 0.5, -s * 0.62, s, s * 1.24)
    line(ctx, -s * 0.18, -s * 0.62, -s * 0.18, s * 0.62)
    ctx.fillStyle = accent + 'CC'; ctx.fillRect(s * 0.1, -s * 0.62, s * 0.16, s * 0.34)
    ctx.strokeStyle = accent; ctx.lineWidth = s * 0.06
    for (const y of [-0.1, 0.12, 0.34]) line(ctx, s * 0.02, y * s, s * 0.38, y * s)
  },
  siren: (ctx, s, color, accent) => {
    ctx.fillStyle = color + '2E'; ctx.strokeStyle = color; ctx.lineWidth = s * 0.08
    ctx.beginPath(); ctx.arc(0, s * 0.12, s * 0.52, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke()
    ctx.fillRect(-s * 0.66, s * 0.12, s * 1.32, s * 0.2); ctx.strokeRect(-s * 0.66, s * 0.12, s * 1.32, s * 0.2)
    dot(ctx, 0, -s * 0.1, s * 0.13, accent)
    ctx.strokeStyle = accent; ctx.lineWidth = s * 0.06; ctx.lineCap = 'round'
    for (const a of [-0.55, 0, 0.55]) line(ctx, a * s, -s * 0.38, a * s * 1.5, -s * 0.66)
  },
  clipboard: (ctx, s, color, accent) => {
    ctx.fillStyle = color + '2E'; ctx.strokeStyle = color; ctx.lineWidth = s * 0.08
    ctx.fillRect(-s * 0.48, -s * 0.5, s * 0.96, s * 1.12); ctx.strokeRect(-s * 0.48, -s * 0.5, s * 0.96, s * 1.12)
    ctx.fillStyle = accent; ctx.fillRect(-s * 0.16, -s * 0.62, s * 0.32, s * 0.2)
    ctx.strokeStyle = accent; ctx.lineWidth = s * 0.1; ctx.lineCap = 'round'
    poly(ctx, [[-s * 0.22, s * 0.05], [-s * 0.05, s * 0.24], [s * 0.26, -s * 0.18]], false); ctx.stroke()
  },
  house: (ctx, s, color, accent) => {
    ctx.fillStyle = color + '2E'; ctx.strokeStyle = color; ctx.lineWidth = s * 0.08
    poly(ctx, [[0, -s * 0.68], [s * 0.66, -s * 0.05], [s * 0.54, s * 0.62], [-s * 0.54, s * 0.62], [-s * 0.66, -s * 0.05]])
    ctx.fill(); ctx.stroke()
    ctx.strokeStyle = accent; ctx.lineWidth = s * 0.07
    ctx.strokeRect(-s * 0.16, s * 0.14, s * 0.32, s * 0.48)
  },
  cam: (ctx, s, color, accent) => {
    ctx.fillStyle = color + '2E'; ctx.strokeStyle = color; ctx.lineWidth = s * 0.08
    ctx.fillRect(-s * 0.58, -s * 0.32, s * 0.82, s * 0.64); ctx.strokeRect(-s * 0.58, -s * 0.32, s * 0.82, s * 0.64)
    poly(ctx, [[s * 0.24, -s * 0.2], [s * 0.62, -s * 0.4], [s * 0.62, s * 0.4], [s * 0.24, s * 0.2]])
    ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.arc(-s * 0.17, 0, s * 0.15, 0, Math.PI * 2)
    ctx.strokeStyle = accent; ctx.lineWidth = s * 0.07; ctx.stroke()
  },
  suitcase: (ctx, s, color, accent) => {
    ctx.fillStyle = color + '2E'; ctx.strokeStyle = color; ctx.lineWidth = s * 0.08
    ctx.fillRect(-s * 0.6, -s * 0.32, s * 1.2, s * 0.92); ctx.strokeRect(-s * 0.6, -s * 0.32, s * 1.2, s * 0.92)
    ctx.beginPath(); ctx.arc(0, -s * 0.32, s * 0.24, Math.PI, 0)
    ctx.strokeStyle = color; ctx.stroke()
    ctx.strokeStyle = accent; ctx.lineWidth = s * 0.07
    line(ctx, 0, -s * 0.32, 0, s * 0.6)
  },
  hexLock: (ctx, s, color, accent) => {
    const hex: number[][] = []
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6
      hex.push([Math.cos(a) * s * 0.72, Math.sin(a) * s * 0.72])
    }
    ctx.fillStyle = color + '2E'; ctx.strokeStyle = color; ctx.lineWidth = s * 0.08
    poly(ctx, hex); ctx.fill(); ctx.stroke()
    ctx.strokeStyle = accent; ctx.lineWidth = s * 0.1
    ctx.beginPath(); ctx.arc(0, -s * 0.1, s * 0.2, Math.PI, 0); ctx.stroke()
    dot(ctx, 0, s * 0.18, s * 0.08, accent)
  },
  package: (ctx, s, color, accent) => {
    ctx.fillStyle = color + '2E'; ctx.strokeStyle = color; ctx.lineWidth = s * 0.08
    ctx.fillRect(-s * 0.55, -s * 0.5, s * 1.1, s * 1.05); ctx.strokeRect(-s * 0.55, -s * 0.5, s * 1.1, s * 1.05)
    ctx.strokeStyle = accent; ctx.lineWidth = s * 0.06
    line(ctx, 0, -s * 0.5, 0, s * 0.55)
    line(ctx, -s * 0.55, -s * 0.1, s * 0.55, -s * 0.1)
    ctx.strokeRect(-s * 0.14, s * 0.12, s * 0.28, s * 0.2)
  },
  insider: (ctx, s, color, accent) => {
    ctx.strokeStyle = color; ctx.lineWidth = s * 0.08
    ctx.beginPath(); ctx.arc(-s * 0.12, -s * 0.28, s * 0.24, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(-s * 0.12, s * 0.68, s * 0.46, Math.PI, 0); ctx.stroke()
    ctx.strokeStyle = accent; ctx.lineWidth = s * 0.1; ctx.lineCap = 'round'
    line(ctx, s * 0.42, -s * 0.4, s * 0.42, s * 0.04)
    dot(ctx, s * 0.42, s * 0.24, s * 0.07, accent)
  },
  mailAlert: (ctx, s, color, accent) => {
    ctx.fillStyle = color + '2E'; ctx.strokeStyle = color; ctx.lineWidth = s * 0.08
    ctx.fillRect(-s * 0.62, -s * 0.28, s * 1.24, s * 0.84); ctx.strokeRect(-s * 0.62, -s * 0.28, s * 1.24, s * 0.84)
    poly(ctx, [[-s * 0.62, -s * 0.28], [0, s * 0.22], [s * 0.62, -s * 0.28]], false); ctx.stroke()
    ctx.strokeStyle = accent; ctx.lineWidth = s * 0.09; ctx.lineCap = 'round'
    poly(ctx, [[s * 0.1, -s * 0.66], [-s * 0.12, -s * 0.36], [s * 0.04, -s * 0.36], [-s * 0.08, -s * 0.02]], false); ctx.stroke()
  },
  tag: (ctx, s, color, accent) => {
    ctx.save(); ctx.rotate(Math.PI / 4)
    ctx.fillStyle = color + '2E'; ctx.strokeStyle = color; ctx.lineWidth = s * 0.08
    ctx.fillRect(-s * 0.5, -s * 0.5, s, s); ctx.strokeRect(-s * 0.5, -s * 0.5, s, s)
    ctx.restore()
    ctx.beginPath(); ctx.arc(-s * 0.28, -s * 0.28, s * 0.1, 0, Math.PI * 2)
    ctx.strokeStyle = accent; ctx.lineWidth = s * 0.07; ctx.stroke()
    ctx.beginPath(); ctx.moveTo(-s * 0.36, -s * 0.36); ctx.lineTo(-s * 0.72, -s * 0.72); ctx.stroke()
  },
  share: (ctx, s, color, accent) => {
    ctx.strokeStyle = color; ctx.lineWidth = s * 0.07
    const nodes: number[][] = [[-s * 0.42, s * 0.4], [s * 0.42, s * 0.4], [0, -s * 0.42]]
    poly(ctx, nodes, false); ctx.stroke()
    for (const [x, y] of nodes) {
      ctx.beginPath(); ctx.arc(x, y, s * 0.15, 0, Math.PI * 2)
      ctx.fillStyle = color + '2E'; ctx.fill(); ctx.strokeStyle = color; ctx.stroke()
    }
    dot(ctx, 0, -s * 0.42, s * 0.06, accent)
  },
  usb: (ctx, s, color, accent) => {
    ctx.fillStyle = color + '2E'; ctx.strokeStyle = color; ctx.lineWidth = s * 0.08
    ctx.fillRect(-s * 0.3, -s * 0.05, s * 0.6, s * 0.66); ctx.strokeRect(-s * 0.3, -s * 0.05, s * 0.6, s * 0.66)
    ctx.strokeStyle = accent; ctx.lineWidth = s * 0.07
    ctx.strokeRect(-s * 0.17, -s * 0.42, s * 0.34, s * 0.37)
    line(ctx, -s * 0.07, -s * 0.42, -s * 0.07, -s * 0.56)
    line(ctx, s * 0.07, -s * 0.42, s * 0.07, -s * 0.56)
    line(ctx, 0, s * 0.12, 0, s * 0.4)
    poly(ctx, [[-s * 0.1, s * 0.32], [0, s * 0.48], [s * 0.1, s * 0.32]], false); ctx.stroke()
  },
}
