'use client'

import { useEffect, useRef, useState } from 'react'
import type { RecoveryOverlayState } from '../hooks/useGameLoopTypes'
import AttackRecoveryOverlay from '@/components/ui/AttackRecoveryOverlay'
import { getRecoverySponsor, recordSponsorImpression, type RecoverySponsor } from '@/lib/api/sponsors'

interface RecoveryOverlaySheetProps {
  overlay: RecoveryOverlayState
}

export function RecoveryOverlaySheet({ overlay }: RecoveryOverlaySheetProps) {
  const [sponsor, setSponsor] = useState<RecoverySponsor | null>(null)
  const sentImpressionKeysRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    let isActive = true
    const threatId = overlay.threatId ?? null
    const kitType = overlay.kitType ?? null

    if (!threatId && !kitType) {
      setSponsor(null)
      return () => { isActive = false }
    }

    getRecoverySponsor({ threatId, kitType, timeoutMs: 2500 })
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

  useEffect(() => {
    if (!sponsor?.trackingToken) return
    const impressionKey = [
      sponsor.campaignId,
      sponsor.creativeId,
      overlay.threatId ?? 'none',
      overlay.kitType ?? 'none',
    ].join(':')
    if (sentImpressionKeysRef.current.has(impressionKey)) return
    sentImpressionKeysRef.current.add(impressionKey)
    recordSponsorImpression({
      trackingToken: sponsor.trackingToken,
      idempotencyKey: impressionKey,
      threatId: overlay.threatId,
      kitType: overlay.kitType,
    }).catch(() => undefined)
  }, [sponsor?.trackingToken, sponsor?.campaignId, sponsor?.creativeId, overlay.threatId, overlay.kitType])

  return (
    <div className="absolute inset-0 z-20">
      <AttackRecoveryOverlay overlay={overlay} sponsor={sponsor} />
    </div>
  )
}
