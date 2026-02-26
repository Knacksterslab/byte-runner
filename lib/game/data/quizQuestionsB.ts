// Quiz questions part B: mfa-authenticator, backup-system, social-engineering-defense

export const quizQuestionsB = [
  // ===== MFA AUTHENTICATOR QUESTIONS =====
  {
    id: 'mfa-1', kitType: 'mfa-authenticator' as const,
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
    id: 'mfa-2', kitType: 'mfa-authenticator' as const,
    question: 'Why is SMS (text message) 2FA less secure than authenticator apps?',
    options: [
      'Text messages are slower',
      'Authenticator apps are free',
      'SIM swapping attacks can intercept SMS codes',
      'SMS uses too much data'
    ],
    correctAnswer: 2,
    explanation: "Attackers can port your phone number to their SIM card (SIM swapping) and receive your SMS codes. Authenticator apps are tied to your physical device, not your phone number."
  },
  {
    id: 'mfa-3', kitType: 'mfa-authenticator' as const,
    question: 'What percentage of automated account takeovers are stopped by MFA?',
    options: ['50%', '75%', '99%', '100%'],
    correctAnswer: 2,
    explanation: "Microsoft reports that MFA blocks 99% of automated attacks. Even with stolen passwords, attackers can't get past the second factor."
  },
  {
    id: 'mfa-4', kitType: 'mfa-authenticator' as const,
    question: 'Which is the MOST secure type of MFA?',
    options: ['SMS text message codes', 'Email verification codes', 'Hardware security keys (YubiKey)', 'Authenticator app codes'],
    correctAnswer: 2,
    explanation: "Hardware security keys like YubiKey are phishing-resistant and can't be intercepted. Authenticator apps are second-best, followed by SMS (least secure)."
  },

  // ===== BACKUP SYSTEM QUESTIONS =====
  {
    id: 'backup-1', kitType: 'backup-system' as const,
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
    id: 'backup-2', kitType: 'backup-system' as const,
    question: 'Why should you keep one backup copy offsite?',
    options: [
      'Offsite storage is cheaper',
      'Protects against fire, flood, theft destroying all local copies',
      'Internet speeds are faster offsite',
      'Required by law'
    ],
    correctAnswer: 1,
    explanation: "If your home or office burns down, gets flooded, or is burglarized, all local backups are lost. An offsite copy (cloud or at a friend's house) survives disasters."
  },
  {
    id: 'backup-3', kitType: 'backup-system' as const,
    question: 'How often should you test restoring from backups?',
    options: ['Never - backups always work', 'Only when you need to restore', 'At least quarterly (every 3 months)', 'Once when you first set them up'],
    correctAnswer: 2,
    explanation: "Untested backups are Schrodinger's backups - they might not work! Test restoring files quarterly to ensure your backup system actually works."
  },
  {
    id: 'backup-4', kitType: 'backup-system' as const,
    question: 'What should you do if ransomware encrypts your files?',
    options: ['Pay the ransom immediately', 'Restore from backup and never pay ransom', 'Try to crack the encryption', 'Delete all files and start over'],
    correctAnswer: 1,
    explanation: "Never pay ransoms - it funds more attacks and doesn't guarantee file recovery. With proper backups, you just restore your files and move on."
  },

  // ===== SOCIAL ENGINEERING DEFENSE QUESTIONS =====
  {
    id: 'social-1', kitType: 'social-engineering-defense' as const,
    question: 'What is "pretexting" in social engineering?',
    options: [
      'Sending text messages to victims',
      'Creating a fake scenario to manipulate someone',
      'Pre-recording phone calls',
      'Testing security before an attack'
    ],
    correctAnswer: 1,
    explanation: "Pretexting is when attackers create a believable fake scenario (e.g., \"I'm from IT, need your password to fix an issue\") to manipulate victims into breaking security rules."
  },
  {
    id: 'social-2', kitType: 'social-engineering-defense' as const,
    question: 'Someone calls claiming to be your bank and asks for your password. What should you do?',
    options: [
      "Give them your password - they're from the bank",
      'Hang up and call your bank directly using the number on your card',
      'Ask them security questions first',
      'Give them a fake password to test if they\'re real'
    ],
    correctAnswer: 1,
    explanation: "Banks NEVER ask for passwords. Hang up immediately and call your bank using the official number on your card or website, not any number the caller provides."
  },
  {
    id: 'social-3', kitType: 'social-engineering-defense' as const,
    question: 'You find a USB drive in the parking lot. What should you do?',
    options: [
      'Plug it in to see who it belongs to',
      'Keep it and use it for extra storage',
      'Never plug it in - it could contain malware',
      "Plug it in on a friend's computer to check it"
    ],
    correctAnswer: 2,
    explanation: 'USB drops are a common attack vector. Plugging in unknown drives can infect your computer with malware. Turn it in to security or throw it away.'
  },
  {
    id: 'social-4', kitType: 'social-engineering-defense' as const,
    question: 'Which red flag indicates a social engineering attack?',
    options: [
      'The email is from a known company',
      'Urgent language: "Act now or account will be closed!"',
      'The email has proper grammar',
      'The email is short'
    ],
    correctAnswer: 1,
    explanation: "Social engineers use urgency and fear to bypass critical thinking. Legitimate companies give you time to respond and don't threaten immediate consequences."
  }
]
