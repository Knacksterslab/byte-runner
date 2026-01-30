// Zone/Theme system for environmental storytelling

import type { ThreatCategory } from './threatData'

export interface GameZone {
  id: string
  name: string
  description: string
  levelRange: { start: number; end: number }
  colorScheme: {
    name: string
    primary: string
    secondary: string
    accent: string
    gridColor: string
    particleColor: string
    glowColor: string
  }
  icon: string
  contextualTips: string[]
  // Which threat categories are most relevant to this zone
  primaryThreats: ThreatCategory[]
  secondaryThreats: ThreatCategory[]
  environmentalElements: {
    type: 'icon' | 'text'
    content: string
    frequency: number // How often to spawn (0-1)
  }[]
}

export const gameZones: GameZone[] = [
  {
    id: 'home-network',
    name: '🏠 HOME NETWORK',
    description: 'Securing your personal devices and home WiFi',
    levelRange: { start: 1, end: 3 },
    colorScheme: {
      name: 'COZY BLUE SECTOR',
      primary: '#1a2847',
      secondary: '#2d4a7c',
      accent: '#4a90e2',
      gridColor: '#3366aa11',
      particleColor: '#88ccff',
      glowColor: '#4a90e2'
    },
    icon: '🏠',
    contextualTips: [
      '🏠 Home networks are often the weakest link',
      '📱 Change your router\'s default password',
      '🔒 Use WPA3 encryption on your WiFi',
      '👨‍👩‍👧‍👦 Teach family members about phishing',
      '🔐 Lock down smart home devices'
    ],
    primaryThreats: ['password', 'wifi', 'privacy'],
    secondaryThreats: ['phishing', 'updates'],
    environmentalElements: [
      { type: 'icon', content: '📱', frequency: 0.3 },
      { type: 'icon', content: '💻', frequency: 0.3 },
      { type: 'icon', content: '🖥️', frequency: 0.2 },
      { type: 'icon', content: '📡', frequency: 0.2 }
    ]
  },
  {
    id: 'office-environment',
    name: '🏢 OFFICE ENVIRONMENT',
    description: 'Corporate networks, work email, and shared systems',
    levelRange: { start: 4, end: 6 },
    colorScheme: {
      name: 'CORPORATE GREEN SECTOR',
      primary: '#1a3a2e',
      secondary: '#2d5a4d',
      accent: '#00ff88',
      gridColor: '#00ff8811',
      particleColor: '#88ffcc',
      glowColor: '#00ff88'
    },
    icon: '🏢',
    contextualTips: [
      '🏢 Corporate networks face 1000+ attacks per day',
      '📧 80% of breaches start with phishing emails',
      '🔄 Keep work and personal accounts separate',
      '🚫 Never plug in unknown USB drives at work',
      '👥 Social engineering targets employees'
    ],
    primaryThreats: ['phishing', 'social-engineering', 'updates'],
    secondaryThreats: ['password', 'authentication'],
    environmentalElements: [
      { type: 'icon', content: '📧', frequency: 0.4 },
      { type: 'icon', content: '💼', frequency: 0.3 },
      { type: 'icon', content: '🖨️', frequency: 0.2 },
      { type: 'icon', content: '📎', frequency: 0.2 },
      { type: 'icon', content: '📊', frequency: 0.15 }
    ]
  },
  {
    id: 'mobile-zone',
    name: '📱 MOBILE ZONE',
    description: 'Smartphones, public WiFi, and mobile apps',
    levelRange: { start: 7, end: 9 },
    colorScheme: {
      name: 'DANGER RED SECTOR',
      primary: '#3a1a1a',
      secondary: '#5a2d2d',
      accent: '#ff4444',
      gridColor: '#ff444411',
      particleColor: '#ff8888',
      glowColor: '#ff4444'
    },
    icon: '📱',
    contextualTips: [
      '📱 Mobile devices are hacker\'s favorite targets',
      '☕ Never trust public WiFi without VPN',
      '📍 Apps track your location constantly',
      '🔐 Enable biometric locks on all apps',
      '🚫 Review app permissions regularly'
    ],
    primaryThreats: ['wifi', 'privacy', 'authentication'],
    secondaryThreats: ['phishing', 'social-engineering'],
    environmentalElements: [
      { type: 'icon', content: '📱', frequency: 0.4 },
      { type: 'icon', content: '☕', frequency: 0.3 },
      { type: 'icon', content: '🛜', frequency: 0.3 },
      { type: 'icon', content: '📍', frequency: 0.2 },
      { type: 'icon', content: '🔋', frequency: 0.15 }
    ]
  },
  {
    id: 'cloud-zone',
    name: '☁️ CLOUD ZONE',
    description: 'Cloud services, SaaS apps, and advanced threats',
    levelRange: { start: 10, end: 999 },
    colorScheme: {
      name: 'ELITE PURPLE SECTOR',
      primary: '#2a1a3a',
      secondary: '#4a2d5a',
      accent: '#aa44ff',
      gridColor: '#aa44ff11',
      particleColor: '#cc88ff',
      glowColor: '#aa44ff'
    },
    icon: '☁️',
    contextualTips: [
      '☁️ Cloud breaches expose millions of records',
      '🔑 MFA is mandatory for cloud accounts',
      '💾 Keep offline backups of critical data',
      '🔐 Use zero-trust architecture',
      '🎯 APT groups target cloud infrastructure'
    ],
    primaryThreats: ['authentication', 'data-loss', 'updates'],
    secondaryThreats: ['phishing', 'social-engineering'],
    environmentalElements: [
      { type: 'icon', content: '☁️', frequency: 0.4 },
      { type: 'icon', content: '🌐', frequency: 0.3 },
      { type: 'icon', content: '⚡', frequency: 0.25 },
      { type: 'icon', content: '🔗', frequency: 0.2 },
      { type: 'icon', content: '🛡️', frequency: 0.2 }
    ]
  }
]

// Get current zone based on level
export function getCurrentZone(level: number): GameZone {
  return gameZones.find(zone => 
    level >= zone.levelRange.start && level <= zone.levelRange.end
  ) || gameZones[gameZones.length - 1] // Default to cloud zone for high levels
}

// Check if level is a zone transition
export function isZoneTransition(level: number): boolean {
  return level === 4 || level === 7 || level === 10
}

// Get zone by ID
export function getZoneById(id: string): GameZone | undefined {
  return gameZones.find(zone => zone.id === id)
}

// Get random contextual tip for current zone
export function getZoneTip(level: number): string {
  const zone = getCurrentZone(level)
  return zone.contextualTips[Math.floor(Math.random() * zone.contextualTips.length)]
}

// Check if threat category is relevant to zone
export function isThreatRelevantToZone(threatCategory: ThreatCategory, level: number): boolean {
  const zone = getCurrentZone(level)
  return zone.primaryThreats.includes(threatCategory) || zone.secondaryThreats.includes(threatCategory)
}

// Get threat spawn weight for zone (higher = more likely)
export function getThreatSpawnWeight(threatCategory: ThreatCategory, level: number): number {
  const zone = getCurrentZone(level)
  if (zone.primaryThreats.includes(threatCategory)) return 3
  if (zone.secondaryThreats.includes(threatCategory)) return 1
  return 0.5 // Still allow other threats, but less frequently
}
