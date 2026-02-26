// Protection kits B: vpn-shield, mfa-authenticator, backup-system, social-engineering-defense

export const kitsIntermediate = [
  {
    id: 'vpn-shield', name: 'VPN Shield', protectsAgainst: 'wifi' as const,
    emoji: '🔒', color: '#0088ff',
    description: 'Encrypts your internet traffic on public WiFi networks',
    learningPoints: ['Always use VPN on public WiFi', 'Verify network name with staff (avoid "Free WiFi" traps)', 'Turn off auto-connect to WiFi networks', 'Use HTTPS websites (lock icon in browser)'],
    whatItIs: "A VPN (Virtual Private Network) creates an encrypted tunnel between your device and the internet. All your traffic goes through this secure tunnel, making it impossible for anyone on public WiFi to see what you're doing.",
    whyItMatters: "Public WiFi is completely unencrypted - anyone connected can see everyone else's traffic. Coffee shop WiFi attackers can steal passwords, read emails, and inject malware. VPNs make your traffic look like encrypted garbage to snoopers.",
    howToGetIt: ['Mullvad VPN (€5/month, privacy-focused): mullvad.net', 'ProtonVPN (Free tier available): protonvpn.com', 'Cloudflare WARP (Free, basic protection): 1.1.1.1', 'NordVPN, ExpressVPN (Popular but pricier): ~$10/month'],
    howItWorks: "Your device connects to a VPN server using military-grade encryption. All internet traffic routes through this server, so the coffee shop WiFi only sees encrypted gibberish going to one IP address. The VPN server decrypts and forwards your requests. Your actual destination never sees your real IP or location.",
    realWorldExample: {
      title: 'Firesheep Firefox Extension (2010)',
      description: "A security researcher released a Firefox extension that let anyone on public WiFi steal other users' Facebook, Twitter, and Amazon sessions with one click.",
      impact: "Within weeks, millions of accounts were hijacked at coffee shops and airports. The incident forced Facebook, Twitter, and others to enable HTTPS everywhere. VPN users were unaffected - their traffic was already encrypted."
    },
    stepByStepSetup: [
      { platform: 'ProtonVPN (Free + Privacy-focused)', steps: ['Go to protonvpn.com and create free account', 'Download ProtonVPN app for your device', 'Open app and log in', 'Click "Quick Connect" to connect to fastest server', 'Enable "Kill Switch" in settings (blocks internet if VPN drops)', 'Turn ON "Always-on VPN" so it connects automatically', 'Test: Google "what is my IP" before and after connecting - should be different'] },
      { platform: 'Cloudflare WARP (Easiest for beginners)', steps: ['Install "1.1.1.1" app from App Store or Play Store', 'Open app and tap the big button to connect', "That's it! It works automatically", 'Free tier provides basic encryption for public WiFi', 'Upgrade to WARP+ ($5/month) for faster speeds', 'Pro tip: Use for all public WiFi (airports, hotels, cafes)'] }
    ]
  },
  {
    id: 'mfa-authenticator', name: 'MFA Authenticator', protectsAgainst: 'authentication' as const,
    emoji: '🔑', color: '#ff00ff',
    description: 'Adds a second layer of protection beyond just passwords',
    learningPoints: ['Enable MFA on all important accounts (email, banking, social media)', 'Use authenticator apps (not SMS) - SIM swapping attacks bypass text codes', 'Keep backup codes in a safe place (not on your device)', 'Popular options: Authy, Google Authenticator, Microsoft Authenticator'],
    whatItIs: "Multi-Factor Authentication (MFA) requires two or more pieces of evidence to log in: something you know (password), something you have (phone with authenticator app), and sometimes something you are (fingerprint). Even if hackers steal your password, they can't log in without your second factor.",
    whyItMatters: '99% of automated account takeovers are stopped by MFA. Password breaches happen constantly - LinkedIn had 165M passwords stolen, Yahoo had 3 billion accounts compromised. But attackers cannot do anything with stolen passwords if MFA is enabled.',
    howToGetIt: ['Authy (Multi-device, encrypted backups): authy.com', 'Google Authenticator (Simple, lightweight): Available in app stores', 'Microsoft Authenticator (Push notifications, password manager): microsoft.com/authenticator', 'Hardware keys (Most secure): YubiKey, Google Titan ($25-50)'],
    howItWorks: "When you enable MFA on an account, you scan a QR code with your authenticator app. This syncs a secret key between the website and your phone. Every 30 seconds, the app generates a unique 6-digit code using that secret. Since the secret never leaves your devices, attackers can't get it.",
    realWorldExample: {
      title: 'Twitter Internal Tools Breach (2020)',
      description: 'Hackers compromised Twitter employees through social engineering and took over high-profile accounts including Barack Obama, Elon Musk, Bill Gates, and Apple.',
      impact: "130 accounts hijacked, $120,000 stolen via scam tweets. Accounts with MFA enabled were immune - even with correct passwords, attackers couldn't access them without the second factor."
    },
    stepByStepSetup: [
      { platform: 'Authy (Recommended - has cloud backup)', steps: ['Install Authy app from App Store or Play Store', 'Create account with your phone number and email', 'Set a strong backup password (for encrypted cloud sync)', 'Go to website you want to secure → Security settings', 'Look for "Two-Factor Authentication" or "2FA"', 'Select "Authenticator app" option (NOT SMS)', 'Scan the QR code with Authy', 'Enter the 6-digit code to verify', 'Download and save backup codes somewhere safe', 'Test by logging out and logging back in'] },
      { platform: 'Google Authenticator (Simplest)', steps: ['Install Google Authenticator app', 'Open the app and tap "+" to add account', 'Go to account settings on website → Enable 2FA', 'Select "Authenticator app"', 'Tap "Scan QR code" in Google Authenticator', 'Point camera at QR code on screen', 'Enter the 6-digit code shown to confirm', 'Save backup codes in password manager or written down', 'Enable on: Gmail, banking, social media, work accounts first'] }
    ]
  },
  {
    id: 'backup-system', name: 'Backup System', protectsAgainst: 'data-loss' as const,
    emoji: '💾', color: '#00ccff',
    description: 'Protects your data with the 3-2-1 backup strategy',
    learningPoints: ['Follow 3-2-1 rule: 3 copies, 2 different media types, 1 offsite', 'Automate backups - manual backups get forgotten', 'Test restoring backups regularly', 'Encrypt backups so stolen drives are useless'],
    whatItIs: "A backup system automatically copies your important files to multiple locations using the 3-2-1 strategy: 3 total copies, on 2 different types of storage, with 1 copy offsite (cloud). When ransomware hits or hardware fails, you can restore everything.",
    whyItMatters: "Ransomware attacks happen every 11 seconds and cost victims $20 billion annually. Hard drives fail - 140,000 per week in the US alone. Without backups, your photos, documents, and work are gone forever. With backups, ransomware can't hold you hostage.",
    howToGetIt: ['Cloud backup: Backblaze ($7/month unlimited), iDrive (5TB for $80/year)', 'External drive: Buy 2 drives, rotate them weekly, keep 1 offsite', 'Built-in: Time Machine (Mac), File History (Windows)', 'NAS (Network Attached Storage): Synology, QNAP for advanced users ($200+)'],
    howItWorks: "Backup software monitors your files for changes. When a file is modified, it encrypts a copy and uploads to cloud storage while also copying to local external drives. Versioning keeps multiple snapshots - if ransomware encrypts your files, you restore yesterday's clean backup.",
    realWorldExample: {
      title: 'Colonial Pipeline Ransomware (2021)',
      description: "Hackers deployed ransomware across Colonial Pipeline's systems, encrypting billing and operations data. The company paid $4.4 million ransom.",
      impact: 'Gas stations across the East Coast ran empty. The company had backups but they were old and incomplete. Organizations with proper 3-2-1 backups recover in hours, not weeks, without paying ransoms.'
    },
    stepByStepSetup: [
      { platform: 'Backblaze (Cloud Backup - Easiest)', steps: ['Go to backblaze.com and start free trial', 'Download Backblaze installer for your OS', 'Install and create account', 'Select which folders to back up (or backup everything)', 'Enable encryption with private key (required for privacy)', 'Let initial backup run overnight (can take hours for first backup)', 'Set schedule: Continuous backup when connected to WiFi', 'Test restore: Log into backblaze.com → Browse files → Download test file'] },
      { platform: '3-2-1 Strategy (Complete Protection)', steps: ['Copy 1: Original files on your computer (primary)', 'Copy 2: External USB drive with Time Machine/File History (local)', 'Copy 3: Cloud backup with Backblaze or iDrive (offsite)', "Buy 2 external drives: Keep 1 at home, 1 at work/friend's house", 'Rotate drives monthly: Swap home and offsite drives', 'Set calendar reminder: Test restore quarterly', 'Encrypt all backups (drives and cloud) with strong password'] }
    ]
  },
  {
    id: 'social-engineering-defense', name: 'Social Engineering Defense', protectsAgainst: 'social-engineering' as const,
    emoji: '🎭', color: '#ff6600',
    description: 'Trains you to spot manipulation tactics and social attacks',
    learningPoints: ['Verify requests through a different channel (call back on known number)', 'Watch for urgency and fear tactics ("Your account will be closed!")', 'Never share passwords, codes, or PINs - real companies never ask', 'Be skeptical of unexpected prizes, urgent invoices, or authority figures'],
    whatItIs: "Social engineering is manipulating people into breaking security procedures. It includes pretexting (fake scenarios), baiting (USB drops), phishing (fake emails), vishing (voice calls), and impersonation. Defense training teaches you to recognize these manipulation tactics before falling victim.",
    whyItMatters: "Humans are the weakest link in security. 98% of cyber attacks involve some form of social engineering. Attackers don't need to hack systems when they can trick employees into handing over passwords, clicking malicious links, or wiring money.",
    howToGetIt: ['Training: KnowBe4 Security Awareness (for companies), SANS Security Awareness', 'Practice: Sign up for simulated phishing tests (PhishMe, Cofense)', 'Education: Read "The Art of Deception" by Kevin Mitnick', 'Games: Play social engineering CTFs on platforms like HackTheBox'],
    howItWorks: 'Social engineering training uses simulated attacks to teach recognition. You receive fake phishing emails, pretexting phone calls, and tailgating scenarios. When you fall for one, you get immediate training on what you missed.',
    realWorldExample: {
      title: 'Target Data Breach (2013)',
      description: "Hackers sent a phishing email to Target's HVAC contractor. An employee clicked a malicious link, giving hackers network access. They pivoted from the contractor network into Target's payment systems.",
      impact: '40 million credit cards stolen, 70 million customer records compromised, $18 million settlement, CEO resigned.'
    },
    stepByStepSetup: [
      { platform: 'Personal Awareness (Free)', steps: ['Enable spam filtering in email (Gmail, Outlook do this automatically)', 'Add "External Email" banner rule in work email (IT can enable)', 'Practice verification: If email asks for action, call sender on known number', 'Watch for urgency: "Act now!", "Account suspended", "Verify immediately"', 'Hover over links before clicking to see real destination', 'Never click links in unexpected emails - go directly to website', 'Report phishing: Forward to reportphishing@apwg.org or IT team'] },
      { platform: 'Company Training (For Employers)', steps: ['Sign up for KnowBe4 or similar platform (free trials available)', 'Run baseline phishing test to see who clicks', 'Enroll employees in monthly 5-minute training videos', 'Send simulated phishing monthly - gradually increase difficulty', 'Reward employees who report phishing (positive reinforcement)', 'Track metrics: Click rate should drop below 5% within 6 months', 'Create security champions: Train power users to help coworkers'] }
    ]
  }
]
