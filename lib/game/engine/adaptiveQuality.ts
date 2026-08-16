/**
 * Adaptive render quality — replaces user-agent sniffing.
 *
 * Everyone starts at full visual quality. The game loop reports real frame
 * times here; if the rolling average falls below the 60fps budget the mode
 * downgrades once (sticky) and the heavier effects are trimmed. Works the
 * same on every browser and device, and self-corrects for slow machines.
 */
import type { GameState } from './GameState'

/** Frames skipped after start so warm-up (compile/shader/GC) doesn't skew. */
const WARMUP_FRAMES = 30
/** Samples per evaluation window (~1s at 60fps). */
const WINDOW = 60
/** Sustained average above this (ms) means we can't hold ~48fps. */
const FRAME_BUDGET_MS = 21
/** Single frames above this are outliers (tab switches, GC pauses). */
const OUTLIER_MS = 100

/** Particle/matrix counts matching the former performance-mode values. */
const PERF_PARTICLES = 20
const PERF_MATRIX = 30

export function trackFramePerformance(s: GameState, frameMs: number): void {
  if (s.performanceMode) return
  if (s.gameFrameCount < WARMUP_FRAMES) return
  if (frameMs <= 0 || frameMs > OUTLIER_MS) return

  s.perfSamples.push(frameMs)
  if (s.perfSamples.length < WINDOW) return

  const avg = s.perfSamples.reduce((a, b) => a + b, 0) / s.perfSamples.length
  s.perfSamples.length = 0
  if (avg > FRAME_BUDGET_MS) enablePerformanceMode(s)
}

function enablePerformanceMode(s: GameState): void {
  s.performanceMode = true
  // Trim already-allocated background effects to the light counts.
  if (s.particles.length > PERF_PARTICLES) s.particles.length = PERF_PARTICLES
  if (s.matrixColumns.length > PERF_MATRIX) s.matrixColumns.length = PERF_MATRIX
}
