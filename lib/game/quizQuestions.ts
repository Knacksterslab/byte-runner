// Quiz questions for continue-from-checkpoint mechanic
// Each question tests knowledge from the educational content
import { getRandomByFilter, filterByCategory } from './utils'

export interface QuizQuestion {
  id: string
  kitType:
    | 'password-manager'
    | 'link-analyzer'
    | 'patch-manager'
    | 'privacy-optimizer'
    | 'vpn-shield'
    | 'mfa-authenticator'
    | 'backup-system'
    | 'social-engineering-defense'
    | 'badge-tap'
    | 'secure-shred'
    | 'policy-knowledge'
    | 'ethics-reporting'
    | 'compliance-kit'
    | 'remote-work-guard'
    | 'waiting-room'
    | 'travel-vpn'
    | 'encryption-kit'
    | 'sbom-toolkit'
    | 'insider-monitor'
    | 'email-gateway'
    | 'classification-labeler'
    | 'privacy-check'
    | 'device-control'
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

  // ===== BADGE TAP QUESTIONS =====
  {
    id: 'badge-1',
    kitType: 'badge-tap',
    question: 'What should you do if someone tries to tailgate into a secure area?',
    options: [
      'Hold the door for them',
      'Ask them to badge in or get security',
      'Ignore them and walk away',
      'Let them in if they look friendly'
    ],
    correctAnswer: 1,
    explanation: 'Tailgating is a common physical security risk. Everyone must badge in or be escorted.'
  },
  {
    id: 'badge-2',
    kitType: 'badge-tap',
    question: 'What is the safest action when leaving your desk?',
    options: [
      'Leave your screen on',
      'Lock your workstation',
      'Minimize windows',
      'Close your email'
    ],
    correctAnswer: 1,
    explanation: 'Locking your workstation prevents unauthorized access when you step away.'
  },

  // ===== SECURE SHRED QUESTIONS =====
  {
    id: 'shred-1',
    kitType: 'secure-shred',
    question: 'How should you dispose of documents with sensitive data?',
    options: [
      'Recycle them immediately',
      'Shred or use secure disposal bins',
      'Throw them in the trash',
      'Give them to a coworker'
    ],
    correctAnswer: 1,
    explanation: 'Sensitive documents should be shredded or placed in secure disposal bins.'
  },
  {
    id: 'shred-2',
    kitType: 'secure-shred',
    question: 'What is dumpster diving?',
    options: [
      'Backing up data to the cloud',
      'Searching trash for sensitive information',
      'Organizing files for storage',
      'Cleaning old devices'
    ],
    correctAnswer: 1,
    explanation: 'Attackers retrieve sensitive information from trash if it is not destroyed.'
  },

  // ===== POLICY KNOWLEDGE QUESTIONS =====
  {
    id: 'policy-1',
    kitType: 'policy-knowledge',
    question: 'What is a common example of a policy violation?',
    options: [
      'Using approved software',
      'Sharing your password with a coworker',
      'Locking your screen',
      'Using MFA'
    ],
    correctAnswer: 1,
    explanation: 'Sharing passwords violates acceptable use and access policies.'
  },
  {
    id: 'policy-2',
    kitType: 'policy-knowledge',
    question: 'Why is shadow IT risky?',
    options: [
      'It saves money on licenses',
      'It uses unapproved tools without security controls',
      'It speeds up updates',
      'It improves compliance'
    ],
    correctAnswer: 1,
    explanation: 'Unapproved tools often lack required security and auditing.'
  },

  // ===== ETHICS REPORTING QUESTIONS =====
  {
    id: 'report-1',
    kitType: 'ethics-reporting',
    question: 'What should you do if you suspect a security incident?',
    options: [
      'Wait to see if it resolves',
      'Report immediately through official channels',
      'Post it in a public chat',
      'Investigate on your own'
    ],
    correctAnswer: 1,
    explanation: 'Fast reporting reduces damage and helps responders act quickly.'
  },
  {
    id: 'report-2',
    kitType: 'ethics-reporting',
    question: 'Which detail is MOST helpful in an incident report?',
    options: [
      'Your favorite app',
      'Time and description of what happened',
      'A guess of who caused it',
      'A meme screenshot'
    ],
    correctAnswer: 1,
    explanation: 'Time, impact, and clear description help responders act fast.'
  },

