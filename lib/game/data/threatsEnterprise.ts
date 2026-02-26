// Threats: supply-chain, insider-threats, email-security, data-classification

export const threatsEnterprise = [
  // SUPPLY CHAIN (3 threats)
  {
    id: 'vendor-breach', name: 'Vendor Breach', category: 'supply-chain' as const,
    color: '#ff4488', damage: 'instant' as const, emoji: '🏭',
    description: 'Third-party compromise impacts your systems',
    realWorldExample: 'Supplier breach used to access customer networks',
    educationalContent: [
      'Assess vendor security posture',
      'Limit vendor access',
      'Monitor third-party connections',
      'Use contracts with security controls'
    ]
  },
  {
    id: 'compromised-update', name: 'Compromised Update', category: 'supply-chain' as const,
    color: '#ff3377', damage: 'instant' as const, emoji: '📦',
    description: 'Update channel delivers malicious code',
    realWorldExample: 'Trusted updates used to spread malware',
    educationalContent: [
      'Verify update signatures',
      'Use allowlists for updates',
      'Monitor for abnormal behavior',
      'Segment update systems'
    ]
  },
  {
    id: 'malicious-package', name: 'Malicious Package', category: 'supply-chain' as const,
    color: '#ff2255', damage: 'minor' as const, emoji: '🧪',
    description: 'Open-source dependency contains harmful code',
    realWorldExample: 'Typosquatted packages stealing secrets',
    educationalContent: [
      'Use SBOM tools',
      'Pin dependencies and verify sources',
      'Review package maintainers',
      'Scan for known vulnerabilities'
    ]
  },

  // INSIDER THREATS (3 threats)
  {
    id: 'accidental-data-share', name: 'Accidental Data Share', category: 'insider-threats' as const,
    color: '#ffcc66', damage: 'minor' as const, emoji: '🤝',
    description: 'Employee shares sensitive data by mistake',
    realWorldExample: 'File shared to the wrong team channel',
    educationalContent: [
      'Double-check recipients',
      'Use classification labels',
      'Use least-privilege sharing',
      'Review permissions regularly'
    ]
  },
  {
    id: 'privilege-abuse', name: 'Privilege Abuse', category: 'insider-threats' as const,
    color: '#ffbb55', damage: 'instant' as const, emoji: '🔑',
    description: 'Insider uses elevated access improperly',
    realWorldExample: 'Admin accesses records without approval',
    educationalContent: [
      'Use just-in-time access',
      'Log and audit privileged actions',
      'Separate duties',
      'Use approval workflows'
    ]
  },
  {
    id: 'data-exfiltration', name: 'Data Exfiltration', category: 'insider-threats' as const,
    color: '#ffaa44', damage: 'instant' as const, emoji: '📤',
    description: 'Data is copied out of the organization',
    realWorldExample: 'Large data dumps uploaded to personal accounts',
    educationalContent: [
      'Monitor data movement',
      'Limit exports and downloads',
      'Use DLP tools',
      'Alert on unusual transfers'
    ]
  },

  // EMAIL SECURITY (3 threats)
  {
    id: 'malicious-attachment', name: 'Malicious Attachment', category: 'email-security' as const,
    color: '#ff66cc', damage: 'instant' as const, emoji: '📎',
    description: 'Attachment contains malware or macros',
    realWorldExample: 'Invoice.docm delivers ransomware',
    educationalContent: [
      'Do not enable macros from unknown sources',
      'Use attachment scanning',
      'Verify sender identity',
      'Open files in sandboxed viewers'
    ]
  },
  {
    id: 'bec-scam', name: 'Business Email Compromise', category: 'email-security' as const,
    color: '#ff55bb', damage: 'instant' as const, emoji: '💼',
    description: 'Attackers impersonate executives to steal money',
    realWorldExample: 'Wire fraud via fake CEO request',
    educationalContent: [
      'Verify payment requests out of band',
      'Use dual approval for transfers',
      'Check reply-to addresses',
      'Be cautious with urgency'
    ]
  },
  {
    id: 'email-spoofing', name: 'Email Spoofing', category: 'email-security' as const,
    color: '#ff44aa', damage: 'minor' as const, emoji: '🕵️',
    description: 'Sender address is forged',
    realWorldExample: 'Spoofed vendor invoices sent to finance',
    educationalContent: [
      'Look beyond display names',
      'Use DMARC and SPF policies',
      'Hover links before clicking',
      'Report suspicious emails'
    ]
  },

  // DATA CLASSIFICATION (2 threats)
  {
    id: 'misclassified-data', name: 'Misclassified Data', category: 'data-classification' as const,
    color: '#66aa00', damage: 'minor' as const, emoji: '🏷️',
    description: 'Data is labeled with the wrong sensitivity',
    realWorldExample: 'Confidential data marked as public',
    educationalContent: [
      'Apply correct labels to data',
      'Use templates for classification',
      'Check labels before sharing',
      'Follow classification policies'
    ]
  },
  {
    id: 'wrong-sharing-channel', name: 'Wrong Sharing Channel', category: 'data-classification' as const,
    color: '#77bb11', damage: 'instant' as const, emoji: '🚫',
    description: 'Sensitive data shared in a public channel',
    realWorldExample: 'PII posted to public chat',
    educationalContent: [
      'Use approved secure channels',
      'Do not share sensitive data in public chats',
      'Use encrypted file sharing',
      'Check channel membership'
    ]
  }
]
