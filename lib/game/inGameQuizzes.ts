// In-game quiz challenges that appear during gameplay with slow-motion
// Visual pattern-based for quick recognition
import { getRandomItem } from './utils'

export interface QuizChallenge {
  id: string
  type: 'email' | 'password' | 'wifi' | 'link' | 'update'
  question: string
  instructions: string // What to do
  educationalNote: string // Why this matters
  duration: number // seconds
  items: QuizItem[]
  correctAnswers: string[] // IDs of correct items
  speedBonus: number // Speed multiplier after completion
}

export interface QuizItem {
  id: string
  visual: string // Emoji or icon
  label: string // Short text (15 chars max)
  color: string // Visual indicator
  isCorrect: boolean
}

// Email Security Challenge
export const emailSecurityQuiz: QuizChallenge = {
  id: 'email-security',
  type: 'email',
  question: 'PHISHING DETECTION CHALLENGE',
  instructions: 'Move to collect LEGITIMATE emails. Avoid PHISHING emails.',
  educationalNote: 'Check domains carefully! Phishing uses typos like netfIix.com',
  duration: 20,
  speedBonus: 1.2,
  items: [
    {
      id: 'email-1',
      visual: '',
      label: 'support@netflix.com',
      color: '#00ff00',
      isCorrect: true
    },
    {
      id: 'email-2',
      visual: '',
      label: 'support@netfIix.com', // Capital I instead of l
      color: '#ff0000',
      isCorrect: false
    },
    {
      id: 'email-3',
      visual: '',
      label: 'team@github.com',
      color: '#00ff00',
      isCorrect: true
    },
    {
      id: 'email-4',
      visual: '',
      label: 'urgent@paypa1.com', // 1 instead of l
      color: '#ff0000',
      isCorrect: false
    },
    {
      id: 'email-5',
      visual: '',
      label: 'noreply@amazon.com',
      color: '#00ff00',
      isCorrect: true
    },
    {
      id: 'email-6',
      visual: '',
      label: 'verify@amaz0n.com', // 0 instead of o
      color: '#ff0000',
      isCorrect: false
    }
  ],
  correctAnswers: ['email-1', 'email-3', 'email-5']
}

// Password Strength Challenge
export const passwordStrengthQuiz: QuizChallenge = {
  id: 'password-strength',
  type: 'password',
  question: 'PASSWORD STRENGTH CHALLENGE',
  instructions: 'Collect STRONG passwords. Avoid WEAK passwords.',
  educationalNote: 'Strong = 16+ characters, mix of letters/numbers/symbols',
  duration: 20,
  speedBonus: 1.2,
  items: [
    {
      id: 'pass-1',
      visual: '',
      label: 'MyP@ssw0rd2024!',
      color: '#00ff00',
      isCorrect: true
    },
    {
      id: 'pass-2',
      visual: '',
      label: 'password123',
      color: '#ff0000',
      isCorrect: false
    },
    {
      id: 'pass-3',
      visual: '',
      label: 'correct-horse-24',
      color: '#00ff00',
      isCorrect: true
    },
    {
      id: 'pass-4',
      visual: '',
      label: '12345678',
      color: '#ff0000',
      isCorrect: false
    },
    {
      id: 'pass-5',
      visual: '',
      label: 'Tr0ub4dor&3-X9',
      color: '#00ff00',
      isCorrect: true
    },
    {
      id: 'pass-6',
      visual: '',
      label: 'qwerty',
      color: '#ff0000',
      isCorrect: false
    }
  ],
  correctAnswers: ['pass-1', 'pass-3', 'pass-5']
}

// WiFi Security Challenge
export const wifiSecurityQuiz: QuizChallenge = {
  id: 'wifi-security',
  type: 'wifi',
  question: 'WIFI SECURITY CHALLENGE',
  instructions: 'Collect SECURE networks. Avoid PUBLIC WiFi.',
  educationalNote: 'Public WiFi is dangerous! Always use VPN on untrusted networks',
  duration: 20,
  speedBonus: 1.2,
  items: [
    {
      id: 'wifi-1',
      visual: '',
      label: 'Home_WiFi_5G',
      color: '#00ff00',
      isCorrect: true
    },
    {
      id: 'wifi-2',
      visual: '',
      label: 'Free_Public_WiFi',
      color: '#ff0000',
      isCorrect: false
    },
    {
      id: 'wifi-3',
      visual: '',
      label: 'Office_Secure',
      color: '#00ff00',
      isCorrect: true
    },
    {
      id: 'wifi-4',
      visual: '',
      label: 'Starbucks_Guest',
      color: '#ff0000',
      isCorrect: false
    },
    {
      id: 'wifi-5',
      visual: '',
      label: 'MyHome_WPA3',
      color: '#00ff00',
      isCorrect: true
    },
    {
      id: 'wifi-6',
      visual: '',
      label: 'xfinitywifi',
      color: '#ff0000',
      isCorrect: false
    }
  ],
  correctAnswers: ['wifi-1', 'wifi-3', 'wifi-5']
}