  // ===== COMPLIANCE KIT QUESTIONS =====
  {
    id: 'comp-1',
    kitType: 'compliance-kit',
    question: 'What is PCI-DSS concerned with?',
    options: [
      'Employee attendance',
      'Payment card data security',
      'Building access',
      'Video meetings'
    ],
    correctAnswer: 1,
    explanation: 'PCI-DSS defines controls for payment card data security.'
  },
  {
    id: 'comp-2',
    kitType: 'compliance-kit',
    question: 'What is one key GDPR requirement?',
    options: [
      'Store all data forever',
      'Collect only necessary personal data',
      'Share data publicly',
      'Disable encryption'
    ],
    correctAnswer: 1,
    explanation: 'GDPR requires data minimization and lawful processing.'
  },

  // ===== REMOTE WORK GUARD QUESTIONS =====
  {
    id: 'remote-1',
    kitType: 'remote-work-guard',
    question: 'What should you do to secure a home router?',
    options: [
      'Keep default password',
      'Change the default password and update firmware',
      'Disable encryption',
      'Share the password publicly'
    ],
    correctAnswer: 1,
    explanation: 'Changing default credentials and updating firmware reduce risk.'
  },
  {
    id: 'remote-2',
    kitType: 'remote-work-guard',
    question: 'What is the best way to separate work and personal devices?',
    options: [
      'Use the same WiFi for everything',
      'Use a guest network for personal devices',
      'Disable firewall',
      'Share files between devices freely'
    ],
    correctAnswer: 1,
    explanation: 'Guest networks isolate personal devices from work systems.'
  },

  // ===== WAITING ROOM QUESTIONS =====
  {
    id: 'meet-1',
    kitType: 'waiting-room',
    question: 'What prevents uninvited people from joining a meeting?',
    options: [
      'Posting the link publicly',
      'Waiting rooms and meeting passwords',
      'Disabling video',
      'Using any random meeting ID'
    ],
    correctAnswer: 1,
    explanation: 'Waiting rooms and passwords let hosts approve attendees.'
  },
  {
    id: 'meet-2',
    kitType: 'waiting-room',
    question: 'When should you lock a meeting?',
    options: [
      'Never',
      'After all expected participants join',
      'Before the meeting starts',
      'Only after a problem occurs'
    ],
    correctAnswer: 1,
    explanation: 'Locking the meeting prevents new, unexpected attendees.'
  },

  // ===== TRAVEL VPN QUESTIONS =====
  {
    id: 'travel-1',
    kitType: 'travel-vpn',
    question: 'What is the safest option on hotel WiFi?',
    options: [
      'Connect without protection',
      'Use a VPN for all traffic',
      'Turn off encryption',
      'Share passwords over email'
    ],
    correctAnswer: 1,
    explanation: 'VPNs encrypt traffic on untrusted networks.'
  },
  {
    id: 'travel-2',
    kitType: 'travel-vpn',
    question: 'What is risky about public kiosks?',
    options: [
      'They are too fast',
      'They may capture credentials',
      'They use wired networks',
      'They require a mouse'
    ],
    correctAnswer: 1,
    explanation: 'Public kiosks can have keyloggers or malware.'
  },

  // ===== ENCRYPTION KIT QUESTIONS =====
  {
    id: 'enc-1',
    kitType: 'encryption-kit',
    question: 'Why encrypt sensitive files?',
    options: [
      'To make them larger',
      'To prevent unauthorized access if leaked',
      'To remove backups',
      'To make sharing public'
    ],
    correctAnswer: 1,
    explanation: 'Encryption protects data if devices or files are lost.'
  },
  {
    id: 'enc-2',
    kitType: 'encryption-kit',
    question: 'What is full-disk encryption used for?',
    options: [
      'Speeding up computers',
      'Protecting data on a device if it is lost or stolen',
      'Removing malware',
      'Backing up files'
    ],
    correctAnswer: 1,
    explanation: 'Full-disk encryption protects all data stored on the device.'
  },

  // ===== SBOM TOOLKIT QUESTIONS =====
  {
    id: 'sbom-1',
    kitType: 'sbom-toolkit',
    question: 'What does SBOM stand for?',
    options: [
      'Secure Backup of Memory',
      'Software Bill of Materials',
      'System Backup Operational Manual',
      'Standard Browser of Modules'
    ],
    correctAnswer: 1,
    explanation: 'SBOM means Software Bill of Materials, listing components in software.'
  },
  {
    id: 'sbom-2',
    kitType: 'sbom-toolkit',
    question: 'Why are supply chain attacks dangerous?',
    options: [
      'They only affect printers',
      'They hide in trusted updates and dependencies',
      'They are easy to detect',
      'They only happen offline'
    ],
    correctAnswer: 1,
    explanation: 'Supply chain attacks exploit trusted software sources.'
  },

