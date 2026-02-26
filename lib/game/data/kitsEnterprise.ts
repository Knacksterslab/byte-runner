// Protection kits D: waiting-room, travel-vpn, encryption-kit, sbom-toolkit, insider-monitor

export const kitsEnterprise = [
  {
    id: 'waiting-room', name: 'Waiting Room', protectsAgainst: 'meeting-security' as const,
    emoji: '🛎️', color: '#aa77ff',
    description: 'Controls who can join online meetings',
    learningPoints: ['Enable waiting rooms or lobbies', 'Require meeting passwords', 'Lock meetings once started', 'Avoid public links'],
    whatItIs: 'Meeting controls limit access to approved participants.',
    whyItMatters: 'Meeting intrusion can expose sensitive discussions and documents.',
    howToGetIt: ['Zoom, Teams, or Meet waiting rooms', 'Unique meeting links', 'Host controls and locks'],
    howItWorks: 'Hosts approve attendees and restrict access until verified.',
    realWorldExample: { title: 'Meeting Bombing', description: 'Public links allow unknown users into meetings.', impact: 'Disruption, data exposure, and reputational harm.' },
    stepByStepSetup: [{ platform: 'Video Meetings', steps: ['Enable waiting room by default', 'Require passwords for external attendees', 'Lock meeting after start'] }]
  },
  {
    id: 'travel-vpn', name: 'Travel VPN', protectsAgainst: 'travel-security' as const,
    emoji: '🧳', color: '#00bbff',
    description: 'Protects traffic on hotel and public networks',
    learningPoints: ['Use VPN on all travel WiFi', 'Avoid public kiosks for sensitive tasks', 'Disable auto-join networks', 'Use mobile hotspots when possible'],
    whatItIs: 'A travel VPN encrypts traffic when you use untrusted networks.',
    whyItMatters: 'Travel networks are often monitored or spoofed.',
    howToGetIt: ['Company VPN client', 'Reputable consumer VPN', 'Mobile hotspot backup'],
    howItWorks: 'VPNs create an encrypted tunnel so local networks cannot read your traffic.',
    realWorldExample: { title: 'Hotel WiFi Spoofing', description: 'Attackers create fake hotel hotspots.', impact: 'Credentials are stolen from travelers.' },
    stepByStepSetup: [{ platform: 'Travel Setup', steps: ['Install VPN on all devices', 'Connect before opening apps', 'Disable auto-join for unknown networks'] }]
  },
  {
    id: 'encryption-kit', name: 'Encryption Kit', protectsAgainst: 'data-protection' as const,
    emoji: '🔏', color: '#00cc66',
    description: 'Encrypts sensitive data at rest and in transit',
    learningPoints: ['Use full-disk encryption', 'Encrypt files before sharing', 'Protect encryption keys', 'Use secure file transfer'],
    whatItIs: 'Encryption turns readable data into ciphertext that only authorized users can access.',
    whyItMatters: 'Lost devices or leaked files are useless without decryption keys.',
    howToGetIt: ['BitLocker or FileVault', 'Encrypted file-sharing tools', 'Key management policies'],
    howItWorks: 'Encryption uses strong algorithms to protect data at rest and in transit. Keys are required to decrypt.',
    realWorldExample: { title: 'Lost Laptop Incident', description: 'Unencrypted laptop lost during travel.', impact: 'Sensitive data exposure and regulatory risk.' },
    stepByStepSetup: [{ platform: 'Device Encryption', steps: ['Enable full-disk encryption', 'Use strong passwords for keys', 'Back up recovery keys securely'] }]
  },
  {
    id: 'sbom-toolkit', name: 'SBOM Toolkit', protectsAgainst: 'supply-chain' as const,
    emoji: '📦', color: '#ff3366',
    description: 'Tracks and verifies software components',
    learningPoints: ['Know your dependencies', 'Verify update signatures', 'Scan for known vulnerabilities', 'Use trusted sources'],
    whatItIs: 'An SBOM lists software components to help detect risky dependencies.',
    whyItMatters: 'Supply chain attacks hide in dependencies and updates.',
    howToGetIt: ['SBOM tools like Syft or CycloneDX', 'Dependency scanning services', 'Update verification policies'],
    howItWorks: 'SBOM tools inventory packages and check them against vulnerability databases.',
    realWorldExample: { title: 'Compromised Dependency', description: 'Malicious package published with a similar name.', impact: 'Secrets stolen through infected builds.' },
    stepByStepSetup: [{ platform: 'Software Supply Chain', steps: ['Generate SBOMs for builds', 'Scan for vulnerabilities', 'Pin and verify dependencies'] }]
  },
  {
    id: 'insider-monitor', name: 'Insider Monitor', protectsAgainst: 'insider-threats' as const,
    emoji: '👁️', color: '#ffbb55',
    description: 'Detects risky or abusive internal behavior',
    learningPoints: ['Use least privilege access', 'Audit privileged actions', 'Monitor data movement', 'Separate duties'],
    whatItIs: 'Insider monitoring detects unusual access or data movement.',
    whyItMatters: 'Insider incidents can be accidental or malicious and are costly to detect.',
    howToGetIt: ['DLP tools and audit logs', 'Privileged access management', 'Behavior analytics'],
    howItWorks: 'Monitoring tools flag unusual access patterns and large transfers for review.',
    realWorldExample: { title: 'Privilege Abuse Case', description: 'Admin accessed data without approval.', impact: 'Unauthorized exposure and compliance issues.' },
    stepByStepSetup: [{ platform: 'Access Monitoring', steps: ['Enable audit logs', 'Review privilege changes', 'Set alerts for unusual access'] }]
  }
]
