// In-game quiz challenge data - set B (update, classification, disposal, meeting)

export const updatePriorityQuiz = {
  id: 'update-priority',
  type: 'update' as const,
  question: 'UPDATE PRIORITY CHALLENGE',
  instructions: 'Pick the critical update.',
  educationalNote: 'Security patches should always be installed first!',
  duration: 40,
  speedBonus: 1.2,
  pointsForCorrect: 10,
  pointsForIncorrect: -5,
  passingScore: 10,
  items: [
    { id: 'update-1', visual: '', label: 'Security Patch', color: '#00ccff', isCorrect: true },
    { id: 'update-2', visual: '', label: 'New Features', color: '#00ccff', isCorrect: false },
    { id: 'update-3', visual: '', label: 'Dark Mode', color: '#00ccff', isCorrect: false }
  ],
  correctAnswers: ['update-1']
}

export const dataClassificationQuiz = {
  id: 'data-classification',
  type: 'classification' as const,
  question: 'DATA CLASSIFICATION CHALLENGE',
  instructions: 'Pick the confidential data type.',
  educationalNote: 'Label data correctly before sharing or storing it.',
  duration: 40,
  speedBonus: 1.2,
  pointsForCorrect: 10,
  pointsForIncorrect: -5,
  passingScore: 10,
  items: [
    { id: 'class-1', visual: '', label: 'Customer PII', color: '#00ccff', isCorrect: true },
    { id: 'class-2', visual: '', label: 'Press Release', color: '#00ccff', isCorrect: false },
    { id: 'class-3', visual: '', label: 'Event Flyer', color: '#00ccff', isCorrect: false }
  ],
  correctAnswers: ['class-1']
}

export const secureDisposalQuiz = {
  id: 'secure-disposal',
  type: 'disposal' as const,
  question: 'SECURE DISPOSAL CHALLENGE',
  instructions: 'Pick the item that must be shredded.',
  educationalNote: 'Shred or securely destroy sensitive documents.',
  duration: 40,
  speedBonus: 1.2,
  pointsForCorrect: 10,
  pointsForIncorrect: -5,
  passingScore: 10,
  items: [
    { id: 'disp-1', visual: '', label: 'Client Contract', color: '#00ccff', isCorrect: true },
    { id: 'disp-2', visual: '', label: 'Lunch Menu', color: '#00ccff', isCorrect: false },
    { id: 'disp-3', visual: '', label: 'Movie Ticket', color: '#00ccff', isCorrect: false }
  ],
  correctAnswers: ['disp-1']
}

export const meetingSecurityQuiz = {
  id: 'meeting-security',
  type: 'meeting' as const,
  question: 'MEETING SECURITY CHALLENGE',
  instructions: 'Pick the approved attendee.',
  educationalNote: 'Use waiting rooms and passwords to keep meetings safe.',
  duration: 40,
  speedBonus: 1.2,
  pointsForCorrect: 10,
  pointsForIncorrect: -5,
  passingScore: 10,
  items: [
    { id: 'meet-1', visual: '', label: 'pm@company', color: '#00ccff', isCorrect: true },
    { id: 'meet-2', visual: '', label: 'unknown@guest', color: '#00ccff', isCorrect: false },
    { id: 'meet-3', visual: '', label: 'random@link', color: '#00ccff', isCorrect: false }
  ],
  correctAnswers: ['meet-1']
}