  // ===== INSIDER MONITOR QUESTIONS =====
  {
    id: 'insider-1',
    kitType: 'insider-monitor',
    question: 'What is least privilege?',
    options: [
      'Giving everyone admin rights',
      'Giving users only the access they need',
      'Sharing passwords to save time',
      'Allowing all file downloads'
    ],
    correctAnswer: 1,
    explanation: 'Least privilege limits access to reduce risk.'
  },
  {
    id: 'insider-2',
    kitType: 'insider-monitor',
    question: 'What can indicate data exfiltration?',
    options: [
      'Small, regular uploads',
      'Large, unusual file transfers',
      'Normal login times',
      'Updated antivirus'
    ],
    correctAnswer: 1,
    explanation: 'Large or unusual transfers may signal data exfiltration.'
  },

  // ===== EMAIL GATEWAY QUESTIONS =====
  {
    id: 'email-1b',
    kitType: 'email-gateway',
    question: 'What should you do with unexpected attachments?',
    options: [
      'Open immediately',
      'Scan or verify before opening',
      'Forward to everyone',
      'Upload to social media'
    ],
    correctAnswer: 1,
    explanation: 'Unexpected attachments should be verified or scanned first.'
  },
  {
    id: 'email-2b',
    kitType: 'email-gateway',
    question: 'What is Business Email Compromise (BEC)?',
    options: [
      'A slow internet connection',
      'Fraudulent emails that impersonate executives',
      'A broken email server',
      'A password manager feature'
    ],
    correctAnswer: 1,
    explanation: 'BEC scams impersonate trusted executives to trick employees.'
  },

  // ===== CLASSIFICATION LABELER QUESTIONS =====
  {
    id: 'class-1b',
    kitType: 'classification-labeler',
    question: 'Why apply data classification labels?',
    options: [
      'To make files larger',
      'To control how data is shared and stored',
      'To remove backups',
      'To delete files'
    ],
    correctAnswer: 1,
    explanation: 'Labels enforce the right handling and sharing rules.'
  },
  {
    id: 'class-2b',
    kitType: 'classification-labeler',
    question: 'What is a common result of misclassification?',
    options: [
      'Better security',
      'Sensitive data shared publicly',
      'Faster backups',
      'Lower risk'
    ],
    correctAnswer: 1,
    explanation: 'Misclassification can expose confidential data.'
  },

  // ===== PRIVACY CHECK QUESTIONS =====
  {
    id: 'social-1b',
    kitType: 'privacy-check',
    question: 'What should you avoid posting about work?',
    options: [
      'Public event announcements',
      'Sensitive internal details',
      'Company logos on approved media',
      'General marketing posts'
    ],
    correctAnswer: 1,
    explanation: 'Sensitive internal details can help attackers.'
  },
  {
    id: 'social-2b',
    kitType: 'privacy-check',
    question: 'Why disable location tagging?',
    options: [
      'It speeds up the app',
      'It reveals your real-time location',
      'It improves image quality',
      'It reduces storage'
    ],
    correctAnswer: 1,
    explanation: 'Location tags can expose travel and routines.'
  },

  // ===== DEVICE CONTROL QUESTIONS =====
  {
    id: 'usb-1b',
    kitType: 'device-control',
    question: 'What is the safest action with an unknown USB drive?',
    options: [
      'Plug it in to check',
      'Do not plug it in and report it',
      'Give it to a coworker',
      'Take it home'
    ],
    correctAnswer: 1,
    explanation: 'Unknown USB devices can contain malware.'
  },
  {
    id: 'usb-2b',
    kitType: 'device-control',
    question: 'What does device control prevent?',
    options: [
      'Software updates',
      'Unauthorized USB access and data transfers',
      'WiFi connections',
      'Email spam'
    ],
    correctAnswer: 1,
    explanation: 'Device control blocks unsafe removable media and monitors transfers.'
  },
]

// Get random question for a specific kit type
export function getRandomQuizQuestion(kitType: string): QuizQuestion {
  const question = getRandomByFilter(quizQuestions, q => q.kitType === kitType)
  if (!question) {
    // Fallback to first question
    return quizQuestions[0]
  }
  return question
}

// Get all questions for a specific kit type
export function getQuestionsForKit(kitType: string): QuizQuestion[] {
  return quizQuestions.filter(q => q.kitType === kitType)
}
