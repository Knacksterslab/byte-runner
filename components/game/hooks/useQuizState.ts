import { useState, useRef, useEffect } from 'react'
import { getQuizForLevel, type QuizChallenge } from '@/lib/game/inGameQuizzes'

export interface QuizState {
  active: boolean
  countdown: number
  currentQuiz: QuizChallenge | null
  itemsCollected: string[]
  timeRemaining: number
  completed: boolean
  score: { correct: number; incorrect: number }
}

export interface QuizActions {
  startQuiz: (level: number) => void
  endQuiz: () => void
  collectItem: (itemId: string, isCorrect: boolean) => void
  markCompleted: () => void
  reset: () => void
}

export function useQuizState() {
  const [active, setActive] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [currentQuiz, setCurrentQuiz] = useState<QuizChallenge | null>(null)
  const [itemsCollected, setItemsCollected] = useState<string[]>([])
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [score, setScore] = useState({ correct: 0, incorrect: 0 })

  // Refs for game loop access (avoid closure issues)
  const activeRef = useRef(false)
  const countdownRef = useRef(3)
  const currentQuizRef = useRef<QuizChallenge | null>(null)
  const itemsCollectedRef = useRef<string[]>([])
  const timeRemainingRef = useRef(0)
  const completedRef = useRef(false)

  // Sync state to refs
  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    countdownRef.current = countdown
  }, [countdown])

  useEffect(() => {
    currentQuizRef.current = currentQuiz
  }, [currentQuiz])

  useEffect(() => {
    itemsCollectedRef.current = itemsCollected
  }, [itemsCollected])

  useEffect(() => {
    timeRemainingRef.current = timeRemaining
  }, [timeRemaining])

  useEffect(() => {
    completedRef.current = completed
  }, [completed])

  // Countdown before quiz starts
  useEffect(() => {
    if (active && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [active, countdown])

  // Timer during active quiz
  useEffect(() => {
    if (active && countdown === 0 && timeRemaining > 0 && !completed) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [active, countdown, timeRemaining, completed])

  const actions: QuizActions = {
    startQuiz: (level: number) => {
      const quiz = getQuizForLevel(level)
      if (!quiz) {
        return
      }
      setCurrentQuiz(quiz)
      setActive(true)
      setCountdown(3)
      setTimeRemaining(quiz.duration)
      setItemsCollected([])
      setCompleted(false)
      setScore({ correct: 0, incorrect: 0 })
    },

    endQuiz: () => {
      setActive(false)
      setCurrentQuiz(null)
      setCountdown(3)
      setItemsCollected([])
      setCompleted(false)
    },

    collectItem: (itemId: string, isCorrect: boolean) => {
      setItemsCollected(prev => [...prev, itemId])
      setScore(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1)
      }))
    },

    markCompleted: () => {
      setCompleted(true)
    },

    reset: () => {
      setActive(false)
      setCountdown(3)
      setCurrentQuiz(null)
      setItemsCollected([])
      setTimeRemaining(0)
      setCompleted(false)
      setScore({ correct: 0, incorrect: 0 })
    }
  }

  const state: QuizState = {
    active,
    countdown,
    currentQuiz,
    itemsCollected,
    timeRemaining,
    completed,
    score
  }

  return {
    state,
    refs: {
      activeRef,
      countdownRef,
      currentQuizRef,
      itemsCollectedRef,
      timeRemainingRef,
      completedRef
    },
    actions
  }
}
