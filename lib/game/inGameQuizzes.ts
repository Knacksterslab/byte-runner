// In-game quiz challenges that appear during gameplay with slow-motion
// Visual pattern-based for quick recognition
import { getRandomItem } from './utils'

export interface QuizChallenge {
  id: string
  type: 'email' | 'password' | 'wifi' | 'link' | 'update' | 'classification' | 'disposal' | 'meeting'
  question: string
  instructions: string // What to do
  educationalNote: string // Why this matters
  duration: number // seconds
  items: QuizItem[]
  correctAnswers: string[] // IDs of correct items
  speedBonus: number // Speed multiplier after completion
  pointsForCorrect: number // Points gained for correct item
  pointsForIncorrect: number // Points lost for incorrect item (negative)
  passingScore: number // Minimum score to pass
}

export interface QuizItem {
  id: string
  visual: string // Emoji or icon
  label: string // Short text (15 chars max)
  color: string // Visual indicator
  isCorrect: boolean
  description?: string // Descriptive label for neutral quiz design
}

// Email Security Challenge
export const emailSecurityQuiz: QuizChallenge = {
  id: 'email-security',
  type: 'email',
  question: 'PHISHING DETECTION CHALLENGE',
  instructions: 'Pick the LEGITIMATE email.',
  educationalNote: 'Check domains carefully! Phishing uses typos like netfIix.com',
  duration: 40,
  speedBonus: 1.2,
  pointsForCorrect: 10,
  pointsForIncorrect: -5,
  passingScore: 10,
  items: [
    {
      id: 'email-1',
      visual: '',
      label: 'support@netflix.com',
      color: '#00ccff',
      isCorrect: true
    },
    {
      id: 'email-2',
      visual: '',
      label: 'support@netfIix.com', // Capital I instead of l
      color: '#00ccff',
      isCorrect: false
    },
    {
      id: 'email-3',
      visual: '',
      label: 'urgent@paypa1.com', // 1 instead of l
      color: '#00ccff',
      isCorrect: false
    }
  ],
  correctAnswers: ['email-1']
}

// Password Strength Challenge
export const passwordStrengthQuiz: QuizChallenge = {
  id: 'password-strength',
  type: 'password',
  question: 'DATA BREACH',
  instructions: 'Pick the strongest passwords.',
  educationalNote: 'Longer passwords & real tools keep you safe!',
  duration: 40,
  speedBonus: 1.2,
  pointsForCorrect: 10,
  pointsForIncorrect: -5,
  passingScore: 10,
  items: [
    {
      id: 'pass-1',
      visual: '',
      label: 'p1zz@',
      color: '#00ccff', // Neutral cyan
      isCorrect: false,
      description: 'common word + symbol'
    },
    {
      id: 'pass-2',
      visual: '',
      label: '12345678',
      color: '#00ccff',
      isCorrect: false,
      description: 'keyboard pattern'
    },
    {
      id: 'pass-3',
      visual: '',
      label: 'Tr0ubAdor3-X3',
      color: '#00ccff',
      isCorrect: true,
      description: 'long + unique'
    }
  ],
  correctAnswers: ['pass-3']
}

// WiFi Security Challenge
export const wifiSecurityQuiz: QuizChallenge = {
  id: 'wifi-security',
  type: 'wifi',
  question: 'WIFI SECURITY CHALLENGE',
  instructions: 'Pick the most secure network.',
  educationalNote: 'Public WiFi is dangerous! Always use VPN on untrusted networks',
  duration: 40,
  speedBonus: 1.2,
  pointsForCorrect: 10,
  pointsForIncorrect: -5,
  passingScore: 10,
  items: [
    {
      id: 'wifi-1',
      visual: '',
      label: 'MyHome_WPA3',
      color: '#00ccff',
      isCorrect: true
    },
    {
      id: 'wifi-2',
      visual: '',
      label: 'Free_Public_WiFi',
      color: '#00ccff',
      isCorrect: false
    },
    {
      id: 'wifi-3',
      visual: '',
      label: 'Starbucks_Guest',
      color: '#00ccff',
      isCorrect: false
    }
  ],
  correctAnswers: ['wifi-1']
}

// Link Safety Challenge
export const linkSafetyQuiz: QuizChallenge = {
  id: 'link-safety',
  type: 'link',
  question: 'LINK SAFETY CHALLENGE',
  instructions: 'Pick the safe link.',
  educationalNote: 'Look for HTTPS, correct spelling, and legitimate domains',
  duration: 40,
  speedBonus: 1.2,
  pointsForCorrect: 10,
  pointsForIncorrect: -5,
  passingScore: 10,
  items: [
    {
      id: 'link-1',
      visual: '',
      label: 'https://google.com',
      color: '#00ccff',
      isCorrect: true
    },
    {
      id: 'link-2',
      visual: '',
      label: 'http://g00gle.com',
      color: '#00ccff',
      isCorrect: false
    },
    {
      id: 'link-3',
      visual: '',
      label: 'http://paypal-verify',
      color: '#00ccff',
      isCorrect: false
    }
  ],
  correctAnswers: ['link-1']
}

// Software Update Priority Challenge
export const updatePriorityQuiz: QuizChallenge = {
  id: 'update-priority',
  type: 'update',
  question: 'UPDATE PRIORITY CHALLENGE',
  instructions: 'Pick the critical update.',
  educationalNote: 'Security patches should always be installed first!',
  duration: 40,
  speedBonus: 1.2,
  pointsForCorrect: 10,
  pointsForIncorrect: -5,
  passingScore: 10,
  items: [
    {
      id: 'update-1',
      visual: '',
      label: 'Security Patch',
      color: '#00ccff',
      isCorrect: true
    },
    {
      id: 'update-2',
      visual: '',
      label: 'New Features',
      color: '#00ccff',
      isCorrect: false
    },
    {
      id: 'update-3',
      visual: '',
      label: 'Dark Mode',
      color: '#00ccff',
      isCorrect: false
    }
  ],
  correctAnswers: ['update-1']
}

// Data Classification Challenge
export const dataClassificationQuiz: QuizChallenge = {
  id: 'data-classification',
  type: 'classification',
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

// Secure Disposal Challenge
export const secureDisposalQuiz: QuizChallenge = {
  id: 'secure-disposal',
  type: 'disposal',
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

// Meeting Security Challenge
export const meetingSecurityQuiz: QuizChallenge = {
  id: 'meeting-security',
  type: 'meeting',
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

// Get random quiz challenge
export function getRandomQuizChallenge(): QuizChallenge {
  const quizzes = [
    emailSecurityQuiz,
    passwordStrengthQuiz,
    wifiSecurityQuiz,
    linkSafetyQuiz,
    updatePriorityQuiz,
    dataClassificationQuiz,
    secureDisposalQuiz,
    meetingSecurityQuiz
  ]
  return getRandomItem(quizzes)
}

// Get quiz by level (progressive introduction)
export function getQuizForLevel(level: number): QuizChallenge | null {
  // Quizzes appear every 3 levels starting at level 3
  if (level % 3 !== 0) return null // Only on levels 3, 6, 9, 12, 15, 18...
  
  // Introduce different quiz types progressively
  if (level === 3) return passwordStrengthQuiz
  if (level === 6) return emailSecurityQuiz
  if (level === 9) return wifiSecurityQuiz
  if (level === 12) return linkSafetyQuiz
  if (level === 15) return dataClassificationQuiz
  if (level === 18) return secureDisposalQuiz
  if (level === 21) return meetingSecurityQuiz
  
  // After level 21, random quiz every 3 levels
  return getRandomQuizChallenge()
}
