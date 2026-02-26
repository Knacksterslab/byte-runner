// Protection kits E: email-gateway, classification-labeler, privacy-check, device-control

export const kitsModern = [
  {
    id: 'email-gateway', name: 'Email Gateway', protectsAgainst: 'email-security' as const,
    emoji: '📧', color: '#ff55bb',
    description: 'Filters malicious attachments and spoofed emails',
    learningPoints: ['Scan attachments before opening', 'Verify sender identity', 'Use DMARC and SPF', 'Report suspicious emails'],
    whatItIs: 'Email gateways filter malicious content before it reaches users.',
    whyItMatters: 'Email remains the top delivery vector for attacks.',
    howToGetIt: ['Gmail and Outlook filtering', 'Enterprise secure email gateways', 'Attachment sandboxing tools'],
    howItWorks: 'Gateways scan for malware, spoofing, and risky links and quarantine suspicious messages.',
    realWorldExample: { title: 'Malicious Attachment Campaign', description: 'Invoice attachments deliver ransomware.', impact: 'Encrypted files and business downtime.' },
    stepByStepSetup: [{ platform: 'Email Security', steps: ['Enable advanced email filtering', 'Block macros by default', 'Report suspicious messages'] }]
  },
  {
    id: 'classification-labeler', name: 'Classification Labeler', protectsAgainst: 'data-classification' as const,
    emoji: '🏷️', color: '#66aa00',
    description: 'Labels data to enforce correct handling',
    learningPoints: ['Apply correct labels', 'Use secure channels for sensitive data', 'Review sharing permissions', 'Follow classification policy'],
    whatItIs: 'Classification labels signal how data should be stored and shared.',
    whyItMatters: 'Mislabeling leads to accidental exposure of sensitive data.',
    howToGetIt: ['Built-in labels in Microsoft or Google', 'Data classification policies', 'Training and tooling'],
    howItWorks: 'Labels trigger policy rules like encryption, access limits, and sharing restrictions.',
    realWorldExample: { title: 'Public Sharing Incident', description: 'Confidential file shared in a public channel.', impact: 'Data exposure and compliance risk.' },
    stepByStepSetup: [{ platform: 'Labeling', steps: ['Choose a classification label', 'Apply label before sharing', 'Review access lists'] }]
  },
  {
    id: 'privacy-check', name: 'Privacy Check', protectsAgainst: 'social-media' as const,
    emoji: '🕶️', color: '#bb66ff',
    description: 'Audits social posts for risky oversharing',
    learningPoints: ['Avoid posting sensitive work info', 'Disable location tagging', 'Review followers and visibility', 'Remove photo metadata'],
    whatItIs: 'Privacy checks help users review social posts before publishing.',
    whyItMatters: 'Public posts are used for reconnaissance and targeted attacks.',
    howToGetIt: ['Platform privacy settings', 'Social media privacy tools', 'Security awareness training'],
    howItWorks: 'Tools and checklists flag risky content and suggest safer sharing options.',
    realWorldExample: { title: 'Oversharing Leads to Phishing', description: 'Attackers use public profiles to craft targeted emails.', impact: 'Higher success rates for spear phishing.' },
    stepByStepSetup: [{ platform: 'Social Profiles', steps: ['Set profiles to private', 'Disable location sharing', 'Review posts before publishing'] }]
  },
  {
    id: 'device-control', name: 'Device Control', protectsAgainst: 'removable-media' as const,
    emoji: '🔌', color: '#ff4455',
    description: 'Blocks unsafe USB and removable media',
    learningPoints: ['Block unknown USB devices', 'Disable auto-run features', 'Encrypt approved removable media', 'Monitor data transfers'],
    whatItIs: 'Device control prevents unauthorized USB and removable media access.',
    whyItMatters: 'Removable media is a common malware and data exfiltration path.',
    howToGetIt: ['Endpoint device control tools', 'Group policy settings', 'DLP and logging'],
    howItWorks: 'Policies allow only approved devices and log all transfers.',
    realWorldExample: { title: 'USB Data Theft', description: 'Sensitive data copied to removable drives.', impact: 'Data leaks and legal exposure.' },
    stepByStepSetup: [{ platform: 'USB Control', steps: ['Allow only approved devices', 'Encrypt removable storage', 'Alert on large file transfers'] }]
  }
]
