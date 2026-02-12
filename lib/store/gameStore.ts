import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GhostPlayer } from '@/lib/game/ghostPlayers'
import { getRandomGhostPlayer } from '@/lib/game/ghostPlayers'

export interface LeaderboardEntry {
  id: string
  name: string
  score: number
  distance: number
  createdAt: number
  isPlayer?: boolean
}

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
  leaderboard: LeaderboardEntry[]
  
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
  addLeaderboardEntry: (entry: Omit<LeaderboardEntry, 'id' | 'createdAt'>) => void
  setLeaderboard: (entries: LeaderboardEntry[]) => void
  ensureLeaderboardSeeded: () => void
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
      leaderboard: [],
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

      addLeaderboardEntry: (entry) => {
        const newEntry: LeaderboardEntry = {
          id: `score_${Date.now()}_${Math.random()}`,
          name: entry.name,
          score: entry.score,
          distance: entry.distance,
          createdAt: Date.now(),
          isPlayer: entry.isPlayer
        }
        const next = [...get().leaderboard, newEntry]
          .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score
            if (b.distance !== a.distance) return b.distance - a.distance
            return a.createdAt - b.createdAt
          })
          .slice(0, 10)
        set({ leaderboard: next })
      },

      setLeaderboard: (entries) => {
        set({ leaderboard: entries })
      },

      ensureLeaderboardSeeded: () => {
        const current = get().leaderboard
        if (current.length > 0) {
          const normalized = current.map((entry) => ({
            ...entry,
            name: entry.name || 'You'
          }))
          if (normalized.some((entry, i) => entry.name !== current[i].name)) {
            set({ leaderboard: normalized })
          }
          return
        }

        const ghostEntries: LeaderboardEntry[] = Array.from({ length: 8 }, () => {
          const ghost = getRandomGhostPlayer()
          const score = Math.floor(200 + Math.random() * 2800)
          const distance = Math.floor(150 + Math.random() * 2200)
          return {
            id: `ghost_${Date.now()}_${Math.random()}`,
            name: ghost.name,
            score,
            distance,
            createdAt: Date.now(),
            isPlayer: false
          }
        })

        const seeded = ghostEntries
          .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score
            if (b.distance !== a.distance) return b.distance - a.distance
            return a.createdAt - b.createdAt
          })
          .slice(0, 10)
        set({ leaderboard: seeded })
      },
      
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
      partialize: (state) => ({
        highScore: state.highScore,
        leaderboard: state.leaderboard
      }),
    }
  )
)
