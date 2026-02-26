// Threats: compliance, remote-work, meeting-security, travel-security, data-protection

export const threatsAdvanced = [
  // COMPLIANCE (3 threats)
  {
    id: 'gdpr-violation', name: 'GDPR Violation', category: 'compliance' as const,
    color: '#44aaff', damage: 'instant' as const, emoji: '📜',
    description: 'Improper handling of EU personal data',
    realWorldExample: 'Fines issued for unlawful data processing',
    educationalContent: [
      'Collect only required data',
      'Honor data deletion requests',
      'Get explicit consent',
      'Secure personal data'
    ]
  },
  {
    id: 'hipaa-breach', name: 'HIPAA Breach', category: 'compliance' as const,
    color: '#33bbff', damage: 'instant' as const, emoji: '🏥',
    description: 'Protected health information is exposed',
    realWorldExample: 'Patient records emailed without encryption',
    educationalContent: [
      'Encrypt PHI in transit and at rest',
      'Use minimum necessary access',
      'Report incidents immediately',
      'Verify recipients'
    ]
  },
  {
    id: 'pci-noncompliance', name: 'PCI-DSS Noncompliance', category: 'compliance' as const,
    color: '#22ccff', damage: 'minor' as const, emoji: '💳',
    description: 'Cardholder data handled without required controls',
    realWorldExample: 'Payment data stored in plain text',
    educationalContent: [
      'Never store full card data',
      'Use approved payment processors',
      'Limit access to payment systems',
      'Audit and monitor regularly'
    ]
  },

  // REMOTE WORK (3 threats)
  {
    id: 'unsecured-home-router', name: 'Unsecured Home Router', category: 'remote-work' as const,
    color: '#66ddaa', damage: 'minor' as const, emoji: '📡',
    description: 'Weak router settings expose remote work traffic',
    realWorldExample: 'Default router passwords exploited',
    educationalContent: [
      'Change default router credentials',
      'Enable WPA3 or WPA2',
      'Update router firmware',
      'Disable WPS'
    ]
  },
  {
    id: 'family-device', name: 'Family Device on Network', category: 'remote-work' as const,
    color: '#55cc99', damage: 'minor' as const, emoji: '👨‍👩‍👧‍👦',
    description: 'Unmanaged devices share the work network',
    realWorldExample: 'Malware on a child device spreads on WiFi',
    educationalContent: [
      'Use a guest network for personal devices',
      'Keep work devices separated',
      'Install security updates',
      'Use endpoint protection'
    ]
  },
  {
    id: 'weak-home-wifi', name: 'Weak Home WiFi', category: 'remote-work' as const,
    color: '#44bb88', damage: 'instant' as const, emoji: '🛜',
    description: 'Weak encryption allows interception at home',
    realWorldExample: 'Neighbors guess weak WiFi passwords',
    educationalContent: [
      'Use strong WiFi passwords',
      'Disable old protocols like WEP',
      'Rotate passwords regularly',
      'Use VPN for sensitive work'
    ]
  },

  // MEETING SECURITY (2 threats)
  {
    id: 'zoom-bombing', name: 'Meeting Intrusion', category: 'meeting-security' as const,
    color: '#aa77ff', damage: 'instant' as const, emoji: '🎥',
    description: 'Uninvited users join a meeting',
    realWorldExample: 'Public meeting links shared on social media',
    educationalContent: [
      'Use waiting rooms or lobbies',
      'Require meeting passwords',
      'Lock meetings after start',
      'Avoid posting links publicly'
    ]
  },
  {
    id: 'meeting-link-leak', name: 'Meeting Link Leak', category: 'meeting-security' as const,
    color: '#9955ff', damage: 'minor' as const, emoji: '🔗',
    description: 'Meeting links are shared broadly',
    realWorldExample: 'Links forwarded to external groups',
    educationalContent: [
      'Share links only with invitees',
      'Use unique meeting IDs',
      'Rotate links for recurring meetings',
      'Use approved meeting tools'
    ]
  },

  // TRAVEL SECURITY (2 threats)
  {
    id: 'hotel-wifi', name: 'Hotel WiFi Trap', category: 'travel-security' as const,
    color: '#00ddff', damage: 'instant' as const, emoji: '🏨',
    description: 'Untrusted hotel networks expose traffic',
    realWorldExample: 'Fake hotel hotspots stealing credentials',
    educationalContent: [
      'Always use a travel VPN',
      'Confirm network names at the front desk',
      'Disable auto-join on WiFi',
      'Use personal hotspots when possible'
    ]
  },
  {
    id: 'public-kiosk', name: 'Public Kiosk Risk', category: 'travel-security' as const,
    color: '#22bbff', damage: 'minor' as const, emoji: '🖥️',
    description: 'Shared computers capture credentials',
    realWorldExample: 'Keyloggers installed on hotel kiosks',
    educationalContent: [
      'Avoid logging into sensitive accounts',
      'Use private browsing if unavoidable',
      'Never save passwords on shared machines',
      'Log out and clear sessions'
    ]
  },

  // DATA PROTECTION (2 threats)
  {
    id: 'unencrypted-storage', name: 'Unencrypted Storage', category: 'data-protection' as const,
    color: '#00cc66', damage: 'instant' as const, emoji: '🔓',
    description: 'Sensitive files stored without encryption',
    realWorldExample: 'Lost laptop exposes plain-text files',
    educationalContent: [
      'Encrypt data at rest',
      'Use full-disk encryption',
      'Protect keys with MFA',
      'Limit who can decrypt data'
    ]
  },
  {
    id: 'over-shared-data', name: 'Over-Sharing Data', category: 'data-protection' as const,
    color: '#11dd77', damage: 'minor' as const, emoji: '📤',
    description: 'Sensitive data shared too broadly',
    realWorldExample: 'Public link exposes internal documents',
    educationalContent: [
      'Share with least privilege',
      'Use expiring links',
      'Review sharing permissions',
      'Avoid public links for sensitive data'
    ]
  }
]
