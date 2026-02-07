// Threat type system for all 8 Tier 1 cybersecurity categories
import { getRandomItem, findById, filterByCategory } from './utils'

export type ThreatCategory =
  | 'password'
  | 'phishing'
  | 'updates'
  | 'privacy'
  | 'wifi'
  | 'authentication'
  | 'data-loss'
  | 'social-engineering'
  | 'physical-security'
  | 'secure-disposal'
  | 'policy'
  | 'incident-reporting'
  | 'compliance'
  | 'remote-work'
  | 'meeting-security'
  | 'travel-security'
  | 'data-protection'
  | 'supply-chain'
  | 'insider-threats'
  | 'email-security'
  | 'data-classification'
  | 'social-media'
  | 'removable-media'
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
  },

  // PHYSICAL SECURITY (4 threats)
  {
    id: 'tailgating',
    name: 'Tailgating',
    category: 'physical-security',
    color: '#ff7700',
    damage: 'instant',
    emoji: '🚪',
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
    id: 'shoulder-surfing',
    name: 'Shoulder Surfing',
    category: 'physical-security',
    color: '#ff9933',
    damage: 'minor',
    emoji: '👀',
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
    id: 'unlocked-workstation',
    name: 'Unlocked Workstation',
    category: 'physical-security',
    color: '#ff8844',
    damage: 'instant',
    emoji: '🖥️',
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
    id: 'document-theft',
    name: 'Document Theft',
    category: 'physical-security',
    color: '#ff6644',
    damage: 'minor',
    emoji: '📄',
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
    id: 'improper-disposal',
    name: 'Improper Disposal',
    category: 'secure-disposal',
    color: '#cc4444',
    damage: 'minor',
    emoji: '🗑️',
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
    id: 'dumpster-diving',
    name: 'Dumpster Diving',
    category: 'secure-disposal',
    color: '#bb5555',
    damage: 'instant',
    emoji: '🪦',
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
    id: 'policy-violation',
    name: 'Policy Violation',
    category: 'policy',
    color: '#8866ff',
    damage: 'minor',
    emoji: '📘',
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
    id: 'unauthorized-software',
    name: 'Unauthorized Software',
    category: 'policy',
    color: '#7755ff',
    damage: 'instant',
    emoji: '🧩',
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
    id: 'delayed-reporting',
    name: 'Delayed Reporting',
    category: 'incident-reporting',
    color: '#ffaa00',
    damage: 'minor',
    emoji: '⏱️',
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
    id: 'wrong-channel',
    name: 'Wrong Channel',
    category: 'incident-reporting',
    color: '#ffbb22',
    damage: 'minor',
    emoji: '📵',
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
    id: 'incomplete-details',
    name: 'Incomplete Details',
    category: 'incident-reporting',
    color: '#ffcc44',
    damage: 'minor',
    emoji: '📝',
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
    id: 'retaliation-threat',
    name: 'Retaliation Threat',
    category: 'incident-reporting',
    color: '#ff8800',
    damage: 'instant',
    emoji: '⚖️',
    description: 'Fear of retaliation stops reporting',
    realWorldExample: 'Employees avoid reporting misconduct',
    educationalContent: [
      'Whistleblower protections exist',
      'Use anonymous channels if needed',
      'Ethics teams handle confidentiality',
      'Reporting protects the organization'
    ]
  },

  // COMPLIANCE (3 threats)
  {
    id: 'gdpr-violation',
    name: 'GDPR Violation',
    category: 'compliance',
    color: '#44aaff',
    damage: 'instant',
    emoji: '📜',
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
    id: 'hipaa-breach',
    name: 'HIPAA Breach',
    category: 'compliance',
    color: '#33bbff',
    damage: 'instant',
    emoji: '🏥',
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
    id: 'pci-noncompliance',
    name: 'PCI-DSS Noncompliance',
    category: 'compliance',
    color: '#22ccff',
    damage: 'minor',
    emoji: '💳',
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
    id: 'unsecured-home-router',
    name: 'Unsecured Home Router',
    category: 'remote-work',
    color: '#66ddaa',
    damage: 'minor',
    emoji: '📡',
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
    id: 'family-device',
    name: 'Family Device on Network',
    category: 'remote-work',
    color: '#55cc99',
    damage: 'minor',
    emoji: '👨‍👩‍👧‍👦',
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
    id: 'weak-home-wifi',
    name: 'Weak Home WiFi',
    category: 'remote-work',
    color: '#44bb88',
    damage: 'instant',
    emoji: '🛜',
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
    id: 'zoom-bombing',
    name: 'Meeting Intrusion',
    category: 'meeting-security',
    color: '#aa77ff',
    damage: 'instant',
    emoji: '🎥',
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
    id: 'meeting-link-leak',
    name: 'Meeting Link Leak',
    category: 'meeting-security',
    color: '#9955ff',
    damage: 'minor',
    emoji: '🔗',
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
    id: 'hotel-wifi',
    name: 'Hotel WiFi Trap',
    category: 'travel-security',
    color: '#00ddff',
    damage: 'instant',
    emoji: '🏨',
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
    id: 'public-kiosk',
    name: 'Public Kiosk Risk',
    category: 'travel-security',
    color: '#22bbff',
    damage: 'minor',
    emoji: '🖥️',
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
    id: 'unencrypted-storage',
    name: 'Unencrypted Storage',
    category: 'data-protection',
    color: '#00cc66',
    damage: 'instant',
    emoji: '🔓',
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
    id: 'over-shared-data',
    name: 'Over-Sharing Data',
    category: 'data-protection',
    color: '#11dd77',
    damage: 'minor',
    emoji: '📤',
    description: 'Sensitive data shared too broadly',
    realWorldExample: 'Public link exposes internal documents',
    educationalContent: [
      'Share with least privilege',
      'Use expiring links',
      'Review sharing permissions',
      'Avoid public links for sensitive data'
    ]
  },

  // SUPPLY CHAIN (3 threats)
  {
    id: 'vendor-breach',
    name: 'Vendor Breach',
    category: 'supply-chain',
    color: '#ff4488',
    damage: 'instant',
    emoji: '🏭',
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
    id: 'compromised-update',
    name: 'Compromised Update',
    category: 'supply-chain',
    color: '#ff3377',
    damage: 'instant',
    emoji: '📦',
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
    id: 'malicious-package',
    name: 'Malicious Package',
    category: 'supply-chain',
    color: '#ff2255',
    damage: 'minor',
    emoji: '🧪',
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
    id: 'accidental-data-share',
    name: 'Accidental Data Share',
    category: 'insider-threats',
    color: '#ffcc66',
    damage: 'minor',
    emoji: '🤝',
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
    id: 'privilege-abuse',
    name: 'Privilege Abuse',
    category: 'insider-threats',
    color: '#ffbb55',
    damage: 'instant',
    emoji: '🔑',
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
    id: 'data-exfiltration',
    name: 'Data Exfiltration',
    category: 'insider-threats',
    color: '#ffaa44',
    damage: 'instant',
    emoji: '📤',
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
    id: 'malicious-attachment',
    name: 'Malicious Attachment',
    category: 'email-security',
    color: '#ff66cc',
    damage: 'instant',
    emoji: '📎',
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
    id: 'bec-scam',
    name: 'Business Email Compromise',
    category: 'email-security',
    color: '#ff55bb',
    damage: 'instant',
    emoji: '💼',
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
    id: 'email-spoofing',
    name: 'Email Spoofing',
    category: 'email-security',
    color: '#ff44aa',
    damage: 'minor',
    emoji: '🕵️',
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
    id: 'misclassified-data',
    name: 'Misclassified Data',
    category: 'data-classification',
    color: '#66aa00',
    damage: 'minor',
    emoji: '🏷️',
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
    id: 'wrong-sharing-channel',
    name: 'Wrong Sharing Channel',
    category: 'data-classification',
    color: '#77bb11',
    damage: 'instant',
    emoji: '🚫',
    description: 'Sensitive data shared in a public channel',
    realWorldExample: 'PII posted to public chat',
    educationalContent: [
      'Use approved secure channels',
      'Do not share sensitive data in public chats',
      'Use encrypted file sharing',
      'Check channel membership'
    ]
  },

  // SOCIAL MEDIA (3 threats)
  {
    id: 'oversharing-work-info',
    name: 'Oversharing Work Info',
    category: 'social-media',
    color: '#bb66ff',
    damage: 'minor',
    emoji: '📸',
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
    id: 'location-tagging',
    name: 'Location Tagging',
    category: 'social-media',
    color: '#aa55ff',
    damage: 'minor',
    emoji: '📍',
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
    id: 'recon-posting',
    name: 'Recon Posting',
    category: 'social-media',
    color: '#9944ff',
    damage: 'instant',
    emoji: '🔍',
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
    id: 'usb-drop',
    name: 'USB Drop',
    category: 'removable-media',
    color: '#ff3344',
    damage: 'instant',
    emoji: '💾',
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
    id: 'unauthorized-device',
    name: 'Unauthorized Device',
    category: 'removable-media',
    color: '#ff4455',
    damage: 'minor',
    emoji: '🔌',
    description: 'Unapproved devices connect to secure systems',
    realWorldExample: 'Personal USB used on company laptops',
    educationalContent: [
      'Use only approved devices',
      'Enable device control policies',
      'Encrypt removable storage',
      'Report policy violations'
    ]
  },
  {
    id: 'usb-data-theft',
    name: 'USB Data Theft',
    category: 'removable-media',
    color: '#ff5566',
    damage: 'instant',
    emoji: '🗃️',
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
    id: 'juice-jacking',
    name: 'Juice Jacking',
    category: 'removable-media',
    color: '#ff6677',
    damage: 'minor',
    emoji: '🔋',
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
    id: 'sim-swap',
    name: 'SIM Swap',
    category: 'authentication',
    color: '#ff22aa',
    damage: 'instant',
    emoji: '📱',
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
    id: 'malicious-app',
    name: 'Malicious App',
    category: 'privacy',
    color: '#aa00aa',
    damage: 'minor',
    emoji: '🧨',
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
    id: 'permission-abuse',
    name: 'Permission Abuse',
    category: 'privacy',
    color: '#bb11bb',
    damage: 'minor',
    emoji: '🔓',
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

// Get random threat type
export function getRandomThreat(): ThreatType {
  return getRandomItem(threatTypes)
}

// Get threat by ID
export function getThreatById(id: string): ThreatType | undefined {
  return findById(threatTypes, id)
}

// Get threats by category
export function getThreatsByCategory(category: ThreatCategory): ThreatType[] {
  return filterByCategory(threatTypes, category)
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
