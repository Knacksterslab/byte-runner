// Protection kits A: password-manager, link-analyzer, patch-manager, privacy-optimizer

export const kitsBasic = [
  {
    id: 'password-manager', name: 'Password Manager', protectsAgainst: 'password' as const,
    emoji: '🔐', color: '#00ff00',
    description: 'Generates and stores unique, strong passwords for every account',
    learningPoints: ['Use unique passwords for each account', 'Password length > complexity (aim for 16+ characters)', 'Enable 2FA/MFA wherever possible', 'Popular options: Bitwarden, 1Password, LastPass'],
    whatItIs: 'A password manager is a secure vault that stores all your passwords behind one master password. It automatically generates strong, unique passwords for every account and fills them in when you log in.',
    whyItMatters: 'The average person has 100+ online accounts but reuses the same 3-4 passwords. When one site gets breached (happens daily), attackers test those passwords everywhere. Password managers ensure every account has a unique, uncrackable password.',
    howToGetIt: ['Bitwarden (Free, open-source): bitwarden.com', '1Password ($3/month): 1password.com', 'Dashlane (Free tier): dashlane.com', 'Built-in: Chrome/Safari have basic password managers (less secure than dedicated ones)'],
    howItWorks: 'Password managers use military-grade encryption (AES-256) to secure your password vault. The master password never leaves your device. When you visit a website, the manager decrypts only that password locally and auto-fills it. Even if the password manager company is hacked, attackers only get encrypted gibberish.',
    realWorldExample: {
      title: 'LinkedIn Breach (2012)',
      description: "165 million LinkedIn passwords were stolen and posted online. Attackers used these passwords to break into users' email, banking, and social media accounts.",
      impact: 'Because people reused passwords across sites, one LinkedIn breach led to thousands of secondary breaches. Users with password managers and unique passwords per site were unaffected by the domino effect.'
    },
    stepByStepSetup: [
      { platform: 'Bitwarden (Recommended for beginners)', steps: ['Go to bitwarden.com and click "Get Started"', 'Create account with a STRONG master password (write it down physically)', 'Install browser extension from bitwarden.com/download', 'Install mobile app from App Store/Play Store', 'Click "Import Data" to transfer existing passwords', 'Enable 2FA on your Bitwarden account (Settings → Security → Two-step Login)', 'Start using! When creating accounts, click the Bitwarden icon and "Generate Password"'] },
      { platform: '1Password (Most user-friendly)', steps: ['Go to 1password.com and start free trial', 'Download 1Password app for your device', 'Create a strong master password and write it down', 'Install browser extension', 'Use "Watchtower" feature to find weak/reused passwords', 'Enable Travel Mode when crossing borders (hides sensitive vaults)', 'Share passwords securely with family using vaults'] }
    ]
  },
  {
    id: 'link-analyzer', name: 'Link Analyzer', protectsAgainst: 'phishing' as const,
    emoji: '🔗', color: '#00ffff',
    description: 'Scans links and emails for phishing indicators before you click',
    learningPoints: ['Hover over links to see real URL before clicking', 'Check sender domain carefully (microsoft.com vs microsoft-verify.net)', 'Watch for urgent/threatening language', 'Verify unexpected requests through different channel'],
    whatItIs: "A link analyzer examines URLs and email content in real-time, checking them against databases of known phishing sites, analyzing domain legitimacy, and flagging suspicious patterns before you click.",
    whyItMatters: "Phishing is the #1 attack vector for data breaches. 94% of malware is delivered via email. Humans can't spot all the tricks - fake domains that look identical, hidden redirects, compromised legitimate sites. Link analyzers catch what your eyes miss.",
    howToGetIt: ['Browser extensions: uBlock Origin, Malwarebytes Browser Guard (free)', 'Email filters: Gmail has built-in protection, Outlook uses Microsoft Defender', 'Enterprise: Proofpoint, Mimecast, Barracuda for corporate email', 'Manual check: VirusTotal.com or URLScan.io for suspicious links'],
    howItWorks: 'Link analyzers check URLs against threat intelligence databases with millions of known phishing sites. They analyze domain age (new domains are suspicious), check SSL certificates, look for typosquatting (g00gle.com vs google.com), and scan page content for credential harvesting forms.',
    realWorldExample: {
      title: 'Google Docs Phishing (2017)',
      description: 'A sophisticated phishing attack impersonated Google Docs sharing emails. The email looked perfect - correct sender format, official Google styling. The link went to real Google servers but authorized a malicious app.',
      impact: 'Over 1 million Gmail users affected in under an hour. The attack bypassed email filters because it used legitimate Google infrastructure. Users with link analyzers were warned about the suspicious authorization request.'
    },
    stepByStepSetup: [
      { platform: 'Browser Protection (Free)', steps: ['Install uBlock Origin extension (Chrome/Firefox/Edge)', 'Go to extension settings → Filter lists', 'Enable "Malware Domain Blocklist" and "Phishing URL Blocklist"', 'Install Malwarebytes Browser Guard as second layer', 'Test: Go to urlhaus.abuse.ch and click any "online" malware URL (safely blocked)', 'Hover over links before clicking to preview destination'] },
      { platform: 'Email Protection', steps: ['Gmail: Ensure "Smart features" are ON in Settings → General', 'Outlook: Enable Microsoft Defender → Settings → Mail → Advanced', 'Check sender address carefully (click to expand full email)', 'Look for warning banners: "External sender" or "Unverified"', 'For suspicious emails: Click three dots → "Report phishing"', 'Enable "Show original" to see email headers and verify sender'] }
    ]
  },
  {
    id: 'patch-manager', name: 'Patch Manager', protectsAgainst: 'updates' as const,
    emoji: '🛡️', color: '#ffaa00',
    description: 'Automates software updates to close security vulnerabilities',
    learningPoints: ['Enable automatic updates on OS and apps', 'Critical security patches should install within 24 hours', 'Restart devices after updates to apply patches', 'Keep all software current, not just operating system'],
    whatItIs: "A patch manager automatically downloads and installs security updates for your operating system and applications. It's like having a security guard who constantly patches holes in your digital walls.",
    whyItMatters: 'Zero-day exploits and unpatched vulnerabilities are how most major breaches happen. When a security flaw is discovered, attackers race to exploit it before you patch it. Automatic updates close these holes within hours instead of weeks.',
    howToGetIt: ['Windows: Settings → Windows Update → Turn on automatic updates', 'Mac: System Preferences → Software Update → Automatically keep my Mac up to date', 'Linux: Enable unattended-upgrades (Ubuntu/Debian) or dnf-automatic (Fedora)', 'Enterprise: Use WSUS, SCCM, or Jamf for centralized patch management'],
    howItWorks: 'Patch managers monitor vendor security bulletins, download verified updates, test compatibility, and install patches during scheduled maintenance windows. They roll back failed updates automatically and maintain audit logs for compliance.',
    realWorldExample: {
      title: 'WannaCry Ransomware (2017)',
      description: 'A ransomware worm that infected 200,000+ computers across 150 countries in a single day, including hospitals, governments, and major corporations.',
      impact: "Microsoft had released a patch 2 months earlier, but unpatched systems were vulnerable. The attack caused $4 billion in damages and crippled UK's NHS, forcing hospitals to turn away patients."
    },
    stepByStepSetup: [
      { platform: 'Windows 10/11', steps: ['Open Settings (Win + I)', 'Click "Windows Update" in the left sidebar', 'Click "Advanced options"', 'Turn ON "Receive updates for other Microsoft products"', 'Under "Additional options", turn ON "Download updates over metered connections"', 'Set Active hours to avoid disruption during work'] },
      { platform: 'macOS', steps: ['Open System Preferences', 'Click "Software Update"', 'Check "Automatically keep my Mac up to date"', 'Click "Advanced..."', 'Enable all checkboxes: Check for updates, Download, Install system files, Install app updates, Install security responses', 'Restart when prompted after updates'] }
    ]
  },
  {
    id: 'privacy-optimizer', name: 'Privacy Optimizer', protectsAgainst: 'privacy' as const,
    emoji: '🕵️', color: '#aa00ff',
    description: 'Locks down social media settings and removes tracking metadata',
    learningPoints: ["Review privacy settings on all social platforms", "Don't share location in real-time", 'Remove photo metadata (EXIF data) before posting', 'Limit personal information in public profiles'],
    whatItIs: "Privacy optimization tools audit your social media accounts, lock down public visibility, strip metadata from photos, and alert you when you're sharing too much information online.",
    whyItMatters: 'Everything you post online is forever and searchable. Doxing attacks piece together your location, employer, family, and routines from "harmless" posts. Data harvesters build detailed profiles sold to advertisers, insurance companies, and worse.',
    howToGetIt: ['Privacy Checkup: Facebook/Instagram/Twitter have built-in privacy wizards', 'Metadata removal: ExifTool (free), ImageOptim (Mac), or Scrambled Exif (Android)', 'Social media audit: Jumbo Privacy app (free tier)', "Google yourself: See what's public about you"],
    howItWorks: "Privacy tools scan your profiles for publicly visible personal data, check who can see your posts/photos/location, identify weak privacy settings, and recommend changes. Metadata strippers remove GPS coordinates, camera model, and timestamps embedded in photos before you share them.",
    realWorldExample: {
      title: 'Please Rob Me Campaign (2010)',
      description: "Security researchers created a website that aggregated real-time location check-ins from Twitter/Foursquare, showing exactly when people weren't home. It proved how easily social media reveals when homes are empty.",
      impact: "Burglars were using social media to target homes. One viral case: Thieves tracked a family's vacation photos in real-time and robbed them. The campaign led to platforms adding privacy controls for location sharing."
    },
    stepByStepSetup: [
      { platform: 'Instagram/Facebook Privacy', steps: ['Go to Settings → Privacy', 'Set account to Private (require approval for followers)', 'Turn OFF "Location Services" for the app', "Disable \"Activity Status\" so others can't see when you're online", 'Review "Apps and Websites" → Remove old connected apps', 'Set "Story" privacy to "Close Friends" only', 'Limit profile visibility: Hide email, phone, birthday from public'] },
      { platform: 'Photo Metadata Removal', steps: ['iPhone: Settings → Privacy → Location Services → Camera → Never', 'Or use Scrambled Exif app before posting', 'Android: Use "Remove metadata" option when sharing photos', 'Desktop: Use ExifTool command: exiftool -all= photo.jpg', 'Check metadata: Right-click photo → Properties → Details tab', 'Before/after: Upload test photo to online EXIF viewer to verify removal'] }
    ]
  }
]
