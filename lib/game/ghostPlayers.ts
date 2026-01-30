// Ghost player system - AI-generated "players" that send threats

import type { ThreatCategory } from './threatData'

export interface GhostPlayer {
  id: string
  name: string
  level: number
  speciality: string
  category: ThreatCategory
  emoji?: string
}

// Pool of base names
const ghostPlayerNames = [
  'Shadow_Hunter',
  'CyberNinja',
  'DataThief',
  'PhishingKing',
  'ZeroDay',
  'PacketLord',
  'ByteBandit',
  'CryptoHawk',
  'NetPhantom',
  'DarkCoder',
  'VaultBreaker',
  'HexMaster',
  'BinaryGhost',
  'RootKitty',
  'VirusQueen',
  'FirewallBuster',
  'SQLNinja',
  'XSSWarrior',
  'MalwareKing',
  'PhantomPwn',
  'CyberViper',
  'CodeRedux',
  'NullPointer',
  'ExploitExpert',
  'ScriptKiddie',
  'BlackHatBob',
  'GreyAreaGamer',
  'WhiteRabbit',
  'RedTeamRex',
  'BlueScreenBob',
  'PasswordPirate',
  'CredentialCollector',
  'SessionStealer',
  'CookieMonster',
  'TokenThief',
  'KeyLogger',
  'ScreenGrabber',
  'WiFiWarrior',
  'RouterRaider',
  'NetworkNinja',
  'PacketSniff3r',
  'DNSPoisoner',
  'ProxyPirate',
  'VPNVandal',
  'TunnelTroll',
  'BotnetBoss',
  'DDoSKing',
  'RansomRogue',
  'EncryptionEater',
  'BackdoorBandit',
  'BitFlipp3r',
  'CodeCrusher',
  'DataDemon',
  'ExploitElite',
  'GhostInShell',
  'HackTheGibson',
  'ICEBreaker',
  'JailbreakJoe',
  'KernelKiller',
  'L33tHax0r',
  'MemoryLeaker',
  'NoobHunter',
  'OpcodeOwl',
  'PwnMaster',
  'QueryKiller',
  'ReverseEngineer',
  'ShellShock',
  'TrojanHorse',
  'UnicodeNinja',
  'VulnScanner',
  'WormWrangler',
  'XploitXpert',
  // MFA/Authentication themed
  'TokenStealer',
  'SessionSnatcher',
  'CookieThief',
  'OTPBypass',
  'TwoFactorFail',
  'AuthBreaker',
  // Ransomware/Data Loss themed
  'RansomKing',
  'CryptoLocker',
  'FileEncryptor',
  'DataDestroyer',
  'BackupBuster',
  'DiskWiper',
  // Social Engineering themed
  'SocialHacker',
  'Pretextor',
  'BaitMaster',
  'TrustBreaker',
  'PhonePhreak',
  'VishingVixen'
]

// Suffixes to add variety
const nameSuffixes = [
  '',      // 40% chance of no suffix
  '',
  '',
  '',
  '47',
  '99',
  '2077',
  'Pro',
  'Elite',
  'X',
  'Prime',
  '_404',
  '_666',
  'Master',
  'Lord',
  'King',
  'Queen',
  'Boss',
  '_v2',
  '_HD',
  'Reborn'
]

// Random emojis for visual variety
const playerEmojis = [
  '💀', '👾', '🎭', '🦹', '🥷', '🧛', '👻', '🤖',
  '🐉', '🦊', '🐺', '🦅', '🐍', '🕷️', '🦂', '🔥'
]

// Speciality titles based on category - ALL 8 CATEGORIES
const specialities: { [key in ThreatCategory]: string[] } = {
  password: ['The Password Cracker', 'The Credential Stuffer', 'The Brute Forcer', 'The Dictionary Attacker'],
  phishing: ['The Phisher', 'The Social Engineer', 'The Impersonator', 'The Link Spammer'],
  updates: ['The Exploit Hunter', 'The Zero-Day Dealer', 'The Vulnerability Scanner', 'The Patch Avoider'],
  privacy: ['The Data Harvester', 'The Profile Scraper', 'The Doxer', 'The Info Leaker'],
  wifi: ['The WiFi Hijacker', 'The Network Sniffer', 'The Evil Twin', 'The Packet Interceptor'],
  authentication: ['The Session Hijacker', 'The Token Thief', 'The Account Taker', 'The Credential Stuffer'],
  'data-loss': ['The Ransomware Operator', 'The File Encryptor', 'The Crypto Locker', 'The Data Destroyer'],
  'social-engineering': ['The Manipulator', 'The Impersonator', 'The Pretexting Pro', 'The Baiting Master']
}

// Generate a random ghost player
export function getRandomGhostPlayer(preferredCategory?: ThreatCategory): GhostPlayer {
  // Pick random base name
  const baseName = ghostPlayerNames[Math.floor(Math.random() * ghostPlayerNames.length)]
  
  // Add random suffix for variety
  const suffix = nameSuffixes[Math.floor(Math.random() * nameSuffixes.length)]
  const name = baseName + suffix
  
  // Generate level with weighted distribution (more variety)
  let level: number
  const roll = Math.random()
  if (roll < 0.3) {
    // 30% chance: Low level (1-30)
    level = Math.floor(Math.random() * 30) + 1
  } else if (roll < 0.6) {
    // 30% chance: Mid level (31-70)
    level = Math.floor(Math.random() * 40) + 31
  } else if (roll < 0.9) {
    // 30% chance: High level (71-99)
    level = Math.floor(Math.random() * 29) + 71
  } else {
    // 10% chance: Max level (100-150) - Elite players
    level = Math.floor(Math.random() * 51) + 100
  }
  
  // If category specified, use it; otherwise random from all 8 categories
  const category: ThreatCategory = preferredCategory || 
    (['password', 'phishing', 'updates', 'privacy', 'wifi', 'authentication', 'data-loss', 'social-engineering'] as ThreatCategory[])[Math.floor(Math.random() * 8)]
  
  const categorySpecialities = specialities[category]
  const speciality = categorySpecialities[Math.floor(Math.random() * categorySpecialities.length)]
  
  // Random emoji (20% chance of having one)
  const emoji = Math.random() < 0.2 
    ? playerEmojis[Math.floor(Math.random() * playerEmojis.length)]
    : undefined
  
  return {
    id: `ghost_${Date.now()}_${Math.random()}`,
    name,
    level,
    speciality,
    category,
    emoji
  }
}

// Get a ghost player specialized in a specific category
export function getGhostPlayerByCategory(category: ThreatCategory): GhostPlayer {
  return getRandomGhostPlayer(category)
}

// Get multiple unique ghost players
export function getUniqueGhostPlayers(count: number): GhostPlayer[] {
  const players: GhostPlayer[] = []
  const usedNames = new Set<string>()
  
  while (players.length < count && usedNames.size < ghostPlayerNames.length) {
    const player = getRandomGhostPlayer()
    if (!usedNames.has(player.name)) {
      players.push(player)
      usedNames.add(player.name)
    }
  }
  
  return players
}
