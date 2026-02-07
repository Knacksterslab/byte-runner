// Helper functions for protection kit system
import { protectionKits, type ProtectionKit } from './protectionKits'
import type { ThreatCategory } from './threatData'

// Get protection kit name for display - all kits
export function getProtectionKitName(threatId: string): string {
  const kit = getProtectionKitForThreat(threatId)
  return kit ? kit.name : 'Unknown Protection'
}

// Map threat ID to protection kit object
export function getProtectionKitForThreat(threatId: string): ProtectionKit | null {
  const threatToKitMap: { [key: string]: string } = {
    'weak-password': 'password-manager',
    'password-reuse': 'password-manager',
    'phishing-email': 'link-analyzer',
    'spear-phishing': 'link-analyzer',
    'zero-day': 'patch-manager',
    'unpatched-vuln': 'patch-manager',
    'doxing-attack': 'privacy-optimizer',
    'data-harvester': 'privacy-optimizer',
    'malicious-app': 'privacy-optimizer',
    'permission-abuse': 'privacy-optimizer',
    'evil-twin': 'vpn-shield',
    'credential-stuffing': 'mfa-authenticator',
    'session-hijacking': 'mfa-authenticator',
    'sim-swap': 'mfa-authenticator',
    'ransomware': 'backup-system',
    'hardware-failure': 'backup-system',
    'pretexting': 'social-engineering-defense',
    'baiting-attack': 'social-engineering-defense',
    'tailgating': 'badge-tap',
    'shoulder-surfing': 'badge-tap',
    'unlocked-workstation': 'badge-tap',
    'document-theft': 'badge-tap',
    'improper-disposal': 'secure-shred',
    'dumpster-diving': 'secure-shred',
    'policy-violation': 'policy-knowledge',
    'unauthorized-software': 'policy-knowledge',
    'delayed-reporting': 'ethics-reporting',
    'wrong-channel': 'ethics-reporting',
    'incomplete-details': 'ethics-reporting',
    'retaliation-threat': 'ethics-reporting',
    'gdpr-violation': 'compliance-kit',
    'hipaa-breach': 'compliance-kit',
    'pci-noncompliance': 'compliance-kit',
    'unsecured-home-router': 'remote-work-guard',
    'family-device': 'remote-work-guard',
    'weak-home-wifi': 'remote-work-guard',
    'zoom-bombing': 'waiting-room',
    'meeting-link-leak': 'waiting-room',
    'hotel-wifi': 'travel-vpn',
    'public-kiosk': 'travel-vpn',
    'unencrypted-storage': 'encryption-kit',
    'over-shared-data': 'encryption-kit',
    'vendor-breach': 'sbom-toolkit',
    'compromised-update': 'sbom-toolkit',
    'malicious-package': 'sbom-toolkit',
    'accidental-data-share': 'insider-monitor',
    'privilege-abuse': 'insider-monitor',
    'data-exfiltration': 'insider-monitor',
    'malicious-attachment': 'email-gateway',
    'bec-scam': 'email-gateway',
    'email-spoofing': 'email-gateway',
    'misclassified-data': 'classification-labeler',
    'wrong-sharing-channel': 'classification-labeler',
    'oversharing-work-info': 'privacy-check',
    'location-tagging': 'privacy-check',
    'recon-posting': 'privacy-check',
    'usb-drop': 'device-control',
    'unauthorized-device': 'device-control',
    'usb-data-theft': 'device-control',
    'juice-jacking': 'device-control',
  }

  const kitId = threatToKitMap[threatId]
  if (!kitId) return null

  return protectionKits.find(kit => kit.id === kitId) || null
}

// Get protection kit for a threat category
export function getProtectionKitForCategory(category: ThreatCategory): ProtectionKit | undefined {
  return protectionKits.find(kit => kit.protectsAgainst === category)
}
