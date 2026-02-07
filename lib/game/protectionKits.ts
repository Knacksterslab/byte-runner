// Protection kit system for defending against threats
import type { ThreatCategory } from './threatData'
import { getRandomItem, findById } from './utils'

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
  },
  {
    id: 'badge-tap',
    name: 'Badge Tap',
    protectsAgainst: 'physical-security',
    emoji: '🪪',
    color: '#ffaa33',
    description: 'Controls physical access to secure areas',
    learningPoints: [
      'Never allow tailgating',
      'Challenge unfamiliar people',
      'Badge access is personal',
      'Use visitor escort policies'
    ],
    whatItIs: 'Badge access uses physical credentials to unlock doors and track entry to secure spaces.',
    whyItMatters: 'Physical access bypasses many digital defenses. If an attacker gets inside, they can access devices, documents, and networks.',
    howToGetIt: [
      'Company-issued badge with access control',
      'Visitor badge and escort system',
      'Security awareness training'
    ],
    howItWorks: 'Access control systems verify badge credentials at the door and log entries. Alerts trigger on invalid attempts or unusual access.',
    realWorldExample: {
      title: 'Tailgating in Office Lobbies',
      description: 'Attackers pretend to be delivery staff or hold doors to gain entry.',
      impact: 'Unauthorized entry leads to device theft, planted malware, and document access.'
    },
    stepByStepSetup: [
      {
        platform: 'Office Access',
        steps: [
          'Carry your badge at all times',
          'Do not hold secure doors for strangers',
          'Report lost badges immediately'
        ]
      }
    ]
  },
  {
    id: 'secure-shred',
    name: 'Secure Shred',
    protectsAgainst: 'secure-disposal',
    emoji: '🗑️',
    color: '#cc5555',
    description: 'Destroys sensitive paper and media before disposal',
    learningPoints: [
      'Shred sensitive documents',
      'Use locked disposal bins',
      'Destroy old drives securely',
      'Follow retention policies'
    ],
    whatItIs: 'Secure disposal ensures sensitive information is destroyed before it leaves your control.',
    whyItMatters: 'Trash and recycling are common sources of leaks. A single discarded printout can expose credentials or customer data.',
    howToGetIt: [
      'Cross-cut shredder for paper',
      'Secure bins for pickup',
      'Certified media destruction services'
    ],
    howItWorks: 'Documents are shredded and media is wiped or physically destroyed, making data recovery impractical.',
    realWorldExample: {
      title: 'Dumpster Diving Incidents',
      description: 'Attackers retrieve passwords and invoices from office trash.',
      impact: 'Leaked data leads to account compromise and reputational damage.'
    },
    stepByStepSetup: [
      {
        platform: 'Office Disposal',
        steps: [
          'Place sensitive papers in locked bins',
          'Use cross-cut shredders for immediate disposal',
          'Schedule certified media destruction'
        ]
      }
    ]
  },
  {
    id: 'policy-knowledge',
    name: 'Policy Knowledge',
    protectsAgainst: 'policy',
    emoji: '📘',
    color: '#7766ff',
    description: 'Ensures users follow acceptable use rules',
    learningPoints: [
      'Know the acceptable use policy',
      'Use approved tools only',
      'Avoid sharing accounts',
      'Report policy concerns early'
    ],
    whatItIs: 'Security policies define what is allowed and how to handle data, devices, and access.',
    whyItMatters: 'Policy violations often create the gaps attackers exploit. Clear rules reduce risky behavior.',
    howToGetIt: [
      'Complete required security training',
      'Read the acceptable use policy',
      'Ask IT or security for clarification'
    ],
    howItWorks: 'Policy knowledge helps employees recognize and avoid risky actions like installing unauthorized software or sharing credentials.',
    realWorldExample: {
      title: 'Shadow IT Exposure',
      description: 'Employees use unapproved apps to store company files.',
      impact: 'Data is exposed in tools that lack enterprise security controls.'
    },
    stepByStepSetup: [
      {
        platform: 'Company Policy',
        steps: [
          'Review the acceptable use policy quarterly',
          'Use only approved apps and services',
          'Report violations without delay'
        ]
      }
    ]
  },
  {
    id: 'ethics-reporting',
    name: 'Ethics Reporting',
    protectsAgainst: 'incident-reporting',
    emoji: '📣',
    color: '#ff9900',
    description: 'Promotes fast, correct incident reporting',
    learningPoints: [
      'Report incidents immediately',
      'Use official channels',
      'Provide clear details',
      'Know whistleblower protections'
    ],
    whatItIs: 'Incident reporting channels let employees raise security and ethics concerns safely.',
    whyItMatters: 'Fast reporting reduces damage. Silence or delays allow attacks to spread.',
    howToGetIt: [
      'Security hotline or ticketing system',
      'Anonymous reporting options',
      'Incident response playbooks'
    ],
    howItWorks: 'Reporting channels route incidents to responders, who can contain threats and preserve evidence.',
    realWorldExample: {
      title: 'Delayed Breach Reports',
      description: 'Employees notice suspicious activity but do not report it quickly.',
      impact: 'Attackers remain active longer, increasing losses.'
    },
    stepByStepSetup: [
      {
        platform: 'Incident Reporting',
        steps: [
          'Save the incident hotline and URL',
          'Report immediately with time and details',
          'Follow responder instructions'
        ]
      }
    ]
  },
  {
    id: 'compliance-kit',
    name: 'Compliance Kit',
    protectsAgainst: 'compliance',
    emoji: '⚖️',
    color: '#33aaff',
    description: 'Applies required controls for regulated data',
    learningPoints: [
      'Know which data is regulated',
      'Use approved storage and encryption',
      'Limit access and sharing',
      'Report compliance incidents'
    ],
    whatItIs: 'Compliance controls protect regulated data like PII, PHI, and cardholder information.',
    whyItMatters: 'Noncompliance leads to fines, legal exposure, and loss of customer trust.',
    howToGetIt: [
      'Compliance training and policies',
      'Approved tools for storage and sharing',
      'Regular audits and reviews'
    ],
    howItWorks: 'Compliance tools enforce encryption, access controls, and audit logs to meet regulatory requirements.',
    realWorldExample: {
      title: 'PCI DSS Fines',
      description: 'Card data stored without required controls.',
      impact: 'Costly fines and mandatory remediation programs.'
    },
    stepByStepSetup: [
      {
        platform: 'Compliance Basics',
        steps: [
          'Label regulated data correctly',
          'Use approved systems only',
          'Follow retention and deletion rules'
        ]
      }
    ]
  },
  {
    id: 'remote-work-guard',
    name: 'Remote Work Guard',
    protectsAgainst: 'remote-work',
    emoji: '🏡',
    color: '#55cc99',
    description: 'Hardens home networks and remote access',
    learningPoints: [
      'Secure home routers',
      'Separate work and personal devices',
      'Use VPN for sensitive work',
      'Keep devices updated'
    ],
    whatItIs: 'Remote work security protects devices and networks outside the office.',
    whyItMatters: 'Home networks lack enterprise protections, making them common targets.',
    howToGetIt: [
      'Home router security checklist',
      'Company VPN access',
      'Endpoint protection tools'
    ],
    howItWorks: 'Remote work guard combines secure WiFi, device hardening, and VPN use to reduce exposure.',
    realWorldExample: {
      title: 'Home Network Breach',
      description: 'Weak router password lets attackers intercept traffic.',
      impact: 'Credentials stolen and accounts compromised.'
    },
    stepByStepSetup: [
      {
        platform: 'Home Setup',
        steps: [
          'Change router default password',
          'Enable WPA3 or WPA2',
          'Use a guest network for personal devices'
        ]
      }
    ]
  },
  {
    id: 'waiting-room',
    name: 'Waiting Room',
    protectsAgainst: 'meeting-security',
    emoji: '🛎️',
    color: '#aa77ff',
    description: 'Controls who can join online meetings',
    learningPoints: [
      'Enable waiting rooms or lobbies',
      'Require meeting passwords',
      'Lock meetings once started',
      'Avoid public links'
    ],
    whatItIs: 'Meeting controls limit access to approved participants.',
    whyItMatters: 'Meeting intrusion can expose sensitive discussions and documents.',
    howToGetIt: [
      'Zoom, Teams, or Meet waiting rooms',
      'Unique meeting links',
      'Host controls and locks'
    ],
    howItWorks: 'Hosts approve attendees and restrict access until verified.',
    realWorldExample: {
      title: 'Meeting Bombing',
      description: 'Public links allow unknown users into meetings.',
      impact: 'Disruption, data exposure, and reputational harm.'
    },
    stepByStepSetup: [
      {
        platform: 'Video Meetings',
        steps: [
          'Enable waiting room by default',
          'Require passwords for external attendees',
          'Lock meeting after start'
        ]
      }
    ]
  },
  {
    id: 'travel-vpn',
    name: 'Travel VPN',
    protectsAgainst: 'travel-security',
    emoji: '🧳',
    color: '#00bbff',
    description: 'Protects traffic on hotel and public networks',
    learningPoints: [
      'Use VPN on all travel WiFi',
      'Avoid public kiosks for sensitive tasks',
      'Disable auto-join networks',
      'Use mobile hotspots when possible'
    ],
    whatItIs: 'A travel VPN encrypts traffic when you use untrusted networks.',
    whyItMatters: 'Travel networks are often monitored or spoofed.',
    howToGetIt: [
      'Company VPN client',
      'Reputable consumer VPN',
      'Mobile hotspot backup'
    ],
    howItWorks: 'VPNs create an encrypted tunnel so local networks cannot read your traffic.',
    realWorldExample: {
      title: 'Hotel WiFi Spoofing',
      description: 'Attackers create fake hotel hotspots.',
      impact: 'Credentials are stolen from travelers.'
    },
    stepByStepSetup: [
      {
        platform: 'Travel Setup',
        steps: [
          'Install VPN on all devices',
          'Connect before opening apps',
          'Disable auto-join for unknown networks'
        ]
      }
    ]
  },
  {
    id: 'encryption-kit',
    name: 'Encryption Kit',
    protectsAgainst: 'data-protection',
    emoji: '🔏',
    color: '#00cc66',
    description: 'Encrypts sensitive data at rest and in transit',
    learningPoints: [
      'Use full-disk encryption',
      'Encrypt files before sharing',
      'Protect encryption keys',
      'Use secure file transfer'
    ],
    whatItIs: 'Encryption turns readable data into ciphertext that only authorized users can access.',
    whyItMatters: 'Lost devices or leaked files are useless without decryption keys.',
    howToGetIt: [
      'BitLocker or FileVault',
      'Encrypted file-sharing tools',
      'Key management policies'
    ],
    howItWorks: 'Encryption uses strong algorithms to protect data at rest and in transit. Keys are required to decrypt.',
    realWorldExample: {
      title: 'Lost Laptop Incident',
      description: 'Unencrypted laptop lost during travel.',
      impact: 'Sensitive data exposure and regulatory risk.'
    },
    stepByStepSetup: [
      {
        platform: 'Device Encryption',
        steps: [
          'Enable full-disk encryption',
          'Use strong passwords for keys',
          'Back up recovery keys securely'
        ]
      }
    ]
  },
  {
    id: 'sbom-toolkit',
    name: 'SBOM Toolkit',
    protectsAgainst: 'supply-chain',
    emoji: '📦',
    color: '#ff3366',
    description: 'Tracks and verifies software components',
    learningPoints: [
      'Know your dependencies',
      'Verify update signatures',
      'Scan for known vulnerabilities',
      'Use trusted sources'
    ],
    whatItIs: 'An SBOM lists software components to help detect risky dependencies.',
    whyItMatters: 'Supply chain attacks hide in dependencies and updates.',
    howToGetIt: [
      'SBOM tools like Syft or CycloneDX',
      'Dependency scanning services',
      'Update verification policies'
    ],
    howItWorks: 'SBOM tools inventory packages and check them against vulnerability databases.',
    realWorldExample: {
      title: 'Compromised Dependency',
      description: 'Malicious package published with a similar name.',
      impact: 'Secrets stolen through infected builds.'
    },
    stepByStepSetup: [
      {
        platform: 'Software Supply Chain',
        steps: [
          'Generate SBOMs for builds',
          'Scan for vulnerabilities',
          'Pin and verify dependencies'
        ]
      }
    ]
  },
  {
    id: 'insider-monitor',
    name: 'Insider Monitor',
    protectsAgainst: 'insider-threats',
    emoji: '👁️',
    color: '#ffbb55',
    description: 'Detects risky or abusive internal behavior',
    learningPoints: [
      'Use least privilege access',
      'Audit privileged actions',
      'Monitor data movement',
      'Separate duties'
    ],
    whatItIs: 'Insider monitoring detects unusual access or data movement.',
    whyItMatters: 'Insider incidents can be accidental or malicious and are costly to detect.',
    howToGetIt: [
      'DLP tools and audit logs',
      'Privileged access management',
      'Behavior analytics'
    ],
    howItWorks: 'Monitoring tools flag unusual access patterns and large transfers for review.',
    realWorldExample: {
      title: 'Privilege Abuse Case',
      description: 'Admin accessed data without approval.',
      impact: 'Unauthorized exposure and compliance issues.'
    },
    stepByStepSetup: [
      {
        platform: 'Access Monitoring',
        steps: [
          'Enable audit logs',
          'Review privilege changes',
          'Set alerts for unusual access'
        ]
      }
    ]
  },
  {
    id: 'email-gateway',
    name: 'Email Gateway',
    protectsAgainst: 'email-security',
    emoji: '📧',
    color: '#ff55bb',
    description: 'Filters malicious attachments and spoofed emails',
    learningPoints: [
      'Scan attachments before opening',
      'Verify sender identity',
      'Use DMARC and SPF',
      'Report suspicious emails'
    ],
    whatItIs: 'Email gateways filter malicious content before it reaches users.',
    whyItMatters: 'Email remains the top delivery vector for attacks.',
    howToGetIt: [
      'Gmail and Outlook filtering',
      'Enterprise secure email gateways',
      'Attachment sandboxing tools'
    ],
    howItWorks: 'Gateways scan for malware, spoofing, and risky links and quarantine suspicious messages.',
    realWorldExample: {
      title: 'Malicious Attachment Campaign',
      description: 'Invoice attachments deliver ransomware.',
      impact: 'Encrypted files and business downtime.'
    },
    stepByStepSetup: [
      {
        platform: 'Email Security',
        steps: [
          'Enable advanced email filtering',
          'Block macros by default',
          'Report suspicious messages'
        ]
      }
    ]
  },
  {
    id: 'classification-labeler',
    name: 'Classification Labeler',
    protectsAgainst: 'data-classification',
    emoji: '🏷️',
    color: '#66aa00',
    description: 'Labels data to enforce correct handling',
    learningPoints: [
      'Apply correct labels',
      'Use secure channels for sensitive data',
      'Review sharing permissions',
      'Follow classification policy'
    ],
    whatItIs: 'Classification labels signal how data should be stored and shared.',
    whyItMatters: 'Mislabeling leads to accidental exposure of sensitive data.',
    howToGetIt: [
      'Built-in labels in Microsoft or Google',
      'Data classification policies',
      'Training and tooling'
    ],
    howItWorks: 'Labels trigger policy rules like encryption, access limits, and sharing restrictions.',
    realWorldExample: {
      title: 'Public Sharing Incident',
      description: 'Confidential file shared in a public channel.',
      impact: 'Data exposure and compliance risk.'
    },
    stepByStepSetup: [
      {
        platform: 'Labeling',
        steps: [
          'Choose a classification label',
          'Apply label before sharing',
          'Review access lists'
        ]
      }
    ]
  },
  {
    id: 'privacy-check',
    name: 'Privacy Check',
    protectsAgainst: 'social-media',
    emoji: '🕶️',
    color: '#bb66ff',
    description: 'Audits social posts for risky oversharing',
    learningPoints: [
      'Avoid posting sensitive work info',
      'Disable location tagging',
      'Review followers and visibility',
      'Remove photo metadata'
    ],
    whatItIs: 'Privacy checks help users review social posts before publishing.',
    whyItMatters: 'Public posts are used for reconnaissance and targeted attacks.',
    howToGetIt: [
      'Platform privacy settings',
      'Social media privacy tools',
      'Security awareness training'
    ],
    howItWorks: 'Tools and checklists flag risky content and suggest safer sharing options.',
    realWorldExample: {
      title: 'Oversharing Leads to Phishing',
      description: 'Attackers use public profiles to craft targeted emails.',
      impact: 'Higher success rates for spear phishing.'
    },
    stepByStepSetup: [
      {
        platform: 'Social Profiles',
        steps: [
          'Set profiles to private',
          'Disable location sharing',
          'Review posts before publishing'
        ]
      }
    ]
  },
  {
    id: 'device-control',
    name: 'Device Control',
    protectsAgainst: 'removable-media',
    emoji: '🔌',
    color: '#ff4455',
    description: 'Blocks unsafe USB and removable media',
    learningPoints: [
      'Block unknown USB devices',
      'Disable auto-run features',
      'Encrypt approved removable media',
      'Monitor data transfers'
    ],
    whatItIs: 'Device control prevents unauthorized USB and removable media access.',
    whyItMatters: 'Removable media is a common malware and data exfiltration path.',
    howToGetIt: [
      'Endpoint device control tools',
      'Group policy settings',
      'DLP and logging'
    ],
    howItWorks: 'Policies allow only approved devices and log all transfers.',
    realWorldExample: {
      title: 'USB Data Theft',
      description: 'Sensitive data copied to removable drives.',
      impact: 'Data leaks and legal exposure.'
    },
    stepByStepSetup: [
      {
        platform: 'USB Control',
        steps: [
          'Allow only approved devices',
          'Encrypt removable storage',
          'Alert on large file transfers'
        ]
      }
    ]
  }
]

// Get protection kit by ID
export function getProtectionKitById(id: string): ProtectionKit | undefined {
  return findById(protectionKits, id)
}

// Re-export helper functions from separate module
export { getProtectionKitName, getProtectionKitForThreat, getProtectionKitForCategory } from './protectionKitHelpers'

// Get random protection kit
export function getRandomProtectionKit(): ProtectionKit {
  return getRandomItem(protectionKits)
}
