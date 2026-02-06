// Helper functions for protection kit system
import { protectionKits, type ProtectionKit } from './protectionKits'
import type { ThreatCategory } from './threatData'

// Get protection kit name for display - ALL 8 KITS
export function getProtectionKitName(threatId: string): string {
  const categoryMap: { [key: string]: string } = {
    'weak-password': 'Password Manager',
    'password-reuse': 'Password Manager',
    'phishing-email': 'Link Analyzer',
    'spear-phishing': 'Link Analyzer',
    'zero-day': 'Patch Manager',
    'unpatched-vuln': 'Patch Manager',
    'doxing-attack': 'Privacy Optimizer',
    'data-harvester': 'Privacy Optimizer',
    'evil-twin': 'VPN Shield',
    'credential-stuffing': 'MFA Authenticator',
    'session-hijacking': 'MFA Authenticator',
    'ransomware': 'Backup System',
    'hardware-failure': 'Backup System',
    'pretexting': 'Social Engineering Defense',
    'tailgating': 'Social Engineering Defense',
  }
  return categoryMap[threatId] || 'Unknown Protection'
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
    'evil-twin': 'vpn-shield',
    'credential-stuffing': 'mfa-authenticator',
    'session-hijacking': 'mfa-authenticator',
    'ransomware': 'backup-system',
    'hardware-failure': 'backup-system',
    'pretexting': 'social-engineering-defense',
    'tailgating': 'social-engineering-defense',
  }

  const kitId = threatToKitMap[threatId]
  if (!kitId) return null

  return protectionKits.find(kit => kit.id === kitId) || null
}

// Get protection kit for a threat category
export function getProtectionKitForCategory(category: ThreatCategory): ProtectionKit | undefined {
  return protectionKits.find(kit => kit.protectsAgainst === category)
}
