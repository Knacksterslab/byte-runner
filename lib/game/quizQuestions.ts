import { getRandomByFilter } from './utils'
import { quizQuestionsA } from './data/quizQuestionsA'
import { quizQuestionsB } from './data/quizQuestionsB'
import { quizQuestionsC } from './data/quizQuestionsC'
import { quizQuestionsD } from './data/quizQuestionsD'

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
  correctAnswer: number
  explanation: string
}

export const quizQuestions: QuizQuestion[] = [
  ...quizQuestionsA,
  ...quizQuestionsB,
  ...quizQuestionsC,
  ...quizQuestionsD
]

export function getRandomQuizQuestion(kitType: string): QuizQuestion {
  const question = getRandomByFilter(quizQuestions, q => q.kitType === kitType)
  return question ?? quizQuestions[0]
}

export function getQuestionsForKit(kitType: string): QuizQuestion[] {
  return quizQuestions.filter(q => q.kitType === kitType)
}
