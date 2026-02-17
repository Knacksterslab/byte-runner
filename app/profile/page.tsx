'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getLeaderboard, signOut, getAllBadges, getMyBadges, setFeaturedBadge, getMyBalance, getMyStats, type BackendUser, type LeaderboardItem, type Badge, type UserBadge, type BalanceInfo } from '@/lib/api/backend'
import { User, Trophy, TrendingUp, Target, Shield, LogOut, Mail, Award, Star, DollarSign, TrendingDown, Clock } from 'lucide-react'
import dynamic from 'next/dynamic'
import { PageWrapper } from '@/components/PageWrapper'
import Link from 'next/link'

const WithdrawalModal = dynamic(() => import('@/components/WithdrawalModal'), { ssr: false })

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
  const [balance, setBalance] = useState<BalanceInfo | null>(null)
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
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

      // Get badges, balance, and user stats
      const [allBadgesData, myBadgesData, balanceData, myStats] = await Promise.all([
        getAllBadges(),
        getMyBadges(),
        getMyBalance().catch(() => null), // Don't fail if balance service unavailable
        getMyStats().catch(() => null) // Don't fail if no runs yet
      ])
      setAllBadges(allBadgesData)
      setMyBadges(myBadgesData)
      if (balanceData) setBalance(balanceData)
      
      // Set user stats from direct query
      if (myStats) {
        setUserStats({
          bestScore: myStats.bestScore,
          bestDistance: myStats.bestDistance,
          rank: myStats.rank,
          totalRuns: myStats.totalRuns
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
      <PageWrapper className="relative text-white flex items-center justify-center space-background">
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
      </PageWrapper>
    )
  }

  if (!currentUser) {
    return null // Will redirect
  }

  return (
    <PageWrapper className="relative text-white space-background">
      <div className="absolute inset-0 vignette pointer-events-none" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-12 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/">
            <img
              src="/logo.png"
              alt="Byte Runner"
              className="h-16 sm:h-20 w-auto mx-auto drop-shadow-[0_0_30px_rgba(0,255,255,0.85)] cursor-pointer hover:scale-105 transition-transform"
            />
          </Link>
        </div>
        
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

        {/* Earnings Dashboard */}
        {balance && (
          <div className="bg-gray-900/30 border-2 border-green-600 rounded-lg p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-green-400 mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Earnings Dashboard
            </h2>

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-600/50 rounded-lg p-6 mb-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-green-300 font-mono mb-1">CURRENT BALANCE</p>
                  <p className="text-4xl font-bold text-white">
                    ${(balance.balanceCents / 100).toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-green-400 opacity-50" />
              </div>

              {/* Progress to Withdrawal */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>Progress to Withdrawal</span>
                  <span>{Math.min(100, Math.floor((balance.balanceCents / 1000) * 100))}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (balance.balanceCents / 1000) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {balance.balanceCents >= 1000 
                    ? '✓ Minimum reached! You can withdraw.' 
                    : `Need $${((1000 - balance.balanceCents) / 100).toFixed(2)} more (Minimum: $10.00)`
                  }
                </p>
              </div>

              <button
                onClick={() => setShowWithdrawalModal(true)}
                disabled={balance.balanceCents < 1000}
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  balance.balanceCents >= 1000
                    ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {balance.balanceCents >= 1000 ? 'Withdraw Funds' : 'Withdrawal Unavailable'}
              </button>
            </div>

            {/* Earnings Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Total Earned</p>
                <p className="text-2xl font-bold text-green-400">
                  ${(balance.totalEarnedCents / 100).toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Pending Withdrawals</p>
                <p className="text-2xl font-bold text-yellow-400">
                  ${(balance.pendingWithdrawalsCents / 100).toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Available</p>
                <p className="text-2xl font-bold text-white">
                  ${(balance.balanceCents / 100).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Recent Transactions */}
            {balance.recentTransactions && balance.recentTransactions.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Transactions
                </h3>
                <div className="space-y-2">
                  {balance.recentTransactions.slice(0, 5).map((tx) => (
                    <div 
                      key={tx.id} 
                      className="flex items-center justify-between bg-gray-800/30 border border-gray-700 rounded p-3"
                    >
                      <div className="flex items-center gap-3">
                        {tx.amountCents > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <div>
                          <p className="text-sm text-white font-mono">{tx.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className={`font-bold ${tx.amountCents > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.amountCents > 0 ? '+' : ''}${(tx.amountCents / 100).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Coming Soon */}
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
              <p className="text-sm text-blue-300">
                <span className="font-bold">Coming Soon:</span> Partner deals - Sign up for premium services and earn more!
              </p>
            </div>
          </div>
        )}

        {/* Withdrawal Modal */}
        {showWithdrawalModal && balance && (
          <WithdrawalModal
            currentBalance={balance.balanceCents}
            onClose={() => setShowWithdrawalModal(false)}
            onSuccess={() => {
              setShowWithdrawalModal(false)
              loadProfile() // Reload to get updated balance
            }}
          />
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
    </PageWrapper>
  )
}
