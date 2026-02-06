// Input handling system for keyboard and touch controls
import type { MutableRefObject } from 'react'

export interface InputState {
  keys: { [key: string]: boolean }
  touchStartX: number
  touchStartY: number
  isTouching: boolean
}

export function createInputState(): InputState {
  return {
    keys: {},
    touchStartX: 0,
    touchStartY: 0,
    isTouching: false,
  }
}

export function createKeyboardHandlers(inputState: InputState) {
  const handleKeyDown = (e: KeyboardEvent) => {
    inputState.keys[e.key] = true
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    inputState.keys[e.key] = false
  }

  return { handleKeyDown, handleKeyUp }
}

export interface TouchHandlerConfig {
  canvas: HTMLCanvasElement
  inputState: InputState
  isHealing: boolean
  showingTutorial: boolean
  isRestoring: boolean
  playerX: number
  playerY: number
  mobileHudExpanded: boolean
  setMobileHudExpanded: (value: boolean) => void
  setPlayerPosition: (x: number, y: number) => void
}

export function createTouchHandlers(config: TouchHandlerConfig) {
  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    config.inputState.touchStartX = touch.clientX
    config.inputState.touchStartY = touch.clientY

    // Check if tap is on mobile HUD
    if (config.canvas.width < 768) {
      const hudX = config.canvas.width - (config.mobileHudExpanded ? 130 : 110)
      const hudY = 80
      const hudWidth = config.mobileHudExpanded ? 130 : 100
      const hudHeight = config.mobileHudExpanded ? 210 : 80

      if (
        touch.clientX >= hudX &&
        touch.clientX <= hudX + hudWidth &&
        touch.clientY >= hudY &&
        touch.clientY <= hudY + hudHeight
      ) {
        // Toggle HUD (timer management handled by UI hook)
        config.setMobileHudExpanded(!config.mobileHudExpanded)
        return
      }
    }

    config.inputState.isTouching = true
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!config.inputState.isTouching) return
    if (config.isHealing || config.showingTutorial || config.isRestoring) return
    e.preventDefault()

    const touch = e.touches[0]
    const deltaX = touch.clientX - config.inputState.touchStartX
    const deltaY = touch.clientY - config.inputState.touchStartY

    const newX = config.playerX + deltaX * 0.8
    const newY = config.playerY + deltaY * 0.8
    config.setPlayerPosition(newX, newY)

    config.inputState.touchStartX = touch.clientX
    config.inputState.touchStartY = touch.clientY
  }

  const handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault()
    config.inputState.isTouching = false
  }

  return { handleTouchStart, handleTouchMove, handleTouchEnd }
}

export interface ClickHandlerConfig {
  canvas: HTMLCanvasElement
  mobileHudExpanded: boolean
  setMobileHudExpanded: (value: boolean) => void
  desktopHudExpanded: boolean
  setDesktopHudExpanded: (value: boolean) => void
}

export function createClickHandler(config: ClickHandlerConfig) {
  return (e: MouseEvent) => {
    const rect = config.canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    if (config.canvas.width < 768) {
      const hudX = config.canvas.width - (config.mobileHudExpanded ? 130 : 110)
      const hudY = 80
      const hudWidth = config.mobileHudExpanded ? 130 : 100
      const hudHeight = config.mobileHudExpanded ? 210 : 80

      if (
        clickX >= hudX &&
        clickX <= hudX + hudWidth &&
        clickY >= hudY &&
        clickY <= hudY + hudHeight
      ) {
        // Toggle HUD (timer management handled by UI hook)
        config.setMobileHudExpanded(!config.mobileHudExpanded)
      }
    } else {
      const hudX = 20
      const hudY = 80
      const hudWidth = config.desktopHudExpanded ? 450 : 280
      const hudHeight = config.desktopHudExpanded ? 80 : 70

      if (
        clickX >= hudX &&
        clickX <= hudX + hudWidth &&
        clickY >= hudY &&
        clickY <= hudY + hudHeight
      ) {
        config.setDesktopHudExpanded(!config.desktopHudExpanded)
      }
    }
  }
}
