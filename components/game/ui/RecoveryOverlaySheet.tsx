'use client'

import { useEffect, useState } from 'react'
import type { RecoveryOverlayState } from '../hooks/useGameLoopTypes'
import AttackRecoveryOverlay from '@/components/ui/AttackRecoveryOverlay'
import { getRecoverySponsor, type RecoverySponsor } from '@/lib/api/sponsors'

interface RecoveryOverlaySheetProps {
  overlay: RecoveryOverlayState
}

export function RecoveryOverlaySheet({ overlay }: RecoveryOverlaySheetProps) {
  const [sponsor, setSponsor] = useState<RecoverySponsor | null>(null)

  useEffect(() => {
    let isActive = true
    const threatId = overlay.threatId ?? null
    const kitType = overlay.kitType ?? null

    if (!threatId && !kitType) {
      setSponsor(null)
      return () => { isActive = false }
    }

    getRecoverySponsor({ threatId, kitType })
      .then((next) => {
        if (!isActive) return
        setSponsor(next)
      })
      .catch(() => {
        if (!isActive) return
        setSponsor(null)
      })

    return () => { isActive = false }
  }, [overlay.threatId, overlay.kitType])

  return (
    <div className="absolute inset-0 z-20">
      <AttackRecoveryOverlay overlay={overlay} sponsor={sponsor} />
    </div>
  )
}
