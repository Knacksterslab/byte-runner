// Threat type system for all 8 Tier 1 cybersecurity categories

export type ThreatCategory = 'password' | 'phishing' | 'updates' | 'privacy' | 'wifi' | 'authentication' | 'data-loss' | 'social-engineering'
export type DamageType = 'instant' | 'minor'

export interface ThreatType {
  id: string
  name: string
  category: ThreatCategory
  color: string
  damage: DamageType
  emoji: string
  description: string
  realWorldExample: string
  educationalContent: string[]
}

export const threatTypes: ThreatType[] = [
  // PASSWORD SECURITY (2 threats)
  {
    id: 'weak-password',
    name: 'Weak Password Attack',
    category: 'password',
    color: '#ff0000',
    damage: 'instant',
    emoji: '🔓',
    description: 'Dictionary attack exploiting weak passwords',
    realWorldExample: 'LinkedIn breach (2012) - 6.5M passwords cracked in days',
    educationalContent: [
      'Passwords under 12 characters are easily cracked',
      'Use passphrases: "correct-horse-battery-staple"',
      'Never reuse passwords across sites',
      'Enable 2FA/MFA on all accounts'
    ]
  },
  {
    id: 'password-reuse',
    name: 'Credential Stuffing',
    category: 'password',
    color: '#ff4444',
    damage: 'minor',
    emoji: '♻️',
    description: 'Using leaked credentials from one site on another',
    realWorldExample: 'Disney+ accounts hacked via reused passwords (2019)',
    educationalContent: [
      'Breached passwords are sold on dark web',
      'Attackers try leaked passwords everywhere',
      'Use unique passwords for every account',
      'Use a password manager to track them'
    ]
  },

  // PHISHING (2 threats)
  {
    id: 'phishing-email',
    name: 'Phishing Email',
    category: 'phishing',
    color: '#ff00ff',
    damage: 'instant',
    emoji: '🎣',
    description: 'Fake email tricking you into giving credentials',
    realWorldExample: 'Google Docs phishing (2017) - 1M users affected',
    educationalContent: [
      'Check sender domain carefully',
      'Hover links before clicking',
      'Watch for urgent/threatening language',
      'Verify with sender through different channel'
    ]
  },
  {
    id: 'spear-phishing',
    name: 'Spear Phishing',
    category: 'phishing',
    color: '#ff66ff',
    damage: 'minor',
    emoji: '🎯',
    description: 'Targeted phishing using personal information',
    realWorldExample: 'Sony Pictures hack (2014) via targeted emails',
    educationalContent: [
      'Attackers research victims on social media',
      'Emails appear highly personalized',
      'Still check domain and links carefully',
      'Be skeptical of unexpected requests'
    ]
  },

  // SOFTWARE UPDATES (2 threats)
  {
    id: 'zero-day',
    name: 'Zero-Day Exploit',
    category: 'updates',
    color: '#ff8800',
    damage: 'instant',
    emoji: '💥',
    description: 'Attack exploiting unknown software vulnerability',
    realWorldExample: 'Log4Shell (2021) - affected millions of systems',
    educationalContent: [
      'Unknown vulnerabilities exist in all software',
      'Update immediately when patches released',
      'Use automatic updates when possible',
      'Layered security reduces zero-day impact'
    ]
  },
  {
    id: 'unpatched-vuln',
    name: 'Unpatched Vulnerability',
    category: 'updates',
    color: '#ffaa44',
    damage: 'minor',
    emoji: '🪲',
    description: 'Exploiting known bugs you haven\'t fixed yet',
    realWorldExample: 'WannaCry ransomware (2017) - unpatched Windows systems',
    educationalContent: [
      'Patch available but not installed = open door',
      'Attackers scan for unpatched systems',
      'Critical updates should install within 24 hours',
      'Test updates on non-critical systems first'
    ]
  },

  // SOCIAL MEDIA PRIVACY (2 threats)
  {
    id: 'doxing-attack',
    name: 'Doxing Attack',
    category: 'privacy',
    color: '#8800ff',
    damage: 'instant',
    emoji: '🔍',
    description: 'Personal information collected and published publicly',
    realWorldExample: 'Celebrity phone numbers leaked via social engineering',
    educationalContent: [
      'Don\'t share location in real-time',
      'Review privacy settings on all platforms',
      'Limit personal info in public profiles',
      'Remove photo metadata before posting'
    ]
  },
  {
    id: 'data-harvester',
    name: 'Data Harvesting',
    category: 'privacy',
    color: '#aa44ff',
    damage: 'minor',
    emoji: '🌾',
    description: 'Scraping public profiles to build detailed dossier',
    realWorldExample: 'Cambridge Analytica scandal (2018)',
    educationalContent: [
      'Public posts are scraped by bots',
      'Quiz apps often harvest friend data',
      'Check app permissions regularly',
      'Assume anything online is permanent'
    ]
  },

  // PUBLIC WIFI SECURITY (1 threat)
  {
    id: 'evil-twin',
    name: 'Evil Twin WiFi',
    category: 'wifi',
    color: '#00ffff',
    damage: 'instant',
    emoji: '📡',
    description: 'Fake WiFi hotspot capturing your traffic',
    realWorldExample: 'Airport WiFi scams stealing banking credentials',
    educationalContent: [
      'Fake networks copy legitimate names',
      'All traffic visible to hotspot owner',
      'Use VPN on public WiFi always',
      'Verify network name with staff'
    ]
  },

  // AUTHENTICATION (2 threats) - Require MFA Kit
  {
    id: 'credential-stuffing',
    name: 'Credential Stuffing',
    category: 'authentication',
    color: '#ff00aa',
    damage: 'instant',
    emoji: '🔑',
    description: 'Automated bot login attempts using leaked credentials',
    realWorldExample: 'Spotify (2020) - 300,000+ accounts hijacked via stuffing',
    educationalContent: [
      'Bots try millions of leaked passwords per hour',
      'MFA blocks 99% of automated attacks',
      'Use unique passwords so breaches don\'t cascade',
      'Enable authenticator apps on all critical accounts'
    ]
  },
  {
    id: 'session-hijacking',
    name: 'Session Hijacking',
    category: 'authentication',
    color: '#ff44bb',
    damage: 'minor',
    emoji: '🎪',
    description: 'Stealing active session cookies to bypass login',
    realWorldExample: 'Facebook session token theft via malicious browser extensions',
    educationalContent: [
      'Session cookies are like temporary keys',
      'Stolen cookies bypass passwords completely',
      'MFA requires reauth for sensitive actions',
      'Log out from public computers to clear sessions'
    ]
  },

  // DATA LOSS (2 threats) - Require Backup Kit
  {
    id: 'ransomware',
    name: 'Ransomware Attack',
    category: 'data-loss',
    color: '#ff0033',
    damage: 'instant',
    emoji: '🔐',
    description: 'Malware encrypts your files and demands payment',
    realWorldExample: 'Colonial Pipeline (2021) - $4.4M ransom paid',
    educationalContent: [
      'Ransomware encrypts files, backups let you recover',
      'Never pay ransom - funds more attacks',
      'Backup offline so ransomware can\'t encrypt it',
      'Test restoring backups regularly'
    ]
  },
  {
    id: 'hardware-failure',
    name: 'Hardware Failure',
    category: 'data-loss',
    color: '#ff4466',
    damage: 'minor',
    emoji: '💾',
    description: 'Hard drive failure causing permanent data loss',
    realWorldExample: '140,000 hard drives fail per week in the US alone',
    educationalContent: [
      'All drives fail eventually - it\'s not "if" but "when"',
      'RAID is not a backup (protects availability, not data)',
      'Follow 3-2-1 rule: 3 copies, 2 media, 1 offsite',
      'Cloud backup auto-protects against hardware death'
    ]
  },

  // SOCIAL ENGINEERING (2 threats) - Require Social Engineering Defense Kit
  {
    id: 'pretexting',
    name: 'Pretexting Attack',
    category: 'social-engineering',
    color: '#ff6600',
    damage: 'instant',
    emoji: '🎭',
    description: 'Attacker impersonates trusted authority to manipulate you',
    realWorldExample: 'Twitter hack (2020) - employees tricked via phone pretexting',
    educationalContent: [
      'Attackers pretend to be IT, boss, bank, police',
      'Verify identity through different channel (call back)',
      'Real companies never ask for passwords or codes',
      'Watch for urgency and fear tactics'
    ]
  },
  {
    id: 'baiting-attack',
    name: 'Baiting Attack',
    category: 'social-engineering',
    color: '#ff8833',
    damage: 'minor',
    emoji: '🪝',
    description: 'Tempting offer or found USB drives containing malware',
    realWorldExample: 'Stuxnet worm spread via infected USB drops at target facilities',
    educationalContent: [
      'Free prizes, job offers, USB drives left in parking lot',
      'If it seems too good to be true, it probably is',
      'Never plug in found USB drives',
      'Verify offers directly with company website'
    ]
  }
]

// Get random threat type
export function getRandomThreat(): ThreatType {
  return threatTypes[Math.floor(Math.random() * threatTypes.length)]
}

// Get threat by ID
export function getThreatById(id: string): ThreatType | undefined {
  return threatTypes.find(t => t.id === id)
}

// Get threats by category
export function getThreatsByCategory(category: ThreatCategory): ThreatType[] {
  return threatTypes.filter(t => t.category === category)
}

// Get threat name for display
export function getThreatName(threatId: string): string {
  const threat = getThreatById(threatId)
  return threat ? threat.name : 'Unknown Threat'
}

// Get educational tip for a threat
export function getQuickTip(threatId: string): string {
  const threat = getThreatById(threatId)
  return threat && threat.educationalContent.length > 0 
    ? threat.educationalContent[0] 
    : 'Stay vigilant online!'
}
