// Quiz questions part A: password-manager, link-analyzer, patch-manager, privacy-optimizer, vpn-shield

export const quizQuestionsA = [
  // ===== PASSWORD MANAGER QUESTIONS =====
  {
    id: 'pw-1', kitType: 'password-manager' as const,
    question: 'What is the recommended minimum length for a secure password?',
    options: ['8 characters', '12 characters', '16 characters', '20 characters'],
    correctAnswer: 2,
    explanation: 'Experts recommend passwords be at least 16 characters long for maximum security.'
  },
  {
    id: 'pw-2', kitType: 'password-manager' as const,
    question: 'What is "credential stuffing"?',
    options: [
      'Creating very long passwords',
      'Using leaked passwords from one site to hack other accounts',
      'Storing passwords in a text file',
      'Sharing passwords with team members'
    ],
    correctAnswer: 1,
    explanation: 'Credential stuffing is when attackers use leaked username/password pairs from one breach to try logging into other sites.'
  },
  {
    id: 'pw-3', kitType: 'password-manager' as const,
    question: 'Which password manager is open source and free?',
    options: ['LastPass', 'Dashlane', 'Bitwarden', 'Norton Password Manager'],
    correctAnswer: 2,
    explanation: 'Bitwarden is a popular open-source password manager that is free for personal use.'
  },
  {
    id: 'pw-4', kitType: 'password-manager' as const,
    question: 'Should you use the same password across multiple websites?',
    options: [
      "Yes, it's easier to remember",
      'No, each account should have a unique password',
      'Only for unimportant sites',
      'Yes, but add a number at the end'
    ],
    correctAnswer: 1,
    explanation: 'Every account should have a unique password. If one site is breached, your other accounts remain safe.'
  },

  // ===== LINK ANALYZER QUESTIONS =====
  {
    id: 'link-1', kitType: 'link-analyzer' as const,
    question: 'What is "phishing"?',
    options: [
      'Sending emails to friends',
      'Tricking people into revealing sensitive info via fake messages',
      'Fishing for compliments online',
      'Creating fake social media profiles'
    ],
    correctAnswer: 1,
    explanation: 'Phishing is a social engineering attack where attackers send fake messages to trick victims into revealing passwords, credit cards, or other sensitive data.'
  },
  {
    id: 'link-2', kitType: 'link-analyzer' as const,
    question: 'What should you do before clicking a suspicious link?',
    options: [
      'Click it to see where it goes',
      'Hover over it to preview the URL',
      'Forward it to a friend',
      'Ignore it and delete immediately'
    ],
    correctAnswer: 1,
    explanation: 'Always hover over links to preview the actual URL before clicking. This reveals if the link goes to a legitimate or fake site.'
  },
  {
    id: 'link-3', kitType: 'link-analyzer' as const,
    question: 'What is "typosquatting"?',
    options: [
      'Making typos in emails',
      'Registering domains with common misspellings to trick users',
      'Squatting in front of your computer',
      'Using auto-correct'
    ],
    correctAnswer: 1,
    explanation: 'Typosquatting is when attackers register domain names similar to popular sites (like "gooogle.com") to catch people who mistype URLs.'
  },
  {
    id: 'link-4', kitType: 'link-analyzer' as const,
    question: 'Which tool can analyze suspicious URLs for malware?',
    options: ['Microsoft Word', 'VirusTotal', 'Google Docs', 'Instagram'],
    correctAnswer: 1,
    explanation: 'VirusTotal is a free service that scans URLs and files with multiple antivirus engines to detect malware.'
  },

  // ===== PATCH MANAGER QUESTIONS =====
  {
    id: 'patch-1', kitType: 'patch-manager' as const,
    question: 'What is a "zero-day" vulnerability?',
    options: [
      'A bug found on day zero of development',
      'A security flaw unknown to the software vendor',
      'A patch that takes zero days to install',
      'A vulnerability that expires in one day'
    ],
    correctAnswer: 1,
    explanation: "A zero-day is a vulnerability the vendor doesn't know about yet (zero days to fix it), making it extremely dangerous."
  },
  {
    id: 'patch-2', kitType: 'patch-manager' as const,
    question: 'How often should you update your operating system and software?',
    options: ['Once a year', 'Only when it stops working', 'As soon as updates are available', 'Never, updates break things'],
    correctAnswer: 2,
    explanation: 'Enable automatic updates or install them immediately. Patches fix security vulnerabilities that hackers actively exploit.'
  },
  {
    id: 'patch-3', kitType: 'patch-manager' as const,
    question: 'What does a "patch" do?',
    options: ['Adds new features to software', 'Fixes security vulnerabilities and bugs', 'Makes software slower', 'Changes the user interface'],
    correctAnswer: 1,
    explanation: 'A patch is an update that fixes security vulnerabilities, bugs, and sometimes adds stability improvements.'
  },
  {
    id: 'patch-4', kitType: 'patch-manager' as const,
    question: 'Which Windows tool manages automatic updates?',
    options: ['Microsoft Paint', 'Windows Update', 'Task Manager', 'Control Panel'],
    correctAnswer: 1,
    explanation: 'Windows Update automatically downloads and installs security patches to keep your system secure.'
  },

  // ===== PRIVACY OPTIMIZER QUESTIONS =====
  {
    id: 'privacy-1', kitType: 'privacy-optimizer' as const,
    question: 'What is "doxing"?',
    options: [
      "Publishing someone's private information online without consent",
      'Creating fake documents',
      'Hacking into databases',
      'Sending spam emails'
    ],
    correctAnswer: 0,
    explanation: "Doxing is when someone maliciously publishes your private information (address, phone, etc.) online to harass or threaten you."
  },
  {
    id: 'privacy-2', kitType: 'privacy-optimizer' as const,
    question: 'What is EXIF data in photos?',
    options: [
      "The photo's color palette",
      'Hidden metadata like GPS location and camera info',
      "The photo's file size",
      "The photo's resolution"
    ],
    correctAnswer: 1,
    explanation: 'EXIF data is hidden metadata in photos that can reveal your location, device model, and when the photo was taken.'
  },
  {
    id: 'privacy-3', kitType: 'privacy-optimizer' as const,
    question: 'Why should you lock down social media privacy settings?',
    options: [
      'To make your profile look cooler',
      'To prevent strangers from harvesting your personal data',
      'To get more followers',
      'Social media companies require it'
    ],
    correctAnswer: 1,
    explanation: 'Strict privacy settings prevent strangers, scammers, and data brokers from collecting your personal information.'
  },
  {
    id: 'privacy-4', kitType: 'privacy-optimizer' as const,
    question: 'Which tool removes metadata from photos?',
    options: ['Photoshop', 'ExifTool', 'Microsoft Paint', 'Instagram'],
    correctAnswer: 1,
    explanation: 'ExifTool is a free command-line tool that can view and remove EXIF metadata from photos before sharing them.'
  },

  // ===== VPN SHIELD QUESTIONS =====
  {
    id: 'vpn-1', kitType: 'vpn-shield' as const,
    question: 'What does VPN stand for?',
    options: ['Very Private Network', 'Virtual Private Network', 'Verified Protection Network', 'Visual Privacy Network'],
    correctAnswer: 1,
    explanation: 'VPN stands for Virtual Private Network - it encrypts your internet traffic and hides your real IP address.'
  },
  {
    id: 'vpn-2', kitType: 'vpn-shield' as const,
    question: 'What is an "evil twin" WiFi attack?',
    options: [
      "Hacking into your twin's computer",
      'A fake WiFi hotspot that steals your data',
      'Two routers with the same name',
      'A virus that duplicates itself'
    ],
    correctAnswer: 1,
    explanation: 'An evil twin is a fake WiFi hotspot with a name similar to a legitimate one. It intercepts all your traffic when you connect.'
  },
  {
    id: 'vpn-3', kitType: 'vpn-shield' as const,
    question: 'When should you ALWAYS use a VPN?',
    options: [
      'At home on your secure WiFi',
      'On public WiFi networks (cafes, airports, hotels)',
      'Only when watching Netflix',
      "Never, they're not necessary"
    ],
    correctAnswer: 1,
    explanation: 'Always use a VPN on public WiFi. These networks are often unencrypted, allowing attackers to intercept your data.'
  },
  {
    id: 'vpn-4', kitType: 'vpn-shield' as const,
    question: 'Which is a reputable VPN provider?',
    options: ['Free VPN Master', 'Mullvad VPN', 'SuperVPN Free', 'Random VPN App'],
    correctAnswer: 1,
    explanation: 'Mullvad is a privacy-focused VPN provider with a strong reputation. Avoid free VPNs - they often sell your data.'
  }
]
