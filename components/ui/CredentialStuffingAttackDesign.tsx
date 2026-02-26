'use client'

import AttackRecoveryOverlay from '@/components/ui/AttackRecoveryOverlay'
import type { RecoverySponsor } from '@/lib/api/sponsors'
import type { RecoveryOverlayOption2 } from '@/lib/game/utils/recoveryUtils'

export default function CredentialStuffingAttackDesign() {
  const previewOverlay: RecoveryOverlayOption2 = {
    threatId: 'credential-stuffing',
    kitType: 'password-manager',
    attackLabel: 'CREDENTIAL STUFFING ATTACK',
    attackSubtext: 'Breached passwords detected!',
    protectionLabel: 'Password Manager',
    leftPanel: {
      label: 'jessica88',
      subtexts: ['REUSED', 'Weak • Leaked'],
      pointsDisplay: '−',
      barLabel: 'Weak • Leaked',
      barValue: 0.25,
    },
    rightPanel: {
      label: 'Tr0ub4dor!2024',
      subtexts: ['STRONG • UNIQUE', '14 Chars • Safe'],
      pointsDisplay: '+',
      barLabel: '14 Chars • Safe',
      barValue: 1,
    },
    whatWasBlocked: ['Account Takeover', 'Password Leak', 'Unauthorized Access'],
    securePractices: ['Use Unique Passwords', 'Enable 2FA', 'Store in Vault'],
    realWorldTools: [
      { label: 'Bitwarden' },
      { label: '1Password' },
      { label: 'NordPass' },
    ],
    timeLeft: 4,
    progress: 0.83,
  }
  const previewSponsor: RecoverySponsor = {
    id: 'preview-password-fortress',
    tag: 'SPONSORED',
    logo: 'PF',
    title: 'Password Fortress',
    description: 'Secure every account with one-click vault + breach alerts',
    ctaLabel: 'TRY FREE',
    ctaUrl: 'https://example.com',
  }

  return (
    <AttackRecoveryOverlay overlay={previewOverlay} fullScreen sponsor={previewSponsor} />
  )
}
