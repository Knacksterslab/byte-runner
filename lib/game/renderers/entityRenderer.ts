/**
 * Unified neon-vector entity renderer. The ONLY module that draws threats
 * and kits in the game world. Visual specs come from lib/game/visuals.ts
 * (single source of truth); shape primitives from ./entityShapes.ts.
 *
 * PERF: entities are pre-rendered WITH their glow into offscreen canvases
 * (keyed by shape/color/size-bucket) and blitted with drawImage — per-frame
 * shadowBlur was a top CPU cost. The cache is module-level and evicts oldest
 * entries past the cap.
 */
import { getThreatVisual } from '../visuals'
import { SHAPES } from './entityShapes'

type Ctx = CanvasRenderingContext2D

const GLOW_CACHE = new Map<string, HTMLCanvasElement>()
const GLOW_CACHE_MAX = 160

function cacheKey(kind: string, id: string, bucket: number, glow: boolean): string {
  return `${kind}|${id}|${bucket}|${glow ? 1 : 0}`
}

function getOrCreate(
  key: string,
  dim: number,
  draw: (ctx: Ctx, half: number) => void,
  glowColor: string,
  glowBlur: number,
  glow: boolean,
): HTMLCanvasElement {
  const hit = GLOW_CACHE.get(key)
  if (hit) return hit

  const c = document.createElement('canvas')
  c.width = dim
  c.height = dim
  const ctx = c.getContext('2d')!
  ctx.translate(dim / 2, dim / 2)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  if (glow) {
    ctx.shadowColor = glowColor
    ctx.shadowBlur = glowBlur
  }
  draw(ctx, dim / 2)
  ctx.shadowBlur = 0

  if (GLOW_CACHE.size >= GLOW_CACHE_MAX) {
    const oldest = GLOW_CACHE.keys().next().value
    if (oldest !== undefined) GLOW_CACHE.delete(oldest)
  }
  GLOW_CACHE.set(key, c)
  return c
}

export interface ThreatDrawOptions {
  x: number
  y: number
  /** Full width/height of the draw box. */
  size: number
  /** Entity color — usually the threat's own `color`. */
  color: string
  category: string
  /** 'instant' threats render solid + glow, 'minor' render lighter/hollow. */
  damage?: 'instant' | 'minor'
  glow?: boolean
}

export function drawThreatEntity(ctx: Ctx, o: ThreatDrawOptions): void {
  const spec = getThreatVisual(o.category)
  const bucket = Math.max(24, Math.ceil(o.size / 8) * 8)
  const key = cacheKey('t', `${spec.shape}|${o.color}`, bucket, !!o.glow)
  const pad = o.glow ? bucket * 0.3 + 4 : 2
  const dim = bucket + pad * 2
  const sprite = getOrCreate(
    key,
    Math.ceil(dim),
    (c, half) => SHAPES[spec.shape](c, half, o.color, spec.accent),
    o.color,
    halfPad(pad),
    !!o.glow,
  )
  ctx.save()
  if (o.damage === 'minor') ctx.globalAlpha = 0.82
  ctx.drawImage(sprite, o.x - dim / 2, o.y - dim / 2, dim, dim)
  ctx.restore()
}

function halfPad(pad: number): number {
  return pad * 0.6
}

export interface KitDrawOptions {
  x: number
  y: number
  size: number
  color: string
  monogram: string
  glow?: boolean
  pulse?: number
}

/** Kits share one silhouette language: a pointy-top hex badge + monogram. */
export function drawKitBadge(ctx: Ctx, o: KitDrawOptions): void {
  const bucket = Math.max(28, Math.ceil(o.size / 8) * 8)
  const key = cacheKey('k', `${o.color}|${o.monogram}`, bucket, !!o.glow)
  const pad = o.glow ? bucket * 0.3 + 4 : 2
  const dim = bucket + pad * 2
  const r = bucket * 0.58
  const sprite = getOrCreate(
    key,
    Math.ceil(dim),
    (c) => {
      c.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 2
        const px = Math.cos(a) * r
        const py = Math.sin(a) * r
        i === 0 ? c.moveTo(px, py) : c.lineTo(px, py)
      }
      c.closePath()
      c.fillStyle = o.color + '33'
      c.fill()
      c.strokeStyle = o.color
      c.lineWidth = Math.max(2, bucket * 0.08)
      c.stroke()
      // inner accent ring
      c.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 2
        const px = Math.cos(a) * r * 0.78
        const py = Math.sin(a) * r * 0.78
        i === 0 ? c.moveTo(px, py) : c.lineTo(px, py)
      }
      c.closePath()
      c.strokeStyle = o.color + '55'
      c.lineWidth = 1
      c.stroke()
      c.shadowBlur = 0
      c.font = `bold ${Math.round(bucket * 0.42)}px monospace`
      c.textAlign = 'center'
      c.textBaseline = 'middle'
      c.fillStyle = '#ffffff'
      c.fillText(o.monogram, 0, bucket * 0.02)
    },
    o.color,
    halfPad(pad),
    !!o.glow,
  )
  // Pulse = scaled blit (cheap; the glow halo scales with it).
  const scale = o.pulse ?? 1
  ctx.save()
  ctx.drawImage(sprite, o.x - (dim * scale) / 2, o.y - (dim * scale) / 2, dim * scale, dim * scale)
  ctx.restore()
}
