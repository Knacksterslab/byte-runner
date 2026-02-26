// Core threats: password, phishing, updates, privacy, wifi, authentication, data-loss

export const threatsBasic = [
  // PASSWORD SECURITY (2 threats)
  {
    id: 'weak-password', name: 'Weak Password Attack', category: 'password' as const,
    color: '#ff0000', damage: 'instant' as const, emoji: '🔓',
    description: 'Dictionary attack exploiting weak passwords',
    realWorldExample: 'LinkedIn breach (2012) - 6.5M passwords cracked in days',
    educationalContent: [
      'Passwords under 12 characters are easily cracked',
      'Use passphrases: "correct-horse-battery-staple"',
      'Never reuse passwords across sites',
      'Enable 2FA/MFA on all accounts'
    ],
    consequences: ['Account takeover', 'Password crack', 'Unauthorized access']
  },
  {
    id: 'password-reuse', name: 'Credential Stuffing', category: 'password' as const,
    color: '#ff4444', damage: 'minor' as const, emoji: '♻️',
    description: 'Using leaked credentials from one site on another',
    realWorldExample: 'Disney+ accounts hacked via reused passwords (2019)',
    educationalContent: [
      'Breached passwords are sold on dark web',
      'Attackers try leaked passwords everywhere',
      'Use unique passwords for every account',
      'Use a password manager to track them'
    ],
    consequences: ['Account takeover', 'Password leak', 'Unauthorized access'],
    badExample: { label: 'jessica88', tags: ['REUSED'], barLabel: 'Weak • Leaked', barValue: 0.25 },
    goodExample: { label: 'Tr0ub4dor!2024', tags: ['STRONG • UNIQUE'], barLabel: '14 Chars • Safe', barValue: 1 }
  },

  // PHISHING (2 threats)
  {
    id: 'phishing-email', name: 'Phishing Email', category: 'phishing' as const,
    color: '#ff00ff', damage: 'instant' as const, emoji: '🎣',
    description: 'Fake email tricking you into giving credentials',
    realWorldExample: 'Google Docs phishing (2017) - 1M users affected',
    educationalContent: [
      'Check sender domain carefully',
      'Hover links before clicking',
      'Watch for urgent/threatening language',
      'Verify with sender through different channel'
    ],
    consequences: ['Credential theft', 'Malware download', 'Account compromise']
  },
  {
    id: 'spear-phishing', name: 'Spear Phishing', category: 'phishing' as const,
    color: '#ff66ff', damage: 'minor' as const, emoji: '🎯',
    description: 'Targeted phishing using personal information',
    realWorldExample: 'Sony Pictures hack (2014) via targeted emails',
    educationalContent: [
      'Attackers research victims on social media',
      'Emails appear highly personalized',
      'Still check domain and links carefully',
      'Be skeptical of unexpected requests'
    ],
    consequences: ['Targeted credential theft', 'Data breach', 'Business email compromise']
  },

  // SOFTWARE UPDATES (2 threats)
  {
    id: 'zero-day', name: 'Zero-Day Exploit', category: 'updates' as const,
    color: '#ff8800', damage: 'instant' as const, emoji: '💥',
    description: 'Attack exploiting unknown software vulnerability',
    realWorldExample: 'Log4Shell (2021) - affected millions of systems',
    educationalContent: [
      'Unknown vulnerabilities exist in all software',
      'Update immediately when patches released',
      'Use automatic updates when possible',
      'Layered security reduces zero-day impact'
    ],
    consequences: ['System compromise', 'Remote code execution', 'Data breach']
  },
  {
    id: 'unpatched-vuln', name: 'Unpatched Vulnerability', category: 'updates' as const,
    color: '#ffaa44', damage: 'minor' as const, emoji: '🪲',
    description: "Exploiting known bugs you haven't fixed yet",
    realWorldExample: 'WannaCry ransomware (2017) - unpatched Windows systems',
    educationalContent: [
      'Patch available but not installed = open door',
      'Attackers scan for unpatched systems',
      'Critical updates should install within 24 hours',
      'Test updates on non-critical systems first'
    ],
    consequences: ['Ransomware', 'System takeover', 'Lateral movement']
  },

  // SOCIAL MEDIA PRIVACY (2 threats)
  {
    id: 'doxing-attack', name: 'Doxing Attack', category: 'privacy' as const,
    color: '#8800ff', damage: 'instant' as const, emoji: '🔍',
    description: 'Personal information collected and published publicly',
    realWorldExample: 'Celebrity phone numbers leaked via social engineering',
    consequences: ['Identity exposure', 'Harassment', 'Stalking risk'],
    educationalContent: [
      "Don't share location in real-time",
      'Review privacy settings on all platforms',
      'Limit personal info in public profiles',
      'Remove photo metadata before posting'
    ]
  },
  {
    id: 'data-harvester', name: 'Data Harvesting', category: 'privacy' as const,
    color: '#aa44ff', damage: 'minor' as const, emoji: '🌾',
    description: 'Scraping public profiles to build detailed dossier',
    realWorldExample: 'Cambridge Analytica scandal (2018)',
    consequences: ['Profile building', 'Targeted ads', 'Manipulation risk'],
    educationalContent: [
      'Public posts are scraped by bots',
      'Quiz apps often harvest friend data',
      'Check app permissions regularly',
      'Assume anything online is permanent'
    ]
  },

  // PUBLIC WIFI SECURITY (1 threat)
  {
    id: 'evil-twin', name: 'Evil Twin WiFi', category: 'wifi' as const,
    color: '#00ffff', damage: 'instant' as const, emoji: '📡',
    description: 'Fake WiFi hotspot capturing your traffic',
    realWorldExample: 'Airport WiFi scams stealing banking credentials',
    consequences: ['Traffic interception', 'Credential capture', 'Man-in-the-middle'],
    educationalContent: [
      'Fake networks copy legitimate names',
      'All traffic visible to hotspot owner',
      'Use VPN on public WiFi always',
      'Verify network name with staff'
    ]
  },

  // AUTHENTICATION (2 threats)
  {
    id: 'credential-stuffing', name: 'Credential Stuffing', category: 'authentication' as const,
    color: '#ff00aa', damage: 'instant' as const, emoji: '🔑',
    description: 'Automated bot login attempts using leaked credentials',
    realWorldExample: 'Spotify (2020) - 300,000+ accounts hijacked via stuffing',
    consequences: ['Account takeover', 'Password leak', 'Unauthorized access'],
    educationalContent: [
      'Bots try millions of leaked passwords per hour',
      'MFA blocks 99% of automated attacks',
      "Use unique passwords so breaches don't cascade",
      'Enable authenticator apps on all critical accounts'
    ]
  },
  {
    id: 'session-hijacking', name: 'Session Hijacking', category: 'authentication' as const,
    color: '#ff44bb', damage: 'minor' as const, emoji: '🎪',
    description: 'Stealing active session cookies to bypass login',
    realWorldExample: 'Facebook session token theft via malicious browser extensions',
    consequences: ['Account takeover', 'Session theft', 'Bypass login'],
    educationalContent: [
      'Session cookies are like temporary keys',
      'Stolen cookies bypass passwords completely',
      'MFA requires reauth for sensitive actions',
      'Log out from public computers to clear sessions'
    ]
  },

  // DATA LOSS (2 threats)
  {
    id: 'ransomware', name: 'Ransomware Attack', category: 'data-loss' as const,
    color: '#ff0033', damage: 'instant' as const, emoji: '🔐',
    description: 'Malware encrypts your files and demands payment',
    realWorldExample: 'Colonial Pipeline (2021) - $4.4M ransom paid',
    consequences: ['Data encryption', 'Business disruption', 'Ransom demand'],
    educationalContent: [
      'Ransomware encrypts files, backups let you recover',
      'Never pay ransom - funds more attacks',
      "Backup offline so ransomware can't encrypt it",
      'Test restoring backups regularly'
    ]
  },
  {
    id: 'hardware-failure', name: 'Hardware Failure', category: 'data-loss' as const,
    color: '#ff4466', damage: 'minor' as const, emoji: '💾',
    description: 'Hard drive failure causing permanent data loss',
    realWorldExample: '140,000 hard drives fail per week in the US alone',
    consequences: ['Permanent data loss', 'No recovery', 'Business impact'],
    educationalContent: [
      "All drives fail eventually - it's not \"if\" but \"when\"",
      'RAID is not a backup (protects availability, not data)',
      'Follow 3-2-1 rule: 3 copies, 2 media, 1 offsite',
      'Cloud backup auto-protects against hardware death'
    ]
  }
]
