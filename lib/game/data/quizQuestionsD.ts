// Quiz questions part D: encryption-kit, sbom-toolkit, insider-monitor, email-gateway, classification-labeler, privacy-check, device-control

export const quizQuestionsD = [
  // ===== ENCRYPTION KIT QUESTIONS =====
  {
    id: 'enc-1', kitType: 'encryption-kit' as const,
    question: 'Why encrypt sensitive files?',
    options: ['To make them larger', 'To prevent unauthorized access if leaked', 'To remove backups', 'To make sharing public'],
    correctAnswer: 1,
    explanation: 'Encryption protects data if devices or files are lost.'
  },
  {
    id: 'enc-2', kitType: 'encryption-kit' as const,
    question: 'What is full-disk encryption used for?',
    options: ['Speeding up computers', 'Protecting data on a device if it is lost or stolen', 'Removing malware', 'Backing up files'],
    correctAnswer: 1,
    explanation: 'Full-disk encryption protects all data stored on the device.'
  },

  // ===== SBOM TOOLKIT QUESTIONS =====
  {
    id: 'sbom-1', kitType: 'sbom-toolkit' as const,
    question: 'What does SBOM stand for?',
    options: ['Secure Backup of Memory', 'Software Bill of Materials', 'System Backup Operational Manual', 'Standard Browser of Modules'],
    correctAnswer: 1,
    explanation: 'SBOM means Software Bill of Materials, listing components in software.'
  },
  {
    id: 'sbom-2', kitType: 'sbom-toolkit' as const,
    question: 'Why are supply chain attacks dangerous?',
    options: ['They only affect printers', 'They hide in trusted updates and dependencies', 'They are easy to detect', 'They only happen offline'],
    correctAnswer: 1,
    explanation: 'Supply chain attacks exploit trusted software sources.'
  },

  // ===== INSIDER MONITOR QUESTIONS =====
  {
    id: 'insider-1', kitType: 'insider-monitor' as const,
    question: 'What is least privilege?',
    options: ['Giving everyone admin rights', 'Giving users only the access they need', 'Sharing passwords to save time', 'Allowing all file downloads'],
    correctAnswer: 1,
    explanation: 'Least privilege limits access to reduce risk.'
  },
  {
    id: 'insider-2', kitType: 'insider-monitor' as const,
    question: 'What can indicate data exfiltration?',
    options: ['Small, regular uploads', 'Large, unusual file transfers', 'Normal login times', 'Updated antivirus'],
    correctAnswer: 1,
    explanation: 'Large or unusual transfers may signal data exfiltration.'
  },

  // ===== EMAIL GATEWAY QUESTIONS =====
  {
    id: 'email-1b', kitType: 'email-gateway' as const,
    question: 'What should you do with unexpected attachments?',
    options: ['Open immediately', 'Scan or verify before opening', 'Forward to everyone', 'Upload to social media'],
    correctAnswer: 1,
    explanation: 'Unexpected attachments should be verified or scanned first.'
  },
  {
    id: 'email-2b', kitType: 'email-gateway' as const,
    question: 'What is Business Email Compromise (BEC)?',
    options: ['A slow internet connection', 'Fraudulent emails that impersonate executives', 'A broken email server', 'A password manager feature'],
    correctAnswer: 1,
    explanation: 'BEC scams impersonate trusted executives to trick employees.'
  },

  // ===== CLASSIFICATION LABELER QUESTIONS =====
  {
    id: 'class-1b', kitType: 'classification-labeler' as const,
    question: 'Why apply data classification labels?',
    options: ['To make files larger', 'To control how data is shared and stored', 'To remove backups', 'To delete files'],
    correctAnswer: 1,
    explanation: 'Labels enforce the right handling and sharing rules.'
  },
  {
    id: 'class-2b', kitType: 'classification-labeler' as const,
    question: 'What is a common result of misclassification?',
    options: ['Better security', 'Sensitive data shared publicly', 'Faster backups', 'Lower risk'],
    correctAnswer: 1,
    explanation: 'Misclassification can expose confidential data.'
  },

  // ===== PRIVACY CHECK QUESTIONS =====
  {
    id: 'social-1b', kitType: 'privacy-check' as const,
    question: 'What should you avoid posting about work?',
    options: ['Public event announcements', 'Sensitive internal details', 'Company logos on approved media', 'General marketing posts'],
    correctAnswer: 1,
    explanation: 'Sensitive internal details can help attackers.'
  },
  {
    id: 'social-2b', kitType: 'privacy-check' as const,
    question: 'Why disable location tagging?',
    options: ['It speeds up the app', 'It reveals your real-time location', 'It improves image quality', 'It reduces storage'],
    correctAnswer: 1,
    explanation: 'Location tags can expose travel and routines.'
  },

  // ===== DEVICE CONTROL QUESTIONS =====
  {
    id: 'usb-1b', kitType: 'device-control' as const,
    question: 'What is the safest action with an unknown USB drive?',
    options: ['Plug it in to check', 'Do not plug it in and report it', 'Give it to a coworker', 'Take it home'],
    correctAnswer: 1,
    explanation: 'Unknown USB devices can contain malware.'
  },
  {
    id: 'usb-2b', kitType: 'device-control' as const,
    question: 'What does device control prevent?',
    options: ['Software updates', 'Unauthorized USB access and data transfers', 'WiFi connections', 'Email spam'],
    correctAnswer: 1,
    explanation: 'Device control blocks unsafe removable media and monitors transfers.'
  }
]
