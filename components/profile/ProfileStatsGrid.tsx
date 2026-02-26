import { Trophy, Target, TrendingUp, Shield } from 'lucide-react'

interface ProfileStatsGridProps {
  bestScore: number
  bestDistance: number
  rank: number | null
  totalRuns: number
}

export function ProfileStatsGrid({ bestScore, bestDistance, rank, totalRuns }: ProfileStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-600/50 rounded-lg p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h3 className="text-sm font-mono text-yellow-300">BEST SCORE</h3>
        </div>
        <p className="text-3xl sm:text-4xl font-bold text-white">{bestScore.toLocaleString()}</p>
      </div>

      <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-2 border-cyan-600/50 rounded-lg p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-6 h-6 text-cyan-400" />
          <h3 className="text-sm font-mono text-cyan-300">BEST DISTANCE</h3>
        </div>
        <p className="text-3xl sm:text-4xl font-bold text-white">{bestDistance}m</p>
      </div>

      <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-600/50 rounded-lg p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6 text-purple-400" />
          <h3 className="text-sm font-mono text-purple-300">LEADERBOARD RANK</h3>
        </div>
        <p className="text-3xl sm:text-4xl font-bold text-white">
          {rank ? `#${rank}` : 'Unranked'}
        </p>
        {rank && rank <= 10 && (
          <p className="text-xs text-yellow-300 mt-2 font-mono">🏆 Top 10 Player!</p>
        )}
      </div>

      <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-600/50 rounded-lg p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-green-400" />
          <h3 className="text-sm font-mono text-green-300">TOTAL RUNS (24H)</h3>
        </div>
        <p className="text-3xl sm:text-4xl font-bold text-white">{totalRuns}</p>
      </div>
    </div>
  )
}
