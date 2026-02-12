'use client'

import { useEffect, useState } from 'react'
import { getLeaderboard, getCurrentUser, type LeaderboardItem, type BackendUser } from '@/lib/api/backend'
import { Crown, Medal, User, Clock } from 'lucide-react'

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardItem[]>([])
  const [currentUser, setCurrentUser] = useState<BackendUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'24h'>('24h') // Future: add '7d', 'all'

  useEffect(() => {
    loadData()
  }, [filter])

  const loadData = async () => {
    setLoading(true)
    try {
      const [leaderboardData, userData] = await Promise.all([
        getLeaderboard(100),
        getCurrentUser().catch(() => null)
      ])
      setEntries(leaderboardData)
      setCurrentUser(userData)
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-6 h-6 text-yellow-400" />
    if (index === 1) return <Medal className="w-6 h-6 text-gray-300" />
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />
    return null
  }

  const isCurrentUser = (entry: LeaderboardItem) => {
    return currentUser?.username && entry.username === currentUser.username
  }

  const getCurrentUserRank = () => {
    if (!currentUser?.username) return null
    const rank = entries.findIndex(entry => entry.username === currentUser.username)
    return rank >= 0 ? rank + 1 : null
  }

  const currentUserRank = getCurrentUserRank()

  return (
    <div className="relative min-h-screen text-white overflow-hidden space-background">
      <div className="absolute inset-0 vignette pointer-events-none" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex flex-col items-center justify-center gap-4 mb-4">
            <img
              src="/logo.png"
              alt="Byte Runner"
              className="h-32 sm:h-40 md:h-44 w-auto drop-shadow-[0_0_38px_rgba(0,255,255,0.85)]"
            />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-cyan-400 to-blue-400 tracking-wide">
              🏆 Top Runs 🏆
            </h1>
          </div>
          <p className="text-gray-400 text-base sm:text-lg flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Last 24 hours
          </p>
        </div>

        {/* Current User Card */}
        {currentUser && currentUserRank && (
          <div className="mb-6 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border-2 border-cyan-500 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-cyan-300 font-mono">Your Best Rank</p>
                  <p className="text-xl font-bold text-white">#{currentUserRank} - {currentUser.username}</p>
                </div>
              </div>
              {currentUserRank <= 10 && (
                <div className="text-right">
                  <p className="text-xs text-yellow-300 font-mono">🏆 TOP 10</p>
                  <p className="text-xs text-gray-400">Eligible for prizes!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filter tabs - for future */}
        {/* <div className="flex gap-2 mb-6 justify-center">
          <button className="px-4 py-2 bg-cyan-600 text-white rounded font-mono text-sm">24H</button>
          <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded font-mono text-sm">7D</button>
          <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded font-mono text-sm">ALL TIME</button>
        </div> */}

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent"></div>
            <p className="text-gray-400 mt-4 font-mono">Loading leaderboard...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 bg-black/40 border-2 border-cyan-700/50 rounded-lg backdrop-blur-sm">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-gray-400 text-lg font-mono">No runs yet. Be the first!</p>
            <a 
              href="/"
              className="inline-block mt-6 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105"
            >
              Start Playing
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => {
              const isUser = isCurrentUser(entry)
              return (
                <div
                  key={`${entry.username}-${entry.createdAt}-${index}`}
                  className={`
                    flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg font-mono transition-all
                    ${isUser 
                      ? 'bg-cyan-900/60 border-2 border-cyan-400 shadow-lg shadow-cyan-500/20' 
                      : 'bg-gray-900/40 border-2 border-gray-700 hover:border-gray-600'
                    }
                    ${index < 3 ? 'shadow-xl' : ''}
                  `}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-12 sm:w-16 flex-shrink-0">
                    {getRankIcon(index) || (
                      <span className={`text-lg sm:text-xl font-bold ${isUser ? 'text-cyan-300' : 'text-gray-400'}`}>
                        #{index + 1}
                      </span>
                    )}
                  </div>

                  {/* Username */}
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    {entry.badgeEmoji && (
                      <span className="text-xl" title="Featured Badge">{entry.badgeEmoji}</span>
                    )}
                    <p className={`text-base sm:text-lg font-bold truncate ${
                      isUser ? 'text-cyan-300' : index < 3 ? 'text-yellow-300' : 'text-white'
                    }`}>
                      {entry.username}
                      {isUser && <span className="ml-2 text-xs text-cyan-500">(You)</span>}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-6 text-right">
                    <div>
                      <p className="text-xs text-gray-400">Score</p>
                      <p className="text-lg sm:text-xl font-bold text-yellow-400">{entry.score.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Distance</p>
                      <p className="text-sm sm:text-base text-gray-300">{entry.distance}m</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="/"
            className="text-cyan-400 hover:text-cyan-300 underline text-base sm:text-lg transition-colors font-mono"
          >
            ← Back to Game
          </a>
          {!currentUser && (
            <>
              <span className="text-gray-600">•</span>
              <p className="text-gray-400 text-sm font-mono">
                Sign in to save your scores!
              </p>
            </>
          )}
        </div>

        {/* Coming soon banner */}
        <div className="mt-8 text-center bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-2 border-purple-600/50 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-purple-300 font-mono text-sm">
            🏆 <strong>Prize Contests</strong> coming soon! Top 10 players will win rewards. Stay tuned!
          </p>
        </div>
      </div>

      <style jsx>{`
        .space-background {
          background-image: url('/space-background.png');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          background-color: #05070d;
        }
        
        .vignette {
          background: radial-gradient(circle at 50% 40%, transparent 0%, rgba(2, 4, 10, 0.85) 70%);
        }
      `}</style>
    </div>
  )
}
