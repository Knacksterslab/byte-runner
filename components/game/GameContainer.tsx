'use client'

import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import RunnerScene from './scenes/RunnerScene'
import PhishingPuzzleScene from './scenes/PhishingPuzzleScene'
import { GameConfig } from '@/lib/game/GameConfig'
import { gameEvents, GameEvent, CollectEvent, CollisionEvent, DistanceEvent } from '@/lib/game/GameEvents'
import { useGameStore } from '@/lib/store/gameStore'
import GameUI from './GameUI'

export default function GameContainer() {
  const gameRef = useRef<Phaser.Game | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const { setDistance, addScore, setGameOver, addDataPacket, setRunning, resetGame } = useGameStore()
  
  useEffect(() => {
    if (!gameRef.current && gameStarted) {
      // Initialize game
      const config = {
        ...GameConfig,
        scene: [RunnerScene, PhishingPuzzleScene]
      }
      
      gameRef.current = new Phaser.Game(config)
      
      // Give canvas focus after a short delay
      setTimeout(() => {
        const canvas = document.querySelector('canvas')
        if (canvas) {
          canvas.focus()
          canvas.tabIndex = 1
        }
      }, 100)
      
      // Listen to game events
      gameEvents.on(GameEvent.DISTANCE, (event: DistanceEvent) => {
        setDistance(event.distance)
      })
      
      gameEvents.on(GameEvent.COLLECT, (event: CollectEvent) => {
        addScore(event.points)
        if (event.type === 'data-packet') {
          addDataPacket()
        }
      })
      
      gameEvents.on(GameEvent.COLLISION, (event: CollisionEvent) => {
        if (event.damage) {
          addScore(-event.damage)
        }
      })
      
      gameEvents.on(GameEvent.GAME_OVER, () => {
        setGameOver(true)
        setRunning(false)
      })
      
      gameEvents.on(GameEvent.GAME_START, () => {
        setRunning(true)
      })
      
      gameEvents.on(GameEvent.PUZZLE_COMPLETE, (data: { success: boolean }) => {
        if (data.success) {
          addScore(100) // Bonus for correct answer
        }
      })
    }
    
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [gameStarted, setDistance, addScore, setGameOver, addDataPacket, setRunning])
  
  const handleStart = () => {
    resetGame()
    setGameStarted(true)
  }
  
  const handleRestart = () => {
    if (gameRef.current) {
      const runnerScene = gameRef.current.scene.getScene('RunnerScene') as RunnerScene
      if (runnerScene) {
        runnerScene.restartGame()
      }
    }
    resetGame()
    setRunning(true)
    setGameOver(false)
  }
  
  if (!gameStarted) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-black">
        <div className="text-center space-y-8">
          <div>
            <h1 className="text-6xl font-bold text-neon-cyan mb-4 font-mono">
              BYTE RUNNER
            </h1>
            <p className="text-cyan-300 text-xl">
              Learn cybersecurity through endless running
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="text-white text-lg">
              <p>🏃 Swipe left/right to change lanes</p>
              <p>⬆️ Swipe up or tap to jump</p>
              <p>🎯 Collect data packets for points</p>
              <p>🚧 Avoid obstacles to survive</p>
              <p>🧩 Solve puzzles every 1000m</p>
            </div>
          </div>
          
          <button
            onClick={handleStart}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-2xl font-bold py-4 px-12 rounded-lg transition-all transform hover:scale-105 font-mono"
          >
            START RUNNING
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="relative w-full h-screen" onClick={() => {
      // Ensure canvas gets focus when clicked
      const canvas = document.querySelector('canvas')
      if (canvas) canvas.focus()
    }}>
      <div id="game-container" className="w-full h-full" />
      <GameUI onRestart={handleRestart} />
      
      {/* Controls reminder */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 border border-cyan-600 rounded-lg px-6 py-2 text-center pointer-events-none">
        <p className="text-cyan-300 text-sm font-mono">
          ← → or A D to move | ↑ or W or SPACE to jump
        </p>
      </div>
    </div>
  )
}
