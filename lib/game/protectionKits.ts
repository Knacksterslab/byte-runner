// Protection kit system for defending against threats

import type { ThreatCategory } from './threatData'

export interface ProtectionKit {
  id: string
  name: string
  protectsAgainst: ThreatCategory
  description: string
  learningPoints: string[]
  emoji: string
  color: string
  // Deep learning content
  whatItIs: string
  whyItMatters: string
  howToGetIt: string[]
  howItWorks: string
  realWorldExample: {
    title: string
    description: string
    impact: string
  }
  stepByStepSetup: {
    platform: string
    steps: string[]
  }[]
}

export const protectionKits: ProtectionKit[] = [
  {
    id: 'password-manager',
    name: 'Password Manager',
    protectsAgainst: 'password',
    emoji: '🔐',
    color: '#00ff00',
    description: 'Generates and stores unique, strong passwords for every account',
    learningPoints: [
      'Use unique passwords for each account',
      'Password length > complexity (aim for 16+ characters)',
      'Enable 2FA/MFA wherever possible',
      'Popular options: Bitwarden, 1Password, LastPass'
    ],
    whatItIs: 'A password manager is a secure vault that stores all your passwords behind one master password. It automatically generates strong, unique passwords for every account and fills them in when you log in.',
    whyItMatters: 'The average person has 100+ online accounts but reuses the same 3-4 passwords. When one site gets breached (happens daily), attackers test those passwords everywhere. Password managers ensure every account has a unique, uncrackable password.',
    howToGetIt: [
      'Bitwarden (Free, open-source): bitwarden.com',
      '1Password ($3/month): 1password.com',
      'Dashlane (Free tier): dashlane.com',
      'Built-in: Chrome/Safari have basic password managers (less secure than dedicated ones)'
    ],
    howItWorks: 'Password managers use military-grade encryption (AES-256) to secure your password vault. The master password never leaves your device. When you visit a website, the manager decrypts only that password locally and auto-fills it. Even if the password manager company is hacked, attackers only get encrypted gibberish.',
    realWorldExample: {
      title: 'LinkedIn Breach (2012)',
      description: '165 million LinkedIn passwords were stolen and posted online. Attackers used these passwords to break into users\' email, banking, and social media accounts.',
      impact: 'Because people reused passwords across sites, one LinkedIn breach led to thousands of secondary breaches. Users with password managers and unique passwords per site were unaffected by the domino effect.'
    },
    stepByStepSetup: [
      {
        platform: 'Bitwarden (Recommended for beginners)',
        steps: [
          'Go to bitwarden.com and click "Get Started"',
          'Create account with a STRONG master password (write it down physically)',
          'Install browser extension from bitwarden.com/download',
          'Install mobile app from App Store/Play Store',
          'Click "Import Data" to transfer existing passwords',
          'Enable 2FA on your Bitwarden account (Settings → Security → Two-step Login)',
          'Start using! When creating accounts, click the Bitwarden icon and "Generate Password"'
        ]
      },
      {
        platform: '1Password (Most user-friendly)',
        steps: [
          'Go to 1password.com and start free trial',
          'Download 1Password app for your device',
          'Create a strong master password and write it down',
          'Install browser extension',
          'Use "Watchtower" feature to find weak/reused passwords',
          'Enable Travel Mode when crossing borders (hides sensitive vaults)',
          'Share passwords securely with family using vaults'
        ]
      }
    ]
  },
  {
    id: 'link-analyzer',
    name: 'Link Analyzer',
    protectsAgainst: 'phishing',
    emoji: '🔗',
    color: '#00ffff',
    description: 'Scans links and emails for phishing indicators before you click',
    learningPoints: [
      'Hover over links to see real URL before clicking',
      'Check sender domain carefully (microsoft.com vs microsoft-verify.net)',
      'Watch for urgent/threatening language',
      'Verify unexpected requests through different channel'
    ],
    whatItIs: 'A link analyzer examines URLs and email content in real-time, checking them against databases of known phishing sites, analyzing domain legitimacy, and flagging suspicious patterns before you click.',
    whyItMatters: 'Phishing is the #1 attack vector for data breaches. 94% of malware is delivered via email. Humans can\'t spot all the tricks - fake domains that look identical, hidden redirects, compromised legitimate sites. Link analyzers catch what your eyes miss.',
    howToGetIt: [
      'Browser extensions: uBlock Origin, Malwarebytes Browser Guard (free)',
      'Email filters: Gmail has built-in protection, Outlook uses Microsoft Defender',
      'Enterprise: Proofpoint, Mimecast, Barracuda for corporate email',
      'Manual check: VirusTotal.com or URLScan.io for suspicious links'
    ],
    howItWorks: 'Link analyzers check URLs against threat intelligence databases with millions of known phishing sites. They analyze domain age (new domains are suspicious), check SSL certificates, look for typosquatting (g00gle.com vs google.com), and scan page content for credential harvesting forms.',
    realWorldExample: {
      title: 'Google Docs Phishing (2017)',
      description: 'A sophisticated phishing attack impersonated Google Docs sharing emails. The email looked perfect - correct sender format, official Google styling. The link went to real Google servers but authorized a malicious app.',
      impact: 'Over 1 million Gmail users affected in under an hour. The attack bypassed email filters because it used legitimate Google infrastructure. Users with link analyzers were warned about the suspicious authorization request.'
    },
    stepByStepSetup: [
      {
        platform: 'Browser Protection (Free)',
        steps: [
          'Install uBlock Origin extension (Chrome/Firefox/Edge)',
          'Go to extension settings → Filter lists',
          'Enable "Malware Domain Blocklist" and "Phishing URL Blocklist"',
          'Install Malwarebytes Browser Guard as second layer',
          'Test: Go to urlhaus.abuse.ch and click any "online" malware URL (safely blocked)',
          'Hover over links before clicking to preview destination'
        ]
      },
      {
        platform: 'Email Protection',
        steps: [
          'Gmail: Ensure "Smart features" are ON in Settings → General',
          'Outlook: Enable Microsoft Defender → Settings → Mail → Advanced',
          'Check sender address carefully (click to expand full email)',
          'Look for warning banners: "External sender" or "Unverified"',
          'For suspicious emails: Click three dots → "Report phishing"',
          'Enable "Show original" to see email headers and verify sender'
        ]
      }
    ]
  },
  {
    id: 'patch-manager',
    name: 'Patch Manager',
    protectsAgainst: 'updates',
    emoji: '🛡️',
    color: '#ffaa00',
    description: 'Automates software updates to close security vulnerabilities',
    learningPoints: [
      'Enable automatic updates on OS and apps',
      'Critical security patches should install within 24 hours',
      'Restart devices after updates to apply patches',
      'Keep all software current, not just operating system'
    ],
    whatItIs: 'A patch manager automatically downloads and installs security updates for your operating system and applications. It\'s like having a security guard who constantly patches holes in your digital walls.',
    whyItMatters: 'Zero-day exploits and unpatched vulnerabilities are how most major breaches happen. When a security flaw is discovered, attackers race to exploit it before you patch it. Automatic updates close these holes within hours instead of weeks.',
    howToGetIt: [
      'Windows: Settings → Windows Update → Turn on automatic updates',
      'Mac: System Preferences → Software Update → Automatically keep my Mac up to date',
      'Linux: Enable unattended-upgrades (Ubuntu/Debian) or dnf-automatic (Fedora)',
      'Enterprise: Use WSUS, SCCM, or Jamf for centralized patch management'
    ],
    howItWorks: 'Patch managers monitor vendor security bulletins, download verified updates, test compatibility, and install patches during scheduled maintenance windows. They roll back failed updates automatically and maintain audit logs for compliance.',
    realWorldExample: {
      title: 'WannaCry Ransomware (2017)',
      description: 'A ransomware worm that infected 200,000+ computers across 150 countries in a single day, including hospitals, governments, and major corporations.',
      impact: 'Microsoft had released a patch 2 months earlier, but unpatched systems were vulnerable. The attack caused $4 billion in damages and crippled UK\'s NHS, forcing hospitals to turn away patients.'
    },
    stepByStepSetup: [
      {
        platform: 'Windows 10/11',
        steps: [
          'Open Settings (Win + I)',
          'Click "Windows Update" in the left sidebar',
          'Click "Advanced options"',
          'Turn ON "Receive updates for other Microsoft products"',
          'Under "Additional options", turn ON "Download updates over metered connections"',
          'Set Active hours to avoid disruption during work'
        ]
      },
      {
        platform: 'macOS',
        steps: [
          'Open System Preferences',
          'Click "Software Update"',
          'Check "Automatically keep my Mac up to date"',
          'Click "Advanced..."',
          'Enable all checkboxes: Check for updates, Download, Install system files, Install app updates, Install security responses',
          'Restart when prompted after updates'
        ]
      }
    ]
  },
  {
    id: 'privacy-optimizer',
    name: 'Privacy Optimizer',
    protectsAgainst: 'privacy',
    emoji: '🕵️',
    color: '#aa00ff',
    description: 'Locks down social media settings and removes tracking metadata',
    learningPoints: [
      'Review privacy settings on all social platforms',
      'Don\'t share location in real-time',
      'Remove photo metadata (EXIF data) before posting',
      'Limit personal information in public profiles'
    ],
    whatItIs: 'Privacy optimization tools audit your social media accounts, lock down public visibility, strip metadata from photos, and alert you when you\'re sharing too much information online.',
    whyItMatters: 'Everything you post online is forever and searchable. Doxing attacks piece together your location, employer, family, and routines from "harmless" posts. Data harvesters build detailed profiles sold to advertisers, insurance companies, and worse.',
    howToGetIt: [
      'Privacy Checkup: Facebook/Instagram/Twitter have built-in privacy wizards',
      'Metadata removal: ExifTool (free), ImageOptim (Mac), or Scrambled Exif (Android)',
      'Social media audit: Jumbo Privacy app (free tier)',
      'Google yourself: See what\'s public about you'
    ],
    howItWorks: 'Privacy tools scan your profiles for publicly visible personal data, check who can see your posts/photos/location, identify weak privacy settings, and recommend changes. Metadata strippers remove GPS coordinates, camera model, and timestamps embedded in photos before you share them.',
    realWorldExample: {
      title: 'Please Rob Me Campaign (2010)',
      description: 'Security researchers created a website that aggregated real-time location check-ins from Twitter/Foursquare, showing exactly when people weren\'t home. It proved how easily social media reveals when homes are empty.',
      impact: 'Burglars were using social media to target homes. One viral case: Thieves tracked a family\'s vacation photos in real-time and robbed them. The campaign led to platforms adding privacy controls for location sharing.'
    },
    stepByStepSetup: [
      {
        platform: 'Instagram/Facebook Privacy',
        steps: [
          'Go to Settings → Privacy',
          'Set account to Private (require approval for followers)',
          'Turn OFF "Location Services" for the app',
          'Disable "Activity Status" so others can\'t see when you\'re online',
          'Review "Apps and Websites" → Remove old connected apps',
          'Set "Story" privacy to "Close Friends" only',
          'Limit profile visibility: Hide email, phone, birthday from public'
        ]
      },
      {
        platform: 'Photo Metadata Removal',
        steps: [
          'iPhone: Settings → Privacy → Location Services → Camera → Never',
          'Or use Scrambled Exif app before posting',
          'Android: Use "Remove metadata" option when sharing photos',
          'Desktop: Use ExifTool command: exiftool -all= photo.jpg',
          'Check metadata: Right-click photo → Properties → Details tab',
          'Before/after: Upload test photo to online EXIF viewer to verify removal'
        ]
      }
    ]
  },
  {
    id: 'vpn-shield',
    name: 'VPN Shield',
    protectsAgainst: 'wifi',
    emoji: '🔒',
    color: '#0088ff',
    description: 'Encrypts your internet traffic on public WiFi networks',
    learningPoints: [
      'Always use VPN on public WiFi',
      'Verify network name with staff (avoid "Free WiFi" traps)',
      'Turn off auto-connect to WiFi networks',
      'Use HTTPS websites (lock icon in browser)'
    ],
    whatItIs: 'A VPN (Virtual Private Network) creates an encrypted tunnel between your device and the internet. All your traffic goes through this secure tunnel, making it impossible for anyone on public WiFi to see what you\'re doing.',
    whyItMatters: 'Public WiFi is completely unencrypted - anyone connected can see everyone else\'s traffic. Coffee shop WiFi attackers can steal passwords, read emails, and inject malware. VPNs make your traffic look like encrypted garbage to snoopers.',
    howToGetIt: [
      'Mullvad VPN (€5/month, privacy-focused): mullvad.net',
      'ProtonVPN (Free tier available): protonvpn.com',
      'Cloudflare WARP (Free, basic protection): 1.1.1.1',
      'NordVPN, ExpressVPN (Popular but pricier): ~$10/month'
    ],
    howItWorks: 'Your device connects to a VPN server using military-grade encryption. All internet traffic routes through this server, so the coffee shop WiFi only sees encrypted gibberish going to one IP address. The VPN server decrypts and forwards your requests. Your actual destination never sees your real IP or location.',
    realWorldExample: {
      title: 'Firesheep Firefox Extension (2010)',
      description: 'A security researcher released a Firefox extension that let anyone on public WiFi steal other users\' Facebook, Twitter, and Amazon sessions with one click. It demonstrated how trivial WiFi attacks were.',
      impact: 'Within weeks, millions of accounts were hijacked at coffee shops and airports. The tool worked because major sites didn\'t encrypt all traffic. The incident forced Facebook, Twitter, and others to enable HTTPS everywhere. But VPN users were unaffected - their traffic was already encrypted.'
    },
    stepByStepSetup: [
      {
        platform: 'ProtonVPN (Free + Privacy-focused)',
        steps: [
          'Go to protonvpn.com and create free account',
          'Download ProtonVPN app for your device',
          'Open app and log in',
          'Click "Quick Connect" to connect to fastest server',
          'Enable "Kill Switch" in settings (blocks internet if VPN drops)',
          'Turn ON "Always-on VPN" so it connects automatically',
          'Test: Google "what is my IP" before and after connecting - should be different'
        ]
      },
      {
        platform: 'Cloudflare WARP (Easiest for beginners)',
        steps: [
          'Install "1.1.1.1" app from App Store or Play Store',
          'Open app and tap the big button to connect',
          'That\'s it! It works automatically',
          'Free tier provides basic encryption for public WiFi',
          'Upgrade to WARP+ ($5/month) for faster speeds',
          'Pro tip: Use for all public WiFi (airports, hotels, cafes)'
        ]
      }
    ]
  },
  {
    id: 'mfa-authenticator',
    name: 'MFA Authenticator',
    protectsAgainst: 'authentication',
    emoji: '🔑',
    color: '#ff00ff',
    description: 'Adds a second layer of protection beyond just passwords',
    learningPoints: [
      'Enable MFA on all important accounts (email, banking, social media)',
      'Use authenticator apps (not SMS) - SIM swapping attacks bypass text codes',
      'Keep backup codes in a safe place (not on your device)',
      'Popular options: Authy, Google Authenticator, Microsoft Authenticator'
    ],
    whatItIs: 'Multi-Factor Authentication (MFA) requires two or more pieces of evidence to log in: something you know (password), something you have (phone with authenticator app), and sometimes something you are (fingerprint). Even if hackers steal your password, they can\'t log in without your second factor.',
    whyItMatters: '99% of automated account takeovers are stopped by MFA. Password breaches happen constantly - LinkedIn had 165M passwords stolen, Yahoo had 3 billion accounts compromised. But attackers can\'t do anything with stolen passwords if MFA is enabled. It\'s the single most effective security control.',
    howToGetIt: [
      'Authy (Multi-device, encrypted backups): authy.com',
      'Google Authenticator (Simple, lightweight): Available in app stores',
      'Microsoft Authenticator (Push notifications, password manager): microsoft.com/authenticator',
      'Hardware keys (Most secure): YubiKey, Google Titan ($25-50)'
    ],
    howItWorks: 'When you enable MFA on an account, you scan a QR code with your authenticator app. This syncs a secret key between the website and your phone. Every 30 seconds, the app generates a unique 6-digit code using that secret. When you log in, you enter your password plus the current code. Since the secret never leaves your devices, attackers can\'t get it.',
    realWorldExample: {
      title: 'Twitter Internal Tools Breach (2020)',
      description: 'Hackers compromised Twitter employees through social engineering and took over high-profile accounts including Barack Obama, Elon Musk, Bill Gates, and Apple. They tweeted bitcoin scams from verified accounts.',
      impact: '130 accounts hijacked, $120,000 stolen via scam tweets, Twitter\'s stock dropped 4%. The breach succeeded because compromised employee accounts lacked MFA. Accounts with MFA enabled were immune - even with correct passwords, attackers couldn\'t access them without the second factor.'
    },
    stepByStepSetup: [
      {
        platform: 'Authy (Recommended - has cloud backup)',
        steps: [
          'Install Authy app from App Store or Play Store',
          'Create account with your phone number and email',
          'Set a strong backup password (for encrypted cloud sync)',
          'Go to website you want to secure → Security settings',
          'Look for "Two-Factor Authentication" or "2FA"',
          'Select "Authenticator app" option (NOT SMS)',
          'Scan the QR code with Authy',
          'Enter the 6-digit code to verify',
          'Download and save backup codes somewhere safe',
          'Test by logging out and logging back in'
        ]
      },
      {
        platform: 'Google Authenticator (Simplest)',
        steps: [
          'Install Google Authenticator app',
          'Open the app and tap "+" to add account',
          'Go to account settings on website → Enable 2FA',
          'Select "Authenticator app"',
          'Tap "Scan QR code" in Google Authenticator',
          'Point camera at QR code on screen',
          'Enter the 6-digit code shown to confirm',
          'Save backup codes in password manager or written down',
          'Enable on: Gmail, banking, social media, work accounts first'
        ]
      }
    ]
  },
  {
    id: 'backup-system',
    name: 'Backup System',
    protectsAgainst: 'data-loss',
    emoji: '💾',
    color: '#00ccff',
    description: 'Protects your data with the 3-2-1 backup strategy',
    learningPoints: [
      'Follow 3-2-1 rule: 3 copies, 2 different media types, 1 offsite',
      'Automate backups - manual backups get forgotten',
      'Test restoring backups regularly',
      'Encrypt backups so stolen drives are useless'
    ],
    whatItIs: 'A backup system automatically copies your important files to multiple locations using the 3-2-1 strategy: 3 total copies of your data, on 2 different types of storage, with 1 copy offsite (cloud). When ransomware hits, hardware fails, or you accidentally delete files, you can restore everything.',
    whyItMatters: 'Ransomware attacks happen every 11 seconds and cost victims $20 billion annually. Hard drives fail - 140,000 per week in the US alone. Accidental deletion happens daily. Without backups, your photos, documents, and work are gone forever. With backups, ransomware can\'t hold you hostage - you just restore and move on.',
    howToGetIt: [
      'Cloud backup: Backblaze ($7/month unlimited), iDrive (5TB for $80/year)',
      'External drive: Buy 2 drives, rotate them weekly, keep 1 offsite',
      'Built-in: Time Machine (Mac), File History (Windows)',
      'NAS (Network Attached Storage): Synology, QNAP for advanced users ($200+)'
    ],
    howItWorks: 'Backup software monitors your files for changes. When a file is modified, it encrypts a copy and uploads to cloud storage while also copying to local external drives. Versioning keeps multiple snapshots - if ransomware encrypts your files, you restore yesterday\'s clean backup. Incremental backups only copy changed files, saving time and storage.',
    realWorldExample: {
      title: 'Colonial Pipeline Ransomware (2021)',
      description: 'Hackers deployed ransomware across Colonial Pipeline\'s systems, encrypting billing and operations data. The company paid $4.4 million ransom to decrypt files, but the attack shut down the largest US fuel pipeline for 6 days.',
      impact: 'Gas stations across the East Coast ran empty. The company had backups but they were old and incomplete. Recovery took weeks. Organizations with proper 3-2-1 backups recover in hours, not weeks, without paying ransoms.'
    },
    stepByStepSetup: [
      {
        platform: 'Backblaze (Cloud Backup - Easiest)',
        steps: [
          'Go to backblaze.com and start free trial',
          'Download Backblaze installer for your OS',
          'Install and create account',
          'Select which folders to back up (or backup everything)',
          'Enable encryption with private key (required for privacy)',
          'Let initial backup run overnight (can take hours for first backup)',
          'Set schedule: Continuous backup when connected to WiFi',
          'Test restore: Log into backblaze.com → Browse files → Download test file'
        ]
      },
      {
        platform: '3-2-1 Strategy (Complete Protection)',
        steps: [
          'Copy 1: Original files on your computer (primary)',
          'Copy 2: External USB drive with Time Machine/File History (local)',
          'Copy 3: Cloud backup with Backblaze or iDrive (offsite)',
          'Buy 2 external drives: Keep 1 at home, 1 at work/friend\'s house',
          'Rotate drives monthly: Swap home and offsite drives',
          'Set calendar reminder: Test restore quarterly',
          'Encrypt all backups (drives and cloud) with strong password'
        ]
      }
    ]
  },
  {
    id: 'social-engineering-defense',
    name: 'Social Engineering Defense',
    protectsAgainst: 'social-engineering',
    emoji: '🎭',
    color: '#ff6600',
    description: 'Trains you to spot manipulation tactics and social attacks',
    learningPoints: [
      'Verify requests through a different channel (call back on known number)',
      'Watch for urgency and fear tactics ("Your account will be closed!")',
      'Never share passwords, codes, or PINs - real companies never ask',
      'Be skeptical of unexpected prizes, urgent invoices, or authority figures'
    ],
    whatItIs: 'Social engineering is manipulating people into breaking security procedures. It includes pretexting (fake scenarios), baiting (USB drops), phishing (fake emails), vishing (voice calls), and impersonation. Defense training teaches you to recognize these manipulation tactics before falling victim.',
    whyItMatters: 'Humans are the weakest link in security. 98% of cyber attacks involve some form of social engineering. Attackers don\'t need to hack systems when they can trick employees into handing over passwords, clicking malicious links, or wiring money. Kevin Mitnick built his hacking career on social engineering - he said it\'s easier to trick people than crack passwords.',
    howToGetIt: [
      'Training: KnowBe4 Security Awareness (for companies), SANS Security Awareness',
      'Practice: Sign up for simulated phishing tests (PhishMe, Cofense)',
      'Education: Read "The Art of Deception" by Kevin Mitnick',
      'Games: Play social engineering CTFs on platforms like HackTheBox'
    ],
    howItWorks: 'Social engineering training uses simulated attacks to teach recognition. You receive fake phishing emails, pretexting phone calls, and tailgating scenarios. When you fall for one, you get immediate training on what you missed. Over time, you build a mental model of red flags: urgent language, authority pressure, requests for sensitive info, too-good-to-be-true offers.',
    realWorldExample: {
      title: 'Target Data Breach (2013)',
      description: 'Hackers sent a phishing email to Target\'s HVAC contractor. An employee clicked a malicious link, giving hackers network access. They pivoted from the contractor network into Target\'s payment systems.',
      impact: '40 million credit cards stolen, 70 million customer records compromised, $18 million settlement, CEO resigned. The breach started with one employee falling for a social engineering attack. Security awareness training could have prevented the entire breach.'
    },
    stepByStepSetup: [
      {
        platform: 'Personal Awareness (Free)',
        steps: [
          'Enable spam filtering in email (Gmail, Outlook do this automatically)',
          'Add "External Email" banner rule in work email (IT can enable)',
          'Practice verification: If email asks for action, call sender on known number',
          'Watch for urgency: "Act now!", "Account suspended", "Verify immediately"',
          'Hover over links before clicking to see real destination',
          'Never click links in unexpected emails - go directly to website',
          'Report phishing: Forward to reportphishing@apwg.org or IT team'
        ]
      },
      {
        platform: 'Company Training (For Employers)',
        steps: [
          'Sign up for KnowBe4 or similar platform (free trials available)',
          'Run baseline phishing test to see who clicks',
          'Enroll employees in monthly 5-minute training videos',
          'Send simulated phishing monthly - gradually increase difficulty',
          'Reward employees who report phishing (positive reinforcement)',
          'Track metrics: Click rate should drop below 5% within 6 months',
          'Create security champions: Train power users to help coworkers'
        ]
      }
    ]
  }
]

