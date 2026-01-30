// Quiz questions for continue-from-checkpoint mechanic
// Each question tests knowledge from the educational content

export interface QuizQuestion {
  id: string
  kitType: 'password-manager' | 'link-analyzer' | 'patch-manager' | 'privacy-optimizer' | 'vpn-shield' | 'mfa-authenticator' | 'backup-system' | 'social-engineering-defense'
  question: string
  options: string[]
  correctAnswer: number // Index of correct answer (0-3)
  explanation: string
}

// Question pool for each protection kit type
export const quizQuestions: QuizQuestion[] = [
  // ===== PASSWORD MANAGER QUESTIONS =====
  {
    id: 'pw-1',
    kitType: 'password-manager',
    question: 'What is the recommended minimum length for a secure password?',
    options: ['8 characters', '12 characters', '16 characters', '20 characters'],
    correctAnswer: 2,
    explanation: 'Experts recommend passwords be at least 16 characters long for maximum security.'
  },
  {
    id: 'pw-2',
    kitType: 'password-manager',
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
    id: 'pw-3',
    kitType: 'password-manager',
    question: 'Which password manager is open source and free?',
    options: ['LastPass', 'Dashlane', 'Bitwarden', 'Norton Password Manager'],
    correctAnswer: 2,
    explanation: 'Bitwarden is a popular open-source password manager that is free for personal use.'
  },
  {
    id: 'pw-4',
    kitType: 'password-manager',
    question: 'Should you use the same password across multiple websites?',
    options: [
      'Yes, it\'s easier to remember',
      'No, each account should have a unique password',
      'Only for unimportant sites',
      'Yes, but add a number at the end'
    ],
    correctAnswer: 1,
    explanation: 'Every account should have a unique password. If one site is breached, your other accounts remain safe.'
  },

  // ===== LINK ANALYZER QUESTIONS =====
  {
    id: 'link-1',
    kitType: 'link-analyzer',
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
    id: 'link-2',
    kitType: 'link-analyzer',
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
    id: 'link-3',
    kitType: 'link-analyzer',
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
    id: 'link-4',
    kitType: 'link-analyzer',
    question: 'Which tool can analyze suspicious URLs for malware?',
    options: ['Microsoft Word', 'VirusTotal', 'Google Docs', 'Instagram'],
    correctAnswer: 1,
    explanation: 'VirusTotal is a free service that scans URLs and files with multiple antivirus engines to detect malware.'
  },

  // ===== PATCH MANAGER QUESTIONS =====
  {
    id: 'patch-1',
    kitType: 'patch-manager',
    question: 'What is a "zero-day" vulnerability?',
    options: [
      'A bug found on day zero of development',
      'A security flaw unknown to the software vendor',
      'A patch that takes zero days to install',
      'A vulnerability that expires in one day'
    ],
    correctAnswer: 1,
    explanation: 'A zero-day is a vulnerability the vendor doesn\'t know about yet (zero days to fix it), making it extremely dangerous.'
  },
  {
    id: 'patch-2',
    kitType: 'patch-manager',
    question: 'How often should you update your operating system and software?',
    options: [
      'Once a year',
      'Only when it stops working',
      'As soon as updates are available',
      'Never, updates break things'
    ],
    correctAnswer: 2,
    explanation: 'Enable automatic updates or install them immediately. Patches fix security vulnerabilities that hackers actively exploit.'
  },
  {
    id: 'patch-3',
    kitType: 'patch-manager',
    question: 'What does a "patch" do?',
    options: [
      'Adds new features to software',
      'Fixes security vulnerabilities and bugs',
      'Makes software slower',
      'Changes the user interface'
    ],
    correctAnswer: 1,
    explanation: 'A patch is an update that fixes security vulnerabilities, bugs, and sometimes adds stability improvements.'
  },
  {
    id: 'patch-4',
    kitType: 'patch-manager',
    question: 'Which Windows tool manages automatic updates?',
    options: ['Microsoft Paint', 'Windows Update', 'Task Manager', 'Control Panel'],
    correctAnswer: 1,
    explanation: 'Windows Update automatically downloads and installs security patches to keep your system secure.'
  },

  // ===== PRIVACY OPTIMIZER QUESTIONS =====
  {
    id: 'privacy-1',
    kitType: 'privacy-optimizer',
    question: 'What is "doxing"?',
    options: [
      'Publishing someone\'s private information online without consent',
      'Creating fake documents',
      'Hacking into databases',
      'Sending spam emails'
    ],
    correctAnswer: 0,
    explanation: 'Doxing is when someone maliciously publishes your private information (address, phone, etc.) online to harass or threaten you.'
  },
  {
    id: 'privacy-2',
    kitType: 'privacy-optimizer',
    question: 'What is EXIF data in photos?',
    options: [
      'The photo\'s color palette',
      'Hidden metadata like GPS location and camera info',
      'The photo\'s file size',
      'The photo\'s resolution'
    ],
    correctAnswer: 1,
    explanation: 'EXIF data is hidden metadata in photos that can reveal your location, device model, and when the photo was taken.'
  },
  {
    id: 'privacy-3',
    kitType: 'privacy-optimizer',
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
    id: 'privacy-4',
    kitType: 'privacy-optimizer',
    question: 'Which tool removes metadata from photos?',
    options: ['Photoshop', 'ExifTool', 'Microsoft Paint', 'Instagram'],
    correctAnswer: 1,
    explanation: 'ExifTool is a free command-line tool that can view and remove EXIF metadata from photos before sharing them.'
  },

  // ===== VPN SHIELD QUESTIONS =====
  {
    id: 'vpn-1',
    kitType: 'vpn-shield',
    question: 'What does VPN stand for?',
    options: [
      'Very Private Network',
      'Virtual Private Network',
      'Verified Protection Network',
      'Visual Privacy Network'
    ],
    correctAnswer: 1,
    explanation: 'VPN stands for Virtual Private Network - it encrypts your internet traffic and hides your real IP address.'
  },
  {
    id: 'vpn-2',
    kitType: 'vpn-shield',
    question: 'What is an "evil twin" WiFi attack?',
    options: [
      'Hacking into your twin\'s computer',
      'A fake WiFi hotspot that steals your data',
      'Two routers with the same name',
      'A virus that duplicates itself'
    ],
    correctAnswer: 1,
    explanation: 'An evil twin is a fake WiFi hotspot with a name similar to a legitimate one. It intercepts all your traffic when you connect.'
  },
  {
    id: 'vpn-3',
    kitType: 'vpn-shield',
    question: 'When should you ALWAYS use a VPN?',
    options: [
      'At home on your secure WiFi',
      'On public WiFi networks (cafes, airports, hotels)',
      'Only when watching Netflix',
      'Never, they\'re not necessary'
    ],
    correctAnswer: 1,
    explanation: 'Always use a VPN on public WiFi. These networks are often unencrypted, allowing attackers to intercept your data.'
  },
  {
    id: 'vpn-4',
    kitType: 'vpn-shield',
    question: 'Which is a reputable VPN provider?',
    options: ['Free VPN Master', 'Mullvad VPN', 'SuperVPN Free', 'Random VPN App'],
    correctAnswer: 1,
    explanation: 'Mullvad is a privacy-focused VPN provider with a strong reputation. Avoid free VPNs - they often sell your data.'
  },

  // ===== MFA AUTHENTICATOR QUESTIONS =====
  {
    id: 'mfa-1',
    kitType: 'mfa-authenticator',
    question: 'What is Multi-Factor Authentication (MFA)?',
    options: [
      'Using multiple passwords for one account',
      'Requiring two or more pieces of evidence to log in',
      'Logging in from multiple devices',
      'Remembering passwords for multiple accounts'
    ],
    correctAnswer: 1,
    explanation: 'MFA requires multiple factors: something you know (password), something you have (phone/authenticator), and sometimes something you are (fingerprint).'
  },
  {
    id: 'mfa-2',
    kitType: 'mfa-authenticator',
    question: 'Why is SMS (text message) 2FA less secure than authenticator apps?',
    options: [
      'Text messages are slower',
      'Authenticator apps are free',
      'SIM swapping attacks can intercept SMS codes',
      'SMS uses too much data'
    ],
    correctAnswer: 2,
    explanation: 'Attackers can port your phone number to their SIM card (SIM swapping) and receive your SMS codes. Authenticator apps are tied to your physical device, not your phone number.'
  },
  {
    id: 'mfa-3',
    kitType: 'mfa-authenticator',
    question: 'What percentage of automated account takeovers are stopped by MFA?',
    options: [
      '50%',
      '75%',
      '99%',
      '100%'
    ],
    correctAnswer: 2,
    explanation: 'Microsoft reports that MFA blocks 99% of automated attacks. Even with stolen passwords, attackers can\'t get past the second factor.'
  },
  {
    id: 'mfa-4',
    kitType: 'mfa-authenticator',
    question: 'Which is the MOST secure type of MFA?',
    options: [
      'SMS text message codes',
      'Email verification codes',
      'Hardware security keys (YubiKey)',
      'Authenticator app codes'
    ],
    correctAnswer: 2,
    explanation: 'Hardware security keys like YubiKey are phishing-resistant and can\'t be intercepted. Authenticator apps are second-best, followed by SMS (least secure).'
  },

  // ===== BACKUP SYSTEM QUESTIONS =====
  {
    id: 'backup-1',
    kitType: 'backup-system',
    question: 'What is the 3-2-1 backup rule?',
    options: [
      'Backup 3 times a day, in 2 locations, for 1 year',
      '3 copies of data, on 2 different media types, 1 offsite',
      '3 folders, 2 hard drives, 1 cloud service',
      'Backup 3 devices, 2 times per week, 1 month retention'
    ],
    correctAnswer: 1,
    explanation: 'The 3-2-1 rule: Keep 3 total copies of your data, on 2 different types of storage (e.g., local drive + cloud), with 1 copy stored offsite.'
  },
  {
    id: 'backup-2',
    kitType: 'backup-system',
    question: 'Why should you keep one backup copy offsite?',
    options: [
      'Offsite storage is cheaper',
      'Protects against fire, flood, theft destroying all local copies',
      'Internet speeds are faster offsite',
      'Required by law'
    ],
    correctAnswer: 1,
    explanation: 'If your home or office burns down, gets flooded, or is burglarized, all local backups are lost. An offsite copy (cloud or at a friend\'s house) survives disasters.'
  },
  {
    id: 'backup-3',
    kitType: 'backup-system',
    question: 'How often should you test restoring from backups?',
    options: [
      'Never - backups always work',
      'Only when you need to restore',
      'At least quarterly (every 3 months)',
      'Once when you first set them up'
    ],
    correctAnswer: 2,
    explanation: 'Untested backups are Schrodinger\'s backups - they might not work! Test restoring files quarterly to ensure your backup system actually works.'
  },
  {
    id: 'backup-4',
    kitType: 'backup-system',
    question: 'What should you do if ransomware encrypts your files?',
    options: [
      'Pay the ransom immediately',
      'Restore from backup and never pay ransom',
      'Try to crack the encryption',
      'Delete all files and start over'
    ],
    correctAnswer: 1,
    explanation: 'Never pay ransoms - it funds more attacks and doesn\'t guarantee file recovery. With proper backups, you just restore your files and move on.'
  },

  // ===== SOCIAL ENGINEERING DEFENSE QUESTIONS =====
  {
    id: 'social-1',
    kitType: 'social-engineering-defense',
    question: 'What is "pretexting" in social engineering?',
    options: [
      'Sending text messages to victims',
      'Creating a fake scenario to manipulate someone',
      'Pre-recording phone calls',
      'Testing security before an attack'
    ],
    correctAnswer: 1,
    explanation: 'Pretexting is when attackers create a believable fake scenario (e.g., "I\'m from IT, need your password to fix an issue") to manipulate victims into breaking security rules.'
  },
  {
    id: 'social-2',
    kitType: 'social-engineering-defense',
    question: 'Someone calls claiming to be your bank and asks for your password. What should you do?',
    options: [
      'Give them your password - they\'re from the bank',
      'Hang up and call your bank directly using the number on your card',
      'Ask them security questions first',
      'Give them a fake password to test if they\'re real'
    ],
    correctAnswer: 1,
    explanation: 'Banks NEVER ask for passwords. Hang up immediately and call your bank using the official number on your card or website, not any number the caller provides.'
  },
  {
    id: 'social-3',
    kitType: 'social-engineering-defense',
    question: 'You find a USB drive in the parking lot. What should you do?',
    options: [
      'Plug it in to see who it belongs to',
      'Keep it and use it for extra storage',
      'Never plug it in - it could contain malware',
      'Plug it in on a friend\'s computer to check it'
    ],
    correctAnswer: 2,
    explanation: 'USB drops are a common attack vector. Plugging in unknown drives can infect your computer with malware. Turn it in to security or throw it away.'
  },
  {
    id: 'social-4',
    kitType: 'social-engineering-defense',
    question: 'Which red flag indicates a social engineering attack?',
    options: [
      'The email is from a known company',
      'Urgent language: "Act now or account will be closed!"',
      'The email has proper grammar',
      'The email is short'
    ],
    correctAnswer: 1,
    explanation: 'Social engineers use urgency and fear to bypass critical thinking. Legitimate companies give you time to respond and don\'t threaten immediate consequences.'
  },
]

// Get random question for a specific kit type
export function getRandomQuizQuestion(kitType: string): QuizQuestion {
  const questionsForKit = quizQuestions.filter(q => q.kitType === kitType)
  const randomIndex = Math.floor(Math.random() * questionsForKit.length)
  return questionsForKit[randomIndex]
}

// Get all questions for a specific kit type
export function getQuestionsForKit(kitType: string): QuizQuestion[] {
  return quizQuestions.filter(q => q.kitType === kitType)
}
