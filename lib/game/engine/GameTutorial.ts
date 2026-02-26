import { buildRecoveryOverlayOption2 } from '../utils/recoveryUtils'
import type { GameState } from './GameState'
import type { UseGameLoopOptions } from '../../../components/game/hooks/useGameLoopTypes'

export function drawTutorialOverlay(
  s: GameState, lastThreatType: string | null,
  setRecoveryOverlay: UseGameLoopOptions['setRecoveryOverlay']
): void {
  if (!s.showingTutorial || s.tutorialTimer <= 0) {
    s.showingTutorial = false; s.isHealing = false
    setRecoveryOverlay(null); return
  }
  const timeLeft = Math.max(0, Math.ceil(s.tutorialTimer / 1000))
  const progress = Math.max(0, Math.min(1, 1 - s.tutorialTimer / s.TUTORIAL_DURATION))
  const threatIdForOverlay = s.lastHitThreatId || lastThreatType || null
  const overlayOption2 = buildRecoveryOverlayOption2(s.tutorialKit, threatIdForOverlay, timeLeft, progress)
  setRecoveryOverlay(prev => {
    if (prev && prev.timeLeft === timeLeft && Math.abs(prev.progress - progress) < 0.02 &&
      prev.attackLabel === overlayOption2.attackLabel) return prev
    return overlayOption2
  })
  s.tutorialTimer -= 16
}
