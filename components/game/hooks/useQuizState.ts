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
  points: number // Total points accumulated
  combo: number // Current combo multiplier
  passed: boolean | null // null = in progress, true = passed, false = failed
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
  const [points, setPoints] = useState(0)
  const [combo, setCombo] = useState(0)
  const [passed, setPassed] = useState<boolean | null>(null)

  // Refs for game loop access (avoid closure issues)
  const activeRef = useRef(false)
  const countdownRef = useRef(3)
  const currentQuizRef = useRef<QuizChallenge | null>(null)
  const itemsCollectedRef = useRef<string[]>([])
  const timeRemainingRef = useRef(0)
  const completedRef = useRef(false)
  const pointsRef = useRef(0)
  const comboRef = useRef(0)
  const passedRef = useRef<boolean | null>(null)

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

  useEffect(() => {
    pointsRef.current = points
  }, [points])

  useEffect(() => {
    comboRef.current = combo
  }, [combo])

  useEffect(() => {
    passedRef.current = passed
  }, [passed])

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
      setPoints(0)
      setCombo(0)
      setPassed(null)
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

      // Update combo and points
      if (isCorrect) {
        setCombo(prev => prev + 1)
        setPoints(prev => {
          const quiz = currentQuizRef.current
          if (!quiz) return prev
          
          const basePoints = quiz.pointsForCorrect
          const comboMultiplier = Math.min(comboRef.current + 1, 4) // Cap at 4x
          const pointsGained = basePoints * comboMultiplier
          return prev + pointsGained
        })
      } else {
        setCombo(0) // Reset combo on incorrect
        setPoints(prev => {
          const quiz = currentQuizRef.current
          if (!quiz) return prev
          return Math.max(0, prev + quiz.pointsForIncorrect) // Don't go below 0
        })
      }
    },

    markCompleted: () => {
      setCompleted(true)
      // Check if passed based on score
      const quiz = currentQuizRef.current
      if (quiz) {
        setPassed(pointsRef.current >= quiz.passingScore)
      }
    },

    reset: () => {
      setActive(false)
      setCountdown(3)
      setCurrentQuiz(null)
      setItemsCollected([])
      setTimeRemaining(0)
      setCompleted(false)
      setScore({ correct: 0, incorrect: 0 })
      setPoints(0)
      setCombo(0)
      setPassed(null)
    }
  }

  const state: QuizState = {
    active,
    countdown,
    currentQuiz,
    itemsCollected,
    timeRemaining,
    completed,
    score,
    points,
    combo,
    passed
  }

  return {
    state,
    refs: {
      activeRef,
      countdownRef,
      currentQuizRef,
      itemsCollectedRef,
      timeRemainingRef,
      completedRef,
      pointsRef,
      comboRef,
      passedRef
    },
    actions
  }
}
