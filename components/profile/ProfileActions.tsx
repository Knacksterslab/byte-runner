import { LogOut, Star } from 'lucide-react'

interface ProfileActionsProps {
  continueTokens: number
  onSignOut: () => void
}

export function ProfileActions({ continueTokens, onSignOut }: ProfileActionsProps) {
  return (
    <>
      {continueTokens > 0 && (
        <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-2 border-purple-500/50 rounded-lg p-4 mb-8 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-purple-300 font-bold">Continue Tokens</p>
                <p className="text-xs text-gray-400">Earned from sharing!</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{continueTokens}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <a href="/contests" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 text-center">
          View Contests
        </a>
        <a href="/" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 text-center">
          Play Game
        </a>
      </div>

      <div className="text-center">
        <button
          onClick={onSignOut}
          className="text-gray-400 hover:text-gray-300 underline text-sm font-mono flex items-center gap-2 mx-auto transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </>
  )
}
