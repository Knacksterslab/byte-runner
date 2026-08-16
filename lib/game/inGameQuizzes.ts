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

// ── Procedural quizzes: MC question banks → collect-the-answer challenges ──
import { quizQuestionsA } from './data/quizQuestionsA'
import { quizQuestionsB } from './data/quizQuestionsB'
import { quizQuestionsC } from './data/quizQuestionsC'
import { quizQuestionsD } from './data/quizQuestionsD'

type BankQuestion = {
  id: string
  kitType: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const bankQuestions = [
  ...quizQuestionsA, ...quizQuestionsB, ...quizQuestionsC, ...quizQuestionsD,
] as BankQuestion[]

const KIT_TO_QUIZ_TYPE: Record<string, QuizChallenge['type']> = {
  'password-manager': 'password',
  'mfa-authenticator': 'password',
  'link-analyzer': 'link',
  'patch-manager': 'update',
  'privacy-optimizer': 'classification',
  'vpn-shield': 'wifi',
  'backup-system': 'disposal',
  'social-engineering-defense': 'email',
  'email-gateway': 'email',
  'remote-work-guard': 'wifi',
}

/** Deterministic PRNG so a given (level, day) always yields the same quiz. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffled<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

/** Builds a quiz from the MC banks; seeded by level + day-of-year. */
export function generateQuizChallenge(level: number): QuizChallenge {
  const dayOfYear = Math.floor(Date.now() / 86_400_000)
  const rng = mulberry32(level * 2654435761 + dayOfYear)
  const q = bankQuestions[Math.floor(rng() * bankQuestions.length)]!
  const correct = q.options[q.correctAnswer]!
  const wrongs = shuffled(
    q.options.filter((_, i) => i !== q.correctAnswer),
    rng,
  ).slice(0, 2)
  const entries = shuffled(
    [
      { text: correct, correct: true },
      ...wrongs.map((text) => ({ text, correct: false })),
    ],
    rng,
  )
  const items = entries.map((e, i) => ({
    id: `${q.id}-${i}`,
    visual: '',
    label: e.text.length > 34 ? e.text.slice(0, 33) + '…' : e.text,
    color: '#00ccff',
    isCorrect: e.correct,
    description: e.correct ? q.explanation : undefined,
  }))
  return {
    id: `gen-${q.id}`,
    type: KIT_TO_QUIZ_TYPE[q.kitType] ?? 'update',
    question: q.question,
    instructions: 'Collect the CORRECT answer. Avoid the wrong ones!',
    educationalNote: q.explanation,
    duration: 30,
    items,
    correctAnswers: items.filter((i) => i.isCorrect).map((i) => i.id),
    speedBonus: 1.2,
    pointsForCorrect: 10,
    pointsForIncorrect: -5,
    passingScore: 10,
  }
}

export function getQuizForLevel(level: number): QuizChallenge | null {
  // Curated set-pieces on their classic levels; generated quiz every other
  // level ≥3 so learning opportunities (and kit discounts) pace the whole run.
  if (level < 3) return null
  if (level === 3) return passwordStrengthQuiz
  if (level === 6) return emailSecurityQuiz
  if (level === 9) return wifiSecurityQuiz
  if (level === 12) return linkSafetyQuiz
  if (level === 15) return dataClassificationQuiz
  if (level === 18) return secureDisposalQuiz
  if (level === 21) return meetingSecurityQuiz
  return generateQuizChallenge(level)
}