// Link Safety Challenge
export const linkSafetyQuiz: QuizChallenge = {
  id: 'link-safety',
  type: 'link',
  question: 'LINK SAFETY CHALLENGE',
  instructions: 'Collect SAFE links. Avoid MALICIOUS links.',
  educationalNote: 'Look for HTTPS, correct spelling, and legitimate domains',
  duration: 20,
  speedBonus: 1.2,
  items: [
    {
      id: 'link-1',
      visual: '',
      label: 'https://google.com',
      color: '#00ff00',
      isCorrect: true
    },
    {
      id: 'link-2',
      visual: '',
      label: 'http://g00gle.com',
      color: '#ff0000',
      isCorrect: false
    },
    {
      id: 'link-3',
      visual: '',
      label: 'https://github.com',
      color: '#00ff00',
      isCorrect: true
    },
    {
      id: 'link-4',
      visual: '',
      label: 'http://paypal-verify',
      color: '#ff0000',
      isCorrect: false
    },
    {
      id: 'link-5',
      visual: '',
      label: 'https://microsoft.com',
      color: '#00ff00',
      isCorrect: true
    },
    {
      id: 'link-6',
      visual: '',
      label: 'https://micr0s0ft.com',
      color: '#ff0000',
      isCorrect: false
    }
  ],
  correctAnswers: ['link-1', 'link-3', 'link-5']
}

// Software Update Priority Challenge
export const updatePriorityQuiz: QuizChallenge = {
  id: 'update-priority',
  type: 'update',
  question: 'UPDATE PRIORITY CHALLENGE',
  instructions: 'Collect CRITICAL updates. Skip OPTIONAL features.',
  educationalNote: 'Security patches should always be installed first!',
  duration: 20,
  speedBonus: 1.2,
  items: [
    {
      id: 'update-1',
      visual: '',
      label: 'Security Patch',
      color: '#00ff00',
      isCorrect: true
    },
    {
      id: 'update-2',
      visual: '',
      label: 'New Features',
      color: '#ff0000',
      isCorrect: false
    },
    {
      id: 'update-3',
      visual: '',
      label: 'Zero-Day Fix',
      color: '#00ff00',
      isCorrect: true
    },
    {
      id: 'update-4',
      visual: '',
      label: 'UI Improvements',
      color: '#ff0000',
      isCorrect: false
    },
    {
      id: 'update-5',
      visual: '',
      label: 'Critical CVE Fix',
      color: '#00ff00',
      isCorrect: true
    },
    {
      id: 'update-6',
      visual: '',
      label: 'Dark Mode',
      color: '#ff0000',
      isCorrect: false
    }
  ],
  correctAnswers: ['update-1', 'update-3', 'update-5']
}

// Get random quiz challenge
export function getRandomQuizChallenge(): QuizChallenge {
  const quizzes = [
    emailSecurityQuiz,
    passwordStrengthQuiz,
    wifiSecurityQuiz,
    linkSafetyQuiz,
    updatePriorityQuiz
  ]
  return getRandomItem(quizzes)
}

// Get quiz by level (progressive introduction)
export function getQuizForLevel(level: number): QuizChallenge | null {
  if (level < 3) return null // No quiz in first 2 levels
  
  // Introduce quizzes progressively
  if (level === 3 || level === 4) return passwordStrengthQuiz
  if (level === 5 || level === 6) return emailSecurityQuiz
  if (level === 7 || level === 8) return wifiSecurityQuiz
  if (level === 9 || level === 10) return linkSafetyQuiz
  
  // After level 10, random quiz
  return getRandomQuizChallenge()
}
