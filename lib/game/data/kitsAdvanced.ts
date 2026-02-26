// Protection kits C: badge-tap, secure-shred, policy-knowledge, ethics-reporting, compliance-kit, remote-work-guard

export const kitsAdvanced = [
  {
    id: 'badge-tap', name: 'Badge Tap', protectsAgainst: 'physical-security' as const,
    emoji: '🪪', color: '#ffaa33',
    description: 'Controls physical access to secure areas',
    learningPoints: ['Never allow tailgating', 'Challenge unfamiliar people', 'Badge access is personal', 'Use visitor escort policies'],
    whatItIs: 'Badge access uses physical credentials to unlock doors and track entry to secure spaces.',
    whyItMatters: 'Physical access bypasses many digital defenses. If an attacker gets inside, they can access devices, documents, and networks.',
    howToGetIt: ['Company-issued badge with access control', 'Visitor badge and escort system', 'Security awareness training'],
    howItWorks: 'Access control systems verify badge credentials at the door and log entries. Alerts trigger on invalid attempts or unusual access.',
    realWorldExample: { title: 'Tailgating in Office Lobbies', description: 'Attackers pretend to be delivery staff or hold doors to gain entry.', impact: 'Unauthorized entry leads to device theft, planted malware, and document access.' },
    stepByStepSetup: [{ platform: 'Office Access', steps: ['Carry your badge at all times', 'Do not hold secure doors for strangers', 'Report lost badges immediately'] }]
  },
  {
    id: 'secure-shred', name: 'Secure Shred', protectsAgainst: 'secure-disposal' as const,
    emoji: '🗑️', color: '#cc5555',
    description: 'Destroys sensitive paper and media before disposal',
    learningPoints: ['Shred sensitive documents', 'Use locked disposal bins', 'Destroy old drives securely', 'Follow retention policies'],
    whatItIs: 'Secure disposal ensures sensitive information is destroyed before it leaves your control.',
    whyItMatters: 'Trash and recycling are common sources of leaks. A single discarded printout can expose credentials or customer data.',
    howToGetIt: ['Cross-cut shredder for paper', 'Secure bins for pickup', 'Certified media destruction services'],
    howItWorks: 'Documents are shredded and media is wiped or physically destroyed, making data recovery impractical.',
    realWorldExample: { title: 'Dumpster Diving Incidents', description: 'Attackers retrieve passwords and invoices from office trash.', impact: 'Leaked data leads to account compromise and reputational damage.' },
    stepByStepSetup: [{ platform: 'Office Disposal', steps: ['Place sensitive papers in locked bins', 'Use cross-cut shredders for immediate disposal', 'Schedule certified media destruction'] }]
  },
  {
    id: 'policy-knowledge', name: 'Policy Knowledge', protectsAgainst: 'policy' as const,
    emoji: '📘', color: '#7766ff',
    description: 'Ensures users follow acceptable use rules',
    learningPoints: ['Know the acceptable use policy', 'Use approved tools only', 'Avoid sharing accounts', 'Report policy concerns early'],
    whatItIs: 'Security policies define what is allowed and how to handle data, devices, and access.',
    whyItMatters: 'Policy violations often create the gaps attackers exploit. Clear rules reduce risky behavior.',
    howToGetIt: ['Complete required security training', 'Read the acceptable use policy', 'Ask IT or security for clarification'],
    howItWorks: 'Policy knowledge helps employees recognize and avoid risky actions like installing unauthorized software or sharing credentials.',
    realWorldExample: { title: 'Shadow IT Exposure', description: 'Employees use unapproved apps to store company files.', impact: 'Data is exposed in tools that lack enterprise security controls.' },
    stepByStepSetup: [{ platform: 'Company Policy', steps: ['Review the acceptable use policy quarterly', 'Use only approved apps and services', 'Report violations without delay'] }]
  },
  {
    id: 'ethics-reporting', name: 'Ethics Reporting', protectsAgainst: 'incident-reporting' as const,
    emoji: '📣', color: '#ff9900',
    description: 'Promotes fast, correct incident reporting',
    learningPoints: ['Report incidents immediately', 'Use official channels', 'Provide clear details', 'Know whistleblower protections'],
    whatItIs: 'Incident reporting channels let employees raise security and ethics concerns safely.',
    whyItMatters: 'Fast reporting reduces damage. Silence or delays allow attacks to spread.',
    howToGetIt: ['Security hotline or ticketing system', 'Anonymous reporting options', 'Incident response playbooks'],
    howItWorks: 'Reporting channels route incidents to responders, who can contain threats and preserve evidence.',
    realWorldExample: { title: 'Delayed Breach Reports', description: 'Employees notice suspicious activity but do not report it quickly.', impact: 'Attackers remain active longer, increasing losses.' },
    stepByStepSetup: [{ platform: 'Incident Reporting', steps: ['Save the incident hotline and URL', 'Report immediately with time and details', 'Follow responder instructions'] }]
  },
  {
    id: 'compliance-kit', name: 'Compliance Kit', protectsAgainst: 'compliance' as const,
    emoji: '⚖️', color: '#33aaff',
    description: 'Applies required controls for regulated data',
    learningPoints: ['Know which data is regulated', 'Use approved storage and encryption', 'Limit access and sharing', 'Report compliance incidents'],
    whatItIs: 'Compliance controls protect regulated data like PII, PHI, and cardholder information.',
    whyItMatters: 'Noncompliance leads to fines, legal exposure, and loss of customer trust.',
    howToGetIt: ['Compliance training and policies', 'Approved tools for storage and sharing', 'Regular audits and reviews'],
    howItWorks: 'Compliance tools enforce encryption, access controls, and audit logs to meet regulatory requirements.',
    realWorldExample: { title: 'PCI DSS Fines', description: 'Card data stored without required controls.', impact: 'Costly fines and mandatory remediation programs.' },
    stepByStepSetup: [{ platform: 'Compliance Basics', steps: ['Label regulated data correctly', 'Use approved systems only', 'Follow retention and deletion rules'] }]
  },
  {
    id: 'remote-work-guard', name: 'Remote Work Guard', protectsAgainst: 'remote-work' as const,
    emoji: '🏡', color: '#55cc99',
    description: 'Hardens home networks and remote access',
    learningPoints: ['Secure home routers', 'Separate work and personal devices', 'Use VPN for sensitive work', 'Keep devices updated'],
    whatItIs: 'Remote work security protects devices and networks outside the office.',
    whyItMatters: 'Home networks lack enterprise protections, making them common targets.',
    howToGetIt: ['Home router security checklist', 'Company VPN access', 'Endpoint protection tools'],
    howItWorks: 'Remote work guard combines secure WiFi, device hardening, and VPN use to reduce exposure.',
    realWorldExample: { title: 'Home Network Breach', description: 'Weak router password lets attackers intercept traffic.', impact: 'Credentials stolen and accounts compromised.' },
    stepByStepSetup: [{ platform: 'Home Setup', steps: ['Change router default password', 'Enable WPA3 or WPA2', 'Use a guest network for personal devices'] }]
  }
]
