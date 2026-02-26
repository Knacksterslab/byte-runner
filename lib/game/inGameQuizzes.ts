// In-game quiz challenges - types, data, and utility functions
import { getRandomItem } from './utils'
import {
  emailSecurityQuiz,
  passwordStrengthQuiz,
  wifiSecurityQuiz,
  linkSafetyQuiz
} from './data/quizChallengesA'
import {
  updatePriorityQuiz,
  dataClassificationQuiz,
  secureDisposalQuiz,
  meetingSecurityQuiz
} from './data/quizChallengesB'

export interface QuizChallenge {
  id: string
  type: 'email' | 'password' | 'wifi' | 'link' | 'update' | 'classification' | 'disposal' | 'meeting'
  question: string
  instructions: string
  educationalNote: string
  duration: number
  items: QuizItem[]
  correctAnswers: string[]
  speedBonus: number
  pointsForCorrect: number
  pointsForIncorrect: number
  passingScore: number
}

export interface QuizItem {
  id: string
  visual: string
  label: string
  color: string
  isCorrect: boolean
  description?: string
}

export {
  emailSecurityQuiz,
  passwordStrengthQuiz,
  wifiSecurityQuiz,
  linkSafetyQuiz,
  updatePriorityQuiz,
  dataClassificationQuiz,
  secureDisposalQuiz,
  meetingSecurityQuiz
}

const allQuizzes: QuizChallenge[] = [
  emailSecurityQuiz,
  passwordStrengthQuiz,
  wifiSecurityQuiz,
  linkSafetyQuiz,
  updatePriorityQuiz,
  dataClassificationQuiz,
  secureDisposalQuiz,
  meetingSecurityQuiz
]

export function getRandomQuizChallenge(): QuizChallenge {
  return getRandomItem(allQuizzes)
}

export function getQuizForLevel(level: number): QuizChallenge | null {
  if (level % 3 !== 0) return null
  if (level === 3) return passwordStrengthQuiz
  if (level === 6) return emailSecurityQuiz
  if (level === 9) return wifiSecurityQuiz
  if (level === 12) return linkSafetyQuiz
  if (level === 15) return dataClassificationQuiz
  if (level === 18) return secureDisposalQuiz
  if (level === 21) return meetingSecurityQuiz
  return getRandomQuizChallenge()
}
