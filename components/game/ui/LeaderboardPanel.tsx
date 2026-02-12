'use client'

import { useEffect } from 'react'
import { useGameStore, type LeaderboardEntry } from '@/lib/store/gameStore'

interface LeaderboardPanelProps {
  title?: string
  maxEntries?: number
  entries?: LeaderboardEntry[]
  loading?: boolean
  className?: string
}

export function LeaderboardPanel({
  title = 'Top Runs',
  maxEntries = 5,
  entries,
  loading = false,
  className
}: LeaderboardPanelProps) {
  const leaderboard = useGameStore((state) => state.leaderboard)
  const ensureLeaderboardSeeded = useGameStore((state) => state.ensureLeaderboardSeeded)
  const visibleEntries = (entries ?? leaderboard).slice(0, maxEntries)

  useEffect(() => {
    if (!entries) {
      ensureLeaderboardSeeded()
    }
  }, [ensureLeaderboardSeeded, entries])

  return (
    <div className={className}>
      <div 
        className="bg-black/80 border-2 border-cyan-600 rounded-lg px-4 py-4 backdrop-blur-sm"
        style={{
          boxShadow: '0 0 15px rgba(0, 255, 255, 0.2), inset 0 0 15px rgba(0, 255, 255, 0.05)'
        }}
      >
        <p 
          className="text-cyan-400 font-bold text-base md:text-lg mb-3 tracking-wider"
          style={{
            textShadow: '0 0 8px rgba(0, 255, 255, 0.5)'
          }}
        >
          — {title} —
        </p>
        {loading ? (
          <p className="text-gray-400 text-xs">Loading leaderboard...</p>
        ) : visibleEntries.length === 0 ? (
          <p className="text-gray-400 text-xs">No runs yet. Be the first!</p>
        ) : (
          <div className="space-y-1.5 text-xs md:text-sm text-gray-200 font-mono">
            {visibleEntries.map((entry, index) => (
              <div key={entry.id} className="flex justify-between gap-3">
                <span className="text-cyan-400 font-bold">#{index + 1}</span>
                <span className="flex-1 text-left">
                  <span className={entry.isPlayer ? 'text-yellow-300 font-bold' : 'text-cyan-200'}>
                    {entry.name}
                  </span>
                </span>
                <span className="text-gray-300">{entry.score} pts</span>
                <span className="text-gray-400">{entry.distance}m</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
