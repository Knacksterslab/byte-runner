// Quiz questions part C: badge-tap, secure-shred, policy-knowledge, ethics-reporting, compliance-kit, remote-work-guard, waiting-room, travel-vpn

export const quizQuestionsC = [
  // ===== BADGE TAP QUESTIONS =====
  {
    id: 'badge-1', kitType: 'badge-tap' as const,
    question: 'What should you do if someone tries to tailgate into a secure area?',
    options: ['Hold the door for them', 'Ask them to badge in or get security', 'Ignore them and walk away', 'Let them in if they look friendly'],
    correctAnswer: 1,
    explanation: 'Tailgating is a common physical security risk. Everyone must badge in or be escorted.'
  },
  {
    id: 'badge-2', kitType: 'badge-tap' as const,
    question: 'What is the safest action when leaving your desk?',
    options: ['Leave your screen on', 'Lock your workstation', 'Minimize windows', 'Close your email'],
    correctAnswer: 1,
    explanation: 'Locking your workstation prevents unauthorized access when you step away.'
  },

  // ===== SECURE SHRED QUESTIONS =====
  {
    id: 'shred-1', kitType: 'secure-shred' as const,
    question: 'How should you dispose of documents with sensitive data?',
    options: ['Recycle them immediately', 'Shred or use secure disposal bins', 'Throw them in the trash', 'Give them to a coworker'],
    correctAnswer: 1,
    explanation: 'Sensitive documents should be shredded or placed in secure disposal bins.'
  },
  {
    id: 'shred-2', kitType: 'secure-shred' as const,
    question: 'What is dumpster diving?',
    options: ['Backing up data to the cloud', 'Searching trash for sensitive information', 'Organizing files for storage', 'Cleaning old devices'],
    correctAnswer: 1,
    explanation: 'Attackers retrieve sensitive information from trash if it is not destroyed.'
  },

  // ===== POLICY KNOWLEDGE QUESTIONS =====
  {
    id: 'policy-1', kitType: 'policy-knowledge' as const,
    question: 'What is a common example of a policy violation?',
    options: ['Using approved software', 'Sharing your password with a coworker', 'Locking your screen', 'Using MFA'],
    correctAnswer: 1,
    explanation: 'Sharing passwords violates acceptable use and access policies.'
  },
  {
    id: 'policy-2', kitType: 'policy-knowledge' as const,
    question: 'Why is shadow IT risky?',
    options: ['It saves money on licenses', 'It uses unapproved tools without security controls', 'It speeds up updates', 'It improves compliance'],
    correctAnswer: 1,
    explanation: 'Unapproved tools often lack required security and auditing.'
  },

  // ===== ETHICS REPORTING QUESTIONS =====
  {
    id: 'report-1', kitType: 'ethics-reporting' as const,
    question: 'What should you do if you suspect a security incident?',
    options: ['Wait to see if it resolves', 'Report immediately through official channels', 'Post it in a public chat', 'Investigate on your own'],
    correctAnswer: 1,
    explanation: 'Fast reporting reduces damage and helps responders act quickly.'
  },
  {
    id: 'report-2', kitType: 'ethics-reporting' as const,
    question: 'Which detail is MOST helpful in an incident report?',
    options: ['Your favorite app', 'Time and description of what happened', 'A guess of who caused it', 'A meme screenshot'],
    correctAnswer: 1,
    explanation: 'Time, impact, and clear description help responders act fast.'
  },

  // ===== COMPLIANCE KIT QUESTIONS =====
  {
    id: 'comp-1', kitType: 'compliance-kit' as const,
    question: 'What is PCI-DSS concerned with?',
    options: ['Employee attendance', 'Payment card data security', 'Building access', 'Video meetings'],
    correctAnswer: 1,
    explanation: 'PCI-DSS defines controls for payment card data security.'
  },
  {
    id: 'comp-2', kitType: 'compliance-kit' as const,
    question: 'What is one key GDPR requirement?',
    options: ['Store all data forever', 'Collect only necessary personal data', 'Share data publicly', 'Disable encryption'],
    correctAnswer: 1,
    explanation: 'GDPR requires data minimization and lawful processing.'
  },

  // ===== REMOTE WORK GUARD QUESTIONS =====
  {
    id: 'remote-1', kitType: 'remote-work-guard' as const,
    question: 'What should you do to secure a home router?',
    options: ['Keep default password', 'Change the default password and update firmware', 'Disable encryption', 'Share the password publicly'],
    correctAnswer: 1,
    explanation: 'Changing default credentials and updating firmware reduce risk.'
  },
  {
    id: 'remote-2', kitType: 'remote-work-guard' as const,
    question: 'What is the best way to separate work and personal devices?',
    options: ['Use the same WiFi for everything', 'Use a guest network for personal devices', 'Disable firewall', 'Share files between devices freely'],
    correctAnswer: 1,
    explanation: 'Guest networks isolate personal devices from work systems.'
  },

  // ===== WAITING ROOM QUESTIONS =====
  {
    id: 'meet-1', kitType: 'waiting-room' as const,
    question: 'What prevents uninvited people from joining a meeting?',
    options: ['Posting the link publicly', 'Waiting rooms and meeting passwords', 'Disabling video', 'Using any random meeting ID'],
    correctAnswer: 1,
    explanation: 'Waiting rooms and passwords let hosts approve attendees.'
  },
  {
    id: 'meet-2', kitType: 'waiting-room' as const,
    question: 'When should you lock a meeting?',
    options: ['Never', 'After all expected participants join', 'Before the meeting starts', 'Only after a problem occurs'],
    correctAnswer: 1,
    explanation: 'Locking the meeting prevents new, unexpected attendees.'
  },

  // ===== TRAVEL VPN QUESTIONS =====
  {
    id: 'travel-1', kitType: 'travel-vpn' as const,
    question: 'What is the safest option on hotel WiFi?',
    options: ['Connect without protection', 'Use a VPN for all traffic', 'Turn off encryption', 'Share passwords over email'],
    correctAnswer: 1,
    explanation: 'VPNs encrypt traffic on untrusted networks.'
  },
  {
    id: 'travel-2', kitType: 'travel-vpn' as const,
    question: 'What is risky about public kiosks?',
    options: ['They are too fast', 'They may capture credentials', 'They use wired networks', 'They require a mouse'],
    correctAnswer: 1,
    explanation: 'Public kiosks can have keyloggers or malware.'
  }
]
