'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getLeaderboard, signOut, getAllBadges, getMyBadges, setFeaturedBadge, type BackendUser, type LeaderboardItem, type Badge, type UserBadge } from '@/lib/api/backend'
import { User, Trophy, TrendingUp, Target, Shield, LogOut, Mail, Award, Star } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<BackendUser | null>(null)
  const [userStats, setUserStats] = useState<{
    bestScore: number
    bestDistance: number
    rank: number | null
    totalRuns: number
  }>({
    bestScore: 0,
    bestDistance: 0,
    rank: null,
    totalRuns: 0
  })
  const [allBadges, setAllBadges] = useState<Badge[]>([])
  const [myBadges, setMyBadges] = useState<UserBadge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const user = await getCurrentUser()
      if (!user) {
        // Not logged in, redirect to home
        router.push('/')
        return
      }
      setCurrentUser(user)

      // Get badges
      const [allBadgesData, myBadgesData, leaderboard] = await Promise.all([
        getAllBadges(),
        getMyBadges(),
        getLeaderboard(100)
      ])
      setAllBadges(allBadgesData)
      setMyBadges(myBadgesData)

      // Get user stats from leaderboard
      const userEntries = leaderboard.filter(entry => entry.username === user.username)
      
      if (userEntries.length > 0) {
        const bestScore = Math.max(...userEntries.map(e => e.score))
        const bestDistance = Math.max(...userEntries.map(e => e.distance))
        const rank = leaderboard.findIndex(entry => entry.username === user.username && entry.score === bestScore)
        
        setUserStats({
          bestScore,
          bestDistance,
          rank: rank >= 0 ? rank + 1 : null,
          totalRuns: userEntries.length
        })
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen text-white flex items-center justify-center overflow-hidden space-background">
        <div className="relative z-10 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent"></div>
          <p className="text-gray-400 mt-4 font-mono">Loading profile...</p>
        </div>
        <style jsx>{`
          .space-background {
            background-image: url('/space-background.png');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            background-color: #05070d;
          }
        `}</style>
      </div>
    )
  }

  if (!currentUser) {
    return null // Will redirect
  }

  return (
    <div className="relative min-h-screen text-white overflow-hidden space-background">
      <div className="absolute inset-0 vignette pointer-events-none" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-4 shadow-lg shadow-cyan-500/50">
            <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-400 mb-2">
            {currentUser.username || 'Player'}
          </h1>
          <p className="text-gray-400 text-sm font-mono flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" />
            Account created {new Date(currentUser.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Best Score */}
          <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-600/50 rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h3 className="text-sm font-mono text-yellow-300">BEST SCORE</h3>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-white">{userStats.bestScore.toLocaleString()}</p>
          </div>

          {/* Best Distance */}
          <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-2 border-cyan-600/50 rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-6 h-6 text-cyan-400" />
              <h3 className="text-sm font-mono text-cyan-300">BEST DISTANCE</h3>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-white">{userStats.bestDistance}m</p>
          </div>

          {/* Leaderboard Rank */}
          <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-600/50 rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <h3 className="text-sm font-mono text-purple-300">LEADERBOARD RANK</h3>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-white">
              {userStats.rank ? `#${userStats.rank}` : 'Unranked'}
            </p>
            {userStats.rank && userStats.rank <= 10 && (
              <p className="text-xs text-yellow-300 mt-2 font-mono">🏆 Top 10 Player!</p>
            )}
          </div>

          {/* Total Runs */}
          <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-600/50 rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6 text-green-400" />
              <h3 className="text-sm font-mono text-green-300">TOTAL RUNS (24H)</h3>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-white">{userStats.totalRuns}</p>
          </div>
        </div>

        {/* Continue Tokens */}
        {currentUser.continueTokens > 0 && (
          <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-2 border-purple-500/50 rounded-lg p-4 mb-8 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-yellow-400" />
                <div>
                  <p className="text-purple-300 font-bold">Continue Tokens</p>
                  <p className="text-xs text-gray-400">Earned from sharing!</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-yellow-400">{currentUser.continueTokens}</p>
            </div>
          </div>
        )}

        {/* Achievements Section */}
        <div className="bg-gray-900/30 border-2 border-gray-700 rounded-lg p-6 mb-8 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Badges ({myBadges.length}/{allBadges.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {allBadges.map((badge) => {
              const earned = myBadges.find(ub => ub.badge_id === badge.id)
              const isFeatured = currentUser.featuredBadge === badge.id
              
              return (
                <button
                  key={badge.id}
                  onClick={() => earned && setFeaturedBadge(badge.id)}
                  disabled={!earned}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all
                    ${earned 
                      ? 'bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-600/50 hover:scale-105 cursor-pointer' 
                      : 'bg-gray-800/40 border-gray-700/50 opacity-40 cursor-not-allowed'
                    }
                    ${isFeatured ? 'ring-2 ring-cyan-400' : ''}
                  `}
                  title={earned ? 'Click to set as featured badge' : 'Not earned yet'}
                >
                  {isFeatured && (
                    <div className="absolute -top-2 -right-2 bg-cyan-500 rounded-full p-1">
                      <Star className="w-4 h-4 text-white" fill="currentColor" />
                    </div>
                  )}
                  <div className="text-4xl mb-2">{badge.emoji}</div>
                  <p className={`text-xs font-bold ${earned ? 'text-yellow-300' : 'text-gray-500'}`}>
                    {badge.name}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">{badge.description}</p>
                  {earned && (
                    <p className="text-[9px] text-gray-500 mt-1">
                      {new Date(earned.earned_at).toLocaleDateString()}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
          {myBadges.length === 0 && (
            <p className="text-center text-gray-400 mt-4 text-sm">
              Play and share to earn badges!
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a
            href="/contests"
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 text-center"
          >
            View Contests
          </a>
          <a
            href="/"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 text-center"
          >
            Play Game
          </a>
        </div>

        {/* Sign Out */}
        <div className="text-center">
          <button
            onClick={handleSignOut}
            className="text-gray-400 hover:text-gray-300 underline text-sm font-mono flex items-center gap-2 mx-auto transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
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
