// Threats: social-media, removable-media, mobile-security

export const threatsModern = [
  // SOCIAL MEDIA (3 threats)
  {
    id: 'oversharing-work-info', name: 'Oversharing Work Info', category: 'social-media' as const,
    color: '#bb66ff', damage: 'minor' as const, emoji: '📸',
    description: 'Posts reveal internal work details',
    realWorldExample: 'Whiteboards in photos expose project plans',
    educationalContent: [
      'Avoid sharing sensitive work details',
      'Review photos for backgrounds',
      'Use privacy settings',
      'When in doubt, do not post'
    ]
  },
  {
    id: 'location-tagging', name: 'Location Tagging', category: 'social-media' as const,
    color: '#aa55ff', damage: 'minor' as const, emoji: '📍',
    description: 'Real-time location reveals travel or routines',
    realWorldExample: 'Attackers track executive travel plans',
    educationalContent: [
      'Disable location tagging',
      'Post after leaving a location',
      'Limit who sees posts',
      'Remove photo metadata'
    ]
  },
  {
    id: 'recon-posting', name: 'Recon Posting', category: 'social-media' as const,
    color: '#9944ff', damage: 'instant' as const, emoji: '🔍',
    description: 'Attackers use posts to profile targets',
    realWorldExample: 'Social media used to craft spear phishing',
    educationalContent: [
      'Do not share org charts or tools',
      'Limit public profile details',
      'Be cautious with job titles',
      'Review followers regularly'
    ]
  },

  // REMOVABLE MEDIA (4 threats)
  {
    id: 'usb-drop', name: 'USB Drop', category: 'removable-media' as const,
    color: '#ff3344', damage: 'instant' as const, emoji: '💾',
    description: 'Unknown USB drive delivers malware',
    realWorldExample: 'USB drops used to breach secure facilities',
    educationalContent: [
      'Never plug in unknown USB devices',
      'Report found devices to security',
      'Use USB scanning stations',
      'Disable auto-run features'
    ]
  },
  {
    id: 'unauthorized-device', name: 'Unauthorized Device', category: 'removable-media' as const,
    color: '#ff4455', damage: 'minor' as const, emoji: '🔌',
    description: 'Unapproved devices connect to secure systems',
    realWorldExample: 'Personal USB used on company laptops',
    consequences: ['Malware from device', 'Data exfiltration', 'Policy violation'],
    educationalContent: [
      'Use only approved devices',
      'Enable device control policies',
      'Encrypt removable storage',
      'Report policy violations'
    ]
  },
  {
    id: 'usb-data-theft', name: 'USB Data Theft', category: 'removable-media' as const,
    color: '#ff5566', damage: 'instant' as const, emoji: '🗃️',
    description: 'Data is copied to removable media',
    realWorldExample: 'Sensitive data exfiltrated via USB',
    educationalContent: [
      'Block unauthorized data transfers',
      'Monitor large file copies',
      'Use DLP controls',
      'Encrypt portable storage'
    ]
  },
  {
    id: 'juice-jacking', name: 'Juice Jacking', category: 'removable-media' as const,
    color: '#ff6677', damage: 'minor' as const, emoji: '🔋',
    description: 'Public charging ports compromise devices',
    realWorldExample: 'Malware delivered via USB charging stations',
    educationalContent: [
      'Use power-only cables',
      'Carry your own charger',
      'Avoid unknown USB ports',
      'Use portable power banks'
    ]
  },

  // MOBILE SECURITY (3 threats)
  {
    id: 'sim-swap', name: 'SIM Swap', category: 'authentication' as const,
    color: '#ff22aa', damage: 'instant' as const, emoji: '📱',
    description: 'Attackers hijack phone numbers to bypass SMS codes',
    realWorldExample: 'Crypto accounts drained after SIM swaps',
    educationalContent: [
      'Use authenticator apps, not SMS',
      'Set a carrier PIN',
      'Monitor for sudden service loss',
      'Enable account alerts'
    ]
  },
  {
    id: 'malicious-app', name: 'Malicious App', category: 'privacy' as const,
    color: '#aa00aa', damage: 'minor' as const, emoji: '🧨',
    description: 'Apps request dangerous permissions or spy on users',
    realWorldExample: 'Fake flashlight apps harvesting data',
    educationalContent: [
      'Install apps from trusted stores',
      'Review permissions before installing',
      'Remove unused apps',
      'Keep mobile OS updated'
    ]
  },
  {
    id: 'permission-abuse', name: 'Permission Abuse', category: 'privacy' as const,
    color: '#bb11bb', damage: 'minor' as const, emoji: '🔓',
    description: 'Apps access data they do not need',
    realWorldExample: 'Games accessing contacts and location',
    educationalContent: [
      'Deny unnecessary permissions',
      'Use one-time permissions',
      'Audit permissions monthly',
      'Disable background access'
    ]
  }
]
