import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GhostPlayer } from '@/lib/game/ghostPlayers'

interface GameStore {
  // Game state
  distance: number
  score: number
  speed: number
  isRunning: boolean
  isPaused: boolean
  isGameOver: boolean
  dataPackets: number
  highScore: number
  
  // Ghost player tracking
  lastAttacker: GhostPlayer | null
  lastThreatType: string | null
  
  // Quiz/Continue state
  showingQuiz: boolean
  quizPassed: boolean | null
  savedGameState: {
    level: number
    kits: { [key: string]: number }
    score: number
  } | null
  
  // Actions
  setDistance: (distance: number) => void
  setScore: (score: number) => void
  addScore: (delta: number) => void
  setSpeed: (speed: number) => void
  setRunning: (running: boolean) => void
  setPaused: (paused: boolean) => void
  setGameOver: (gameOver: boolean) => void
  addDataPacket: () => void
  setLastAttacker: (attacker: GhostPlayer, threatType: string) => void
  setShowingQuiz: (showing: boolean) => void
  setQuizPassed: (passed: boolean) => void
  setSavedGameState: (state: { level: number; kits: { [key: string]: number }; score: number } | null) => void
  resetGame: () => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      distance: 0,
      score: 0,
      speed: 5,
      isRunning: false,
      isPaused: false,
      isGameOver: false,
      dataPackets: 0,
      highScore: 0,
      lastAttacker: null,
      lastThreatType: null,
      showingQuiz: false,
      quizPassed: null,
      savedGameState: null,
      
      setDistance: (distance) => set({ distance }),
      
      setScore: (score) => {
        const { highScore } = get()
        set({ 
          score,
          highScore: Math.max(score, highScore)
        })
      },
      
      addScore: (delta) => {
        const { score, highScore } = get()
        const newScore = score + delta
        set({ 
          score: newScore,
          highScore: Math.max(newScore, highScore)
        })
      },
      
      setSpeed: (speed) => set({ speed }),
      setRunning: (running) => set({ isRunning: running }),
      setPaused: (paused) => set({ isPaused: paused }),
      
      setGameOver: (gameOver) => {
        if (gameOver) {
          set({ isGameOver: true, isRunning: false })
        } else {
          set({ isGameOver: false })
        }
      },
      
      addDataPacket: () => set((state) => ({ 
        dataPackets: state.dataPackets + 1 
      })),
      
      setLastAttacker: (attacker, threatType) => set({
        lastAttacker: attacker,
        lastThreatType: threatType
      }),
      
      setShowingQuiz: (showing) => set({ showingQuiz: showing }),
      
      setQuizPassed: (passed) => set({ quizPassed: passed }),
      
      setSavedGameState: (state) => set({ savedGameState: state }),
      
      resetGame: () => set({
        distance: 0,
        score: 0,
        speed: 5,
        isRunning: false,
        isPaused: false,
        isGameOver: false,
        dataPackets: 0,
        lastAttacker: null,
        lastThreatType: null,
        showingQuiz: false,
        quizPassed: null,
        savedGameState: null,
      }),
    }),
    {
      name: 'byte-runner-storage',
      partialize: (state) => ({ highScore: state.highScore }),
    }
  )
)