// Get protection kit by ID
export function getProtectionKitById(id: string): ProtectionKit | undefined {
  return protectionKits.find(kit => kit.id === id)
}

// Get protection kit for a threat category
export function getProtectionKitForCategory(category: ThreatCategory): ProtectionKit | undefined {
  return protectionKits.find(kit => kit.protectsAgainst === category)
}

// Get protection kit name for display - ALL 8 KITS
export function getProtectionKitName(threatId: string): string {
  const categoryMap: { [key: string]: string } = {
    'weak-password': 'Password Manager',
    'password-reuse': 'Password Manager',
    'phishing-email': 'Link Analyzer',
    'spear-phishing': 'Link Analyzer',
    'zero-day': 'Patch Manager',
    'unpatched-vuln': 'Patch Manager',
    'doxing-attack': 'Privacy Optimizer',
    'data-harvester': 'Privacy Optimizer',
    'evil-twin': 'VPN Shield',
    'credential-stuffing': 'MFA Authenticator',
    'session-hijacking': 'MFA Authenticator',
    'ransomware': 'Backup System',
    'hardware-failure': 'Backup System',
    'pretexting': 'Social Engineering Defense',
    'baiting-attack': 'Social Engineering Defense'
  }
  
  return categoryMap[threatId] || 'Protection Kit'
}

// Get full protection kit object for a threat - ALL 8 KITS
export function getProtectionKitForThreat(threatId: string): ProtectionKit | undefined {
  const kitIdMap: { [key: string]: string } = {
    'weak-password': 'password-manager',
    'password-reuse': 'password-manager',
    'phishing-email': 'link-analyzer',
    'spear-phishing': 'link-analyzer',
    'zero-day': 'patch-manager',
    'unpatched-vuln': 'patch-manager',
    'doxing-attack': 'privacy-optimizer',
    'data-harvester': 'privacy-optimizer',
    'evil-twin': 'vpn-shield',
    'credential-stuffing': 'mfa-authenticator',
    'session-hijacking': 'mfa-authenticator',
    'ransomware': 'backup-system',
    'hardware-failure': 'backup-system',
    'pretexting': 'social-engineering-defense',
    'baiting-attack': 'social-engineering-defense'
  }
  
  const kitId = kitIdMap[threatId]
  return kitId ? getProtectionKitById(kitId) : undefined
}

// Get random protection kit
export function getRandomProtectionKit(): ProtectionKit {
  return protectionKits[Math.floor(Math.random() * protectionKits.length)]
}
