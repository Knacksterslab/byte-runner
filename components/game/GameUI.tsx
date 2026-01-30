'use client'

import { useGameStore } from '@/lib/store/gameStore'
import { Package, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface GameUIProps {
  onRestart: () => void
}

export default function GameUI({ onRestart }: GameUIProps) {
  const { distance, score, dataPackets, isGameOver, highScore, isPaused } = useGameStore()
  
  return (
    <>
      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none z-10">
        <div className="flex justify-between items-start">
          {/* Left stats */}
          <div className="flex flex-col space-y-2">
            <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-cyan-800">
              <span className="text-white text-xl font-mono">
                DISTANCE: <span className="text-neon-cyan">{distance}m</span>
              </span>
            </div>
            <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-cyan-800">
              <span className="text-white text-xl font-mono">
                SCORE: <span className="text-neon-yellow">{score}</span>
              </span>
            </div>
          </div>
          
          {/* Right collectibles */}
          <div className="flex flex-col space-y-2">
            <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-yellow-600 flex items-center space-x-2">
              <Package className="w-5 h-5 text-yellow-400" />
              <span className="text-white text-xl font-mono">{dataPackets}</span>
            </div>
            <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-purple-600 flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-purple-400" />
              <span className="text-white text-xl font-mono">{highScore}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Game Over Screen */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/90 z-20 pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-center space-y-6 max-w-md mx-auto p-8"
            >
              <h2 className="text-6xl font-bold text-red-500 font-mono mb-4">
                GAME OVER
              </h2>
              
              <div className="space-y-3">
                <div className="bg-gray-900/80 border border-cyan-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Final Distance</p>
                  <p className="text-neon-cyan text-3xl font-mono">{distance}m</p>
                </div>
                
                <div className="bg-gray-900/80 border border-yellow-600 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Final Score</p>
                  <p className="text-neon-yellow text-3xl font-mono">{score}</p>
                </div>
                
                {score >= highScore && highScore > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="bg-purple-900/80 border border-purple-500 rounded-lg p-4"
                  >
                    <p className="text-purple-300 text-lg font-mono">🎉 NEW HIGH SCORE! 🎉</p>
                  </motion.div>
                )}
                
                <div className="bg-gray-900/80 border border-purple-600 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Data Packets Collected</p>
                  <p className="text-purple-300 text-2xl font-mono">
                    <Package className="inline w-6 h-6 mr-2" />
                    {dataPackets}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 pt-4">
                <button
                  onClick={onRestart}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xl font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 font-mono"
                >
                  RESTART
                </button>
                
                <button
                  onClick={() => {
                    const text = `I just ran ${distance}m and scored ${score} points in Byte Runner! Can you beat my score? #ByteRunner #CyberSecurity`
                    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
                    window.open(twitterUrl, '_blank')
                  }}
                  className="w-full bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white text-lg font-bold py-3 px-8 rounded-lg transition-all font-mono"
                >
                  SHARE ON TWITTER
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Tutorial hint (first 5 seconds) */}
      {distance < 100 && !isGameOver && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-20 left-0 right-0 flex justify-center pointer-events-none z-10"
        >
          <div className="bg-black/80 border border-cyan-600 rounded-lg px-6 py-3 max-w-sm">
            <p className="text-cyan-300 text-center font-mono">
              ← Swipe to change lanes | ↑ Tap to jump →
            </p>
          </div>
        </motion.div>
      )}
    </>
  )
}
