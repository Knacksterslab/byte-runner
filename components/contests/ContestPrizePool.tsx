import { Trophy } from 'lucide-react'

interface ContestPrizePoolProps {
  prizePool: Record<string, string>
}

export function ContestPrizePool({ prizePool }: ContestPrizePoolProps) {
  return (
    <div className="mb-8 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-2 border-yellow-600/50 rounded-lg p-6 backdrop-blur-sm">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
        <Trophy className="w-6 h-6" />
        Prize Pool
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(prizePool).map(([rank, prize]) => (
          <div key={rank} className="bg-black/40 rounded-lg p-4 border border-yellow-600/30">
            <div className="text-yellow-300 font-bold text-lg">#{rank}</div>
            <div className="text-white text-xl">{prize}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
