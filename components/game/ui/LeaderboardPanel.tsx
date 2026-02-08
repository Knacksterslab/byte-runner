'use client'

import { useEffect } from 'react'
import { useGameStore } from '@/lib/store/gameStore'

interface LeaderboardPanelProps {
  title?: string
  maxEntries?: number
  className?: string
}

export function LeaderboardPanel({
  title = 'Top Runs',
  maxEntries = 5,
  className
}: LeaderboardPanelProps) {
  const leaderboard = useGameStore((state) => state.leaderboard)
  const ensureLeaderboardSeeded = useGameStore((state) => state.ensureLeaderboardSeeded)
  const entries = leaderboard.slice(0, maxEntries)

  useEffect(() => {
    ensureLeaderboardSeeded()
  }, [ensureLeaderboardSeeded])

  return (
    <div className={className}>
      <div className="bg-black/80 border border-cyan-700 rounded-lg px-4 py-3 backdrop-blur-sm">
        <p className="text-cyan-400 font-bold text-sm mb-2">{title}</p>
        {entries.length === 0 ? (
          <p className="text-gray-400 text-xs">No runs yet. Be the first!</p>
        ) : (
          <div className="space-y-1 text-xs text-gray-200 font-mono">
            {entries.map((entry, index) => (
              <div key={entry.id} className="flex justify-between gap-2">
                <span className="text-cyan-300">#{index + 1}</span>
                <span className="flex-1 text-left">
                  <span className={entry.isPlayer ? 'text-yellow-300' : 'text-gray-200'}>
                    {entry.name}
                  </span>
                </span>
                <span className="text-gray-400">{entry.score} pts</span>
                <span className="text-gray-400">{entry.distance}m</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
