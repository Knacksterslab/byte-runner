// Threats: social-engineering, physical-security, secure-disposal, policy, incident-reporting

export const threatsIntermediate = [
  // SOCIAL ENGINEERING (2 threats)
  {
    id: 'pretexting', name: 'Pretexting Attack', category: 'social-engineering' as const,
    color: '#ff6600', damage: 'instant' as const, emoji: '🎭',
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
    id: 'baiting-attack', name: 'Baiting Attack', category: 'social-engineering' as const,
    color: '#ff8833', damage: 'minor' as const, emoji: '🪝',
    description: 'Tempting offer or found USB drives containing malware',
    realWorldExample: 'Stuxnet worm spread via infected USB drops at target facilities',
    educationalContent: [
      'Free prizes, job offers, USB drives left in parking lot',
      'If it seems too good to be true, it probably is',
      'Never plug in found USB drives',
      'Verify offers directly with company website'
    ]
  },

  // PHYSICAL SECURITY (4 threats)
  {
    id: 'tailgating', name: 'Tailgating', category: 'physical-security' as const,
    color: '#ff7700', damage: 'instant' as const, emoji: '🚪',
    description: 'Someone follows you into a secure area without access',
    realWorldExample: 'Attackers pose as delivery staff to enter office buildings',
    educationalContent: [
      'Never hold secure doors open for strangers',
      'Challenge or report unfamiliar people',
      'Badge access is only for authorized users',
      'Visitors must be escorted at all times'
    ]
  },
  {
    id: 'shoulder-surfing', name: 'Shoulder Surfing', category: 'physical-security' as const,
    color: '#ff9933', damage: 'minor' as const, emoji: '👀',
    description: 'Someone watches your screen or keyboard to steal secrets',
    realWorldExample: 'Passwords captured in public coworking spaces',
    educationalContent: [
      'Use privacy screens in public',
      'Angle screens away from foot traffic',
      'Lock your device when you step away',
      'Be aware of people nearby'
    ]
  },
  {
    id: 'unlocked-workstation', name: 'Unlocked Workstation', category: 'physical-security' as const,
    color: '#ff8844', damage: 'instant' as const, emoji: '🖥️',
    description: 'An unattended, unlocked computer is exploited',
    realWorldExample: 'Unauthorized emails sent from unattended laptops',
    educationalContent: [
      'Use Windows+L or Ctrl+Cmd+Q to lock',
      'Auto-lock after short idle time',
      'Do not leave screens unlocked',
      'Report unattended devices'
    ]
  },
  {
    id: 'document-theft', name: 'Document Theft', category: 'physical-security' as const,
    color: '#ff6644', damage: 'minor' as const, emoji: '📄',
    description: 'Sensitive papers are taken from desks or printers',
    realWorldExample: 'Printed HR records stolen from shared printers',
    educationalContent: [
      'Collect prints immediately',
      'Keep sensitive documents locked',
      'Use secure print release',
      'Clear desks at end of day'
    ]
  },

  // SECURE DISPOSAL (2 threats)
  {
    id: 'improper-disposal', name: 'Improper Disposal', category: 'secure-disposal' as const,
    color: '#cc4444', damage: 'minor' as const, emoji: '🗑️',
    description: 'Sensitive documents are thrown away intact',
    realWorldExample: 'Customer data found in public trash bins',
    educationalContent: [
      'Shred paper with sensitive data',
      'Use locked disposal bins',
      'Follow clean desk policies',
      'Dispose of drives securely'
    ]
  },
  {
    id: 'dumpster-diving', name: 'Dumpster Diving', category: 'secure-disposal' as const,
    color: '#bb5555', damage: 'instant' as const, emoji: '🪦',
    description: 'Attackers retrieve secrets from trash',
    realWorldExample: 'Passwords and invoices recovered from dumpsters',
    educationalContent: [
      'Shred documents before disposal',
      'Destroy media before recycling',
      'Lock disposal containers',
      'Train staff on disposal procedures'
    ]
  },

  // POLICY (2 threats)
  {
    id: 'policy-violation', name: 'Policy Violation', category: 'policy' as const,
    color: '#8866ff', damage: 'minor' as const, emoji: '📘',
    description: 'User breaks acceptable use or security policy',
    realWorldExample: 'Sharing credentials violates acceptable use policies',
    educationalContent: [
      'Know your acceptable use policy',
      'Never share accounts or passwords',
      'Use approved tools only',
      'Report policy concerns early'
    ]
  },
  {
    id: 'unauthorized-software', name: 'Unauthorized Software', category: 'policy' as const,
    color: '#7755ff', damage: 'instant' as const, emoji: '🧩',
    description: 'Unapproved apps create security gaps',
    realWorldExample: 'Shadow IT apps expose sensitive files',
    educationalContent: [
      'Install software only from approved sources',
      'Shadow IT increases breach risk',
      'Ask IT for approved alternatives',
      'Remove unused tools'
    ]
  },

  // INCIDENT REPORTING (4 threats)
  {
    id: 'delayed-reporting', name: 'Delayed Reporting', category: 'incident-reporting' as const,
    color: '#ffaa00', damage: 'minor' as const, emoji: '⏱️',
    description: 'Incidents are reported too late',
    realWorldExample: 'Breaches go unreported for weeks',
    educationalContent: [
      'Report incidents immediately',
      'Minutes matter in containment',
      'Use the official reporting channel',
      'Do not investigate alone'
    ]
  },
  {
    id: 'wrong-channel', name: 'Wrong Channel', category: 'incident-reporting' as const,
    color: '#ffbb22', damage: 'minor' as const, emoji: '📵',
    description: 'Incident is reported through the wrong channel',
    realWorldExample: 'Critical events sent to general inboxes',
    educationalContent: [
      'Use the designated incident hotline',
      'Know the escalation path',
      'Include key details',
      'Follow incident playbooks'
    ]
  },
  {
    id: 'incomplete-details', name: 'Incomplete Details', category: 'incident-reporting' as const,
    color: '#ffcc44', damage: 'minor' as const, emoji: '📝',
    description: 'Missing details slow response',
    realWorldExample: 'Investigation delayed due to missing timestamps',
    educationalContent: [
      'Include who, what, when, where',
      'Capture screenshots if safe',
      'Preserve evidence',
      'Stay available for questions'
    ]
  },
  {
    id: 'retaliation-threat', name: 'Retaliation Threat', category: 'incident-reporting' as const,
    color: '#ff8800', damage: 'instant' as const, emoji: '⚖️',
    description: 'Fear of retaliation stops reporting',
    realWorldExample: 'Employees avoid reporting misconduct',
    educationalContent: [
      'Whistleblower protections exist',
      'Use anonymous channels if needed',
      'Ethics teams handle confidentiality',
      'Reporting protects the organization'
    ]
  }
]
