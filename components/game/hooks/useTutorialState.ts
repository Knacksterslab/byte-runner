import { useState, useRef, useEffect } from 'react'
import { trackTutorialViewed, trackTutorialDismissed } from '@/lib/analytics'

export interface TutorialState {
  showing: boolean
  countdown: number
}

export interface TutorialActions {
  open: () => void
  close: () => void
}

export function useTutorialState() {
  const [showing, setShowing] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const startTime = useRef<number>(0)

  // Countdown timer (only when manually opened)
  useEffect(() => {
    if (showing && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [showing, countdown])

  const actions: TutorialActions = {
    open: () => {
      setShowing(true)
      setCountdown(5)
      startTime.current = Date.now()
      trackTutorialViewed()
    },

    close: () => {
      const timeSpent = Date.now() - startTime.current
      trackTutorialDismissed(timeSpent)
      setShowing(false)
      setCountdown(5)
    }
  }

  const state: TutorialState = {
    showing,
    countdown
  }

  return { state, actions }
}
