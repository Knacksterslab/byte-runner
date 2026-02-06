import { useState, useRef } from 'react'

export interface UIState {
  showLearnMore: boolean
  showBonusNotification: boolean
  showEducationDetails: boolean
  mobileHudExpanded: boolean
  desktopHudExpanded: boolean
}

export interface UIActions {
  toggleLearnMore: () => void
  showBonus: (duration?: number) => void
  hideBonus: () => void
  toggleEducationDetails: () => void
  setMobileHudExpanded: (expanded: boolean) => void
  setDesktopHudExpanded: (expanded: boolean) => void
}

export function useUIState() {
  const [showLearnMore, setShowLearnMore] = useState(false)
  const [showBonusNotification, setShowBonusNotification] = useState(false)
  const [showEducationDetails, setShowEducationDetails] = useState(false)
  const [mobileHudExpanded, setMobileHudExpanded] = useState(false)
  const [desktopHudExpanded, setDesktopHudExpanded] = useState(false)

  const mobileHudCollapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])

  const actions: UIActions = {
    toggleLearnMore: () => setShowLearnMore(prev => !prev),
    
    showBonus: (duration = 5000) => {
      setShowBonusNotification(true)
      const timer = setTimeout(() => setShowBonusNotification(false), duration)
      timeoutRefs.current.push(timer)
    },
    
    hideBonus: () => setShowBonusNotification(false),
    
    toggleEducationDetails: () => setShowEducationDetails(prev => !prev),
    
    setMobileHudExpanded: (expanded: boolean) => {
      setMobileHudExpanded(expanded)
      if (mobileHudCollapseTimer.current) {
        clearTimeout(mobileHudCollapseTimer.current)
      }
      if (expanded) {
        const timer = setTimeout(() => setMobileHudExpanded(false), 5000)
        mobileHudCollapseTimer.current = timer
        timeoutRefs.current.push(timer)
      }
    },
    
    setDesktopHudExpanded: (expanded: boolean) => setDesktopHudExpanded(expanded)
  }

  const state: UIState = {
    showLearnMore,
    showBonusNotification,
    showEducationDetails,
    mobileHudExpanded,
    desktopHudExpanded
  }

  // Cleanup timeouts
  const cleanup = () => {
    timeoutRefs.current.forEach(timer => clearTimeout(timer))
    if (mobileHudCollapseTimer.current) {
      clearTimeout(mobileHudCollapseTimer.current)
    }
  }

  return { state, actions, cleanup }
}
