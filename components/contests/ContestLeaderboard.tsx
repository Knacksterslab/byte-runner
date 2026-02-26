import { Trophy } from 'lucide-react'
import { Crown, Medal } from 'lucide-react'
import type { ContestLeaderboardEntry } from '@/lib/api/backend'

interface ContestLeaderboardProps {
  entries: ContestLeaderboardEntry[]
  currentUsername?: string
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />
  return null
}

export function ContestLeaderboard({ entries, currentUsername }: ContestLeaderboardProps) {
  return (
    <div className="bg-gray-900/40 border-2 border-cyan-700/50 rounded-lg p-6 backdrop-blur-sm mb-8">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
        <Trophy className="w-6 h-6" />
        Leaderboard
      </h2>
      {entries.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No entries yet. Be the first!</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const isMe = currentUsername === entry.username
            return (
              <div
                key={`${entry.username}-${entry.createdAt}`}
                className={`flex items-center gap-4 p-4 rounded-lg ${isMe ? 'bg-cyan-900/60 border-2 border-cyan-400' : 'bg-gray-800/40'}`}
              >
                <div className="w-12 flex items-center justify-center">
                  {entry.rank <= 3 ? (
                    <RankIcon rank={entry.rank} />
                  ) : (
                    <span className="text-gray-400 font-bold">#{entry.rank}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-bold ${entry.rank <= 3 ? 'text-yellow-300' : 'text-white'}`}>
                    {entry.username}
                    {isMe && <span className="ml-2 text-xs text-cyan-400">(You)</span>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-bold text-lg">{entry.score.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm">{entry.distance}m</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
