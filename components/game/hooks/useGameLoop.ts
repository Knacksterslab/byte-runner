'use client'

import { useEffect } from 'react'
import { createGameEngine } from '@/lib/game/engine/createGameEngine'
import type { UseGameLoopOptions } from './useGameLoopTypes'

export function useGameLoop(opts: UseGameLoopOptions): void {
  const {
    canvasRef, gameStarted, isGameOver,
    setDistance, setScore, setGameOver, setRunning, setLastAttacker, resetGame,
    setLevel, setSavedGameState, setIsFirstDeath, ui,
  } = opts

  useEffect(() => {
    if (!gameStarted || !canvasRef.current) return
    const canvas = canvasRef.current
    return createGameEngine(canvas, opts)
  }, [gameStarted, isGameOver, setDistance, setScore, setGameOver, setRunning, setLastAttacker, resetGame, setLevel, ui.state.mobileHudExpanded, ui.state.desktopHudExpanded])
}
