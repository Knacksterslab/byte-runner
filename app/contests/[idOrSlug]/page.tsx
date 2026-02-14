'use client'

import { useEffect, useState } from 'react'
import { getContest, getContestLeaderboard, getMyContestEntries, getCurrentUser, getMyClaimForContest, submitPrizeClaim, type Contest, type ContestLeaderboardEntry, type BackendUser, type PrizeClaim } from '@/lib/api/backend'
import { Trophy, Calendar, Clock, Crown, Medal, User, Award } from 'lucide-react'
import Link from 'next/link'
import { PrizeClaimModal } from '@/components/PrizeClaimModal'

export default function ContestDetailPage({ params }: { params: { idOrSlug: string } }) {
  const contestId = params.idOrSlug
  
  const [contest, setContest] = useState<Contest | null>(null)
  const [leaderboard, setLeaderboard] = useState<ContestLeaderboardEntry[]>([])
  const [currentUser, setCurrentUser] = useState<BackendUser | null>(null)
  const [myEntries, setMyEntries] = useState<any>(null)
  const [myClaim, setMyClaim] = useState<PrizeClaim | null>(null)
  const [loading, setLoading] = useState(true)
  const [showClaimModal, setShowClaimModal] = useState(false)

  useEffect(() => {
    loadContestData()
  }, [contestId])

  // Auto-refresh polling to detect when contest ends
  useEffect(() => {
    if (!contest) return

    // Only poll if contest is active or upcoming
    if (contest.status !== 'active' && contest.status !== 'upcoming') return

    const checkContestStatus = async () => {
      try {
        const now = new Date()
        const endDate = new Date(contest.end_date)
        
        // If end time has passed and contest is still marked active, check backend
        if (now > endDate && contest.status === 'active') {
          console.log('⏰ Contest end time passed, checking for status update...')
          const updatedContest = await getContest(contestId)
          
          // If backend shows it's ended, reload all data
          if (updatedContest.status === 'ended') {
            console.log('✅ Contest is now ended! Reloading data...')
            await loadContestData()
          }
        }
      } catch (error) {
        console.error('Failed to check contest status:', error)
      }
    }

    // Poll every 30 seconds
    const interval = setInterval(checkContestStatus, 30000)

    // Also check immediately if end time has already passed
    const now = new Date()
    const endDate = new Date(contest.end_date)
    if (now > endDate && contest.status === 'active') {
      checkContestStatus()
    }

    return () => clearInterval(interval)
  }, [contest, contestId])

  const loadContestData = async () => {
    setLoading(true)
    try {
      const [contestData, leaderboardData, userData] = await Promise.all([
        getContest(contestId),
        getContestLeaderboard(contestId, 100),
        getCurrentUser().catch(() => null),
      ])

      setContest(contestData)
      setLeaderboard(leaderboardData)
      setCurrentUser(userData)

      if (userData) {
        const entries = await getMyContestEntries(contestId)
        setMyEntries(entries)

        const claim = await getMyClaimForContest(contestId)
        setMyClaim(claim)
      }
    } catch (error) {
      console.error('Failed to load contest:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeRemaining = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diff = end.getTime() - now.getTime()
    
    if (diff < 0) return null
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return { days, hours, minutes }
  }

  const formatInTimeZone = (iso: string, timeZone: string) =>
    new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone,
    }).format(new Date(iso))

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />
    return null
  }

  const handleClaimPrize = async (claimData: any) => {
    if (!myClaim) return

    try {
      const contactInfo = {
        payment_method: claimData.paymentMethod,
        email: claimData.email,
        ...(claimData.usdtWallet && {
          usdt_wallet: claimData.usdtWallet,
          usdt_network: claimData.usdtNetwork
        })
      }

      await submitPrizeClaim(myClaim.id, contactInfo)
      
      // Reload claim data
      const updatedClaim = await getMyClaimForContest(contestId)
      setMyClaim(updatedClaim)

      alert('Prize claim submitted successfully! Check your email for confirmation.')
    } catch (error: any) {
      throw new Error(error.message || 'Failed to submit claim')
    }
  }

  const getUserPrize = () => {
    if (!contest?.prize_pool || !myEntries?.rank) return null
    
    const rank = myEntries.rank.toString()
    // Check for exact match first
    if (contest.prize_pool[rank]) {
      return { rank: myEntries.rank, prize: contest.prize_pool[rank] }
    }
    
    // Check for range (e.g., "4-10")
    for (const [key, value] of Object.entries(contest.prize_pool)) {
      if (key.includes('-')) {
        const [start, end] = key.split('-').map(Number)
        if (myEntries.rank >= start && myEntries.rank <= end) {
          return { rank: myEntries.rank, prize: value }
        }
      }
    }
    
    return null
  }

  const userPrize = getUserPrize()

  const timeRemaining = contest ? getTimeRemaining(contest.end_date) : null

  if (loading) {
    return (
      <div className="relative min-h-screen text-white flex items-center justify-center overflow-y-auto overflow-x-hidden space-background" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="relative z-10 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent"></div>
          <p className="text-gray-400 mt-4 font-mono">Loading contest...</p>
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

  if (!contest) {
    return (
      <div className="relative min-h-screen text-white flex items-center justify-center overflow-y-auto overflow-x-hidden space-background" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="relative z-10 text-center">
          <p className="text-gray-400 text-lg">Contest not found</p>
          <a href="/contests" className="text-cyan-400 hover:text-cyan-300 underline mt-4 inline-block">
            ← Back to Contests
          </a>
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

  return (
    <div className="relative min-h-screen text-white overflow-y-auto overflow-x-hidden space-background" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
      <div className="absolute inset-0 vignette pointer-events-none" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 pb-20">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
          <span>→</span>
          <Link href="/contests" className="hover:text-cyan-400 transition-colors">Contests</Link>
          <span>→</span>
          <span className="text-cyan-400">{contest.name}</span>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Byte Runner"
            className="h-20 sm:h-24 w-auto drop-shadow-[0_0_38px_rgba(0,255,255,0.85)] mx-auto mb-4"
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-2">{contest.name}</h1>
          {contest.description && (
            <p className="text-gray-300 max-w-2xl mx-auto">{contest.description}</p>
          )}
        </div>

        {/* Status and Countdown */}
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          {contest.status === 'active' && timeRemaining && (
            <div className="bg-green-900/40 border-2 border-green-500/50 rounded-lg px-6 py-4 backdrop-blur-sm">
              <p className="text-green-400 font-bold text-sm mb-2">⏰ Time Remaining:</p>
              <div className="flex gap-4 font-mono text-2xl">
                <div className="text-center">
                  <div className="text-white font-bold">{timeRemaining.days}</div>
                  <div className="text-xs text-gray-400">Days</div>
                </div>
                <div className="text-white">:</div>
                <div className="text-center">
                  <div className="text-white font-bold">{timeRemaining.hours}</div>
                  <div className="text-xs text-gray-400">Hours</div>
                </div>
                <div className="text-white">:</div>
                <div className="text-center">
                  <div className="text-white font-bold">{timeRemaining.minutes}</div>
                  <div className="text-xs text-gray-400">Mins</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Contest ended but still being finalized */}
          {contest.status === 'active' && !timeRemaining && (
            <div className="bg-blue-900/40 border-2 border-blue-500/50 rounded-lg px-6 py-4 backdrop-blur-sm animate-pulse">
              <p className="text-blue-300 font-bold text-sm mb-1">⏳ Contest Ended!</p>
              <p className="text-gray-300 text-xs">Finalizing results and creating prize claims...</p>
            </div>
          )}
          
          {contest.status === 'ended' && (
            <div className="bg-red-900/40 border-2 border-red-500/50 rounded-lg px-6 py-4 backdrop-blur-sm">
              <p className="text-red-300 font-bold text-sm">🏁 Contest Ended</p>
            </div>
          )}
        </div>

        {/* Play to Enter Button (Active contests only) */}
        {contest.status === 'active' && (
          <div className="mb-8 text-center">
            <Link href="/?play=true">
              <button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:shadow-[0_0_40px_rgba(34,211,238,0.7)] transition-all transform hover:scale-105 active:scale-95">
                🎮 Play to Enter Contest
              </button>
            </Link>
            {myEntries && myEntries.entries.length > 0 && (
              <p className="text-gray-400 text-sm mt-3">
                You've already entered! Play again to improve your rank.
              </p>
            )}
          </div>
        )}

        <div className="mb-8 bg-gray-900/45 border border-cyan-700/40 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-cyan-300 font-semibold mb-2">Contest Schedule</p>
          <p className="text-gray-200 text-sm">
            Your time: {new Date(contest.start_date).toLocaleString()} → {new Date(contest.end_date).toLocaleString()}
          </p>
          <p className="text-cyan-200/90 text-sm mt-1">
            Official ({contest.contest_timezone || 'UTC'}): {formatInTimeZone(contest.start_date, contest.contest_timezone || 'UTC')} → {formatInTimeZone(contest.end_date, contest.contest_timezone || 'UTC')}
          </p>
        </div>

        {/* Prize Pool */}
        {contest.prize_pool && (
          <div className="mb-8 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-2 border-yellow-600/50 rounded-lg p-6 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Prize Pool
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(contest.prize_pool).map(([rank, prize]) => (
                <div key={rank} className="bg-black/40 rounded-lg p-4 border border-yellow-600/30">
                  <div className="text-yellow-300 font-bold text-lg">#{rank}</div>
                  <div className="text-white text-xl">{prize}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Your Status (if logged in) */}
        {currentUser && myEntries && (
          <div className="mb-8 bg-gradient-to-br from-cyan-900/40 to-blue-900/30 border-2 border-cyan-400/60 rounded-lg p-6 backdrop-blur-sm shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            <h2 className="text-2xl font-bold text-cyan-300 mb-6 flex items-center gap-2">
              <User className="w-6 h-6" />
              Your Contest Status
            </h2>
            
            {/* Prominent Rank Display */}
            {myEntries.rank && (
              <div className="mb-6 text-center bg-cyan-500/20 border-2 border-cyan-400/50 rounded-xl py-6 px-4">
                <p className="text-cyan-300 text-sm font-semibold mb-2">CURRENT RANK</p>
                <p className="text-5xl sm:text-6xl font-black text-white mb-2">
                  #{myEntries.rank}
                </p>
                <p className="text-gray-300 text-sm">
                  out of {leaderboard.length} {leaderboard.length === 1 ? 'player' : 'players'}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-black/30 rounded-lg p-4 border border-cyan-500/30">
                <p className="text-gray-400 text-sm mb-1">Entries Submitted</p>
                <p className="text-3xl font-bold text-white">{myEntries.entries.length}</p>
              </div>
              <div className="bg-black/30 rounded-lg p-4 border border-cyan-500/30">
                <p className="text-gray-400 text-sm mb-1">Best Score</p>
                <p className="text-3xl font-bold text-white">
                  {myEntries.entries.length > 0 ? myEntries.entries[0].score.toLocaleString() : '—'}
                </p>
              </div>
              <div className="bg-black/30 rounded-lg p-4 border border-cyan-500/30">
                <p className="text-gray-400 text-sm mb-1">Best Distance</p>
                <p className="text-3xl font-bold text-white">
                  {myEntries.entries.length > 0 ? `${myEntries.entries[0].distance}m` : '—'}
                </p>
              </div>
            </div>

            {/* Prize Claim Section */}
            {userPrize && contest.status === 'ended' && (
              <div className="mt-4 bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-2 border-yellow-600/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-yellow-300 text-sm font-semibold">🎉 You Won!</div>
                    <div className="text-white text-xl font-bold">{userPrize.prize}</div>
                  </div>
                  {myClaim?.claim_status && (
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      myClaim.claim_status === 'submitted' ? 'bg-blue-600/80' :
                      myClaim.claim_status === 'approved' ? 'bg-green-600/80' :
                      myClaim.claim_status === 'paid' ? 'bg-emerald-600/80' :
                      'bg-gray-600/80'
                    }`}>
                      {myClaim.claim_status === 'pending' ? 'Not Claimed' :
                       myClaim.claim_status === 'submitted' ? 'Claim Submitted' :
                       myClaim.claim_status === 'approved' ? 'Approved' :
                       myClaim.claim_status === 'paid' ? 'Paid ✓' : myClaim.claim_status}
                    </div>
                  )}
                </div>
                {myClaim?.claim_status === 'pending' ? (
                  <button
                    onClick={() => setShowClaimModal(true)}
                    className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Trophy className="w-5 h-5" />
                    Claim Your Prize
                  </button>
                ) : myClaim?.claim_status === 'submitted' ? (
                  <div className="text-center text-gray-300 text-sm">
                    Your claim has been submitted. Check your email for updates.
                  </div>
                ) : myClaim?.claim_status === 'paid' ? (
                  <div className="text-center text-green-400 text-sm font-semibold">
                    Prize has been sent! Check your email/wallet.
                  </div>
                ) : null}
              </div>
            )}

            {contest.status === 'active' && (
              <Link href="/">
                <button className="mt-4 w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition-all">
                  Play Now to Enter
                </button>
              </Link>
            )}
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-gray-900/40 border-2 border-cyan-700/50 rounded-lg p-6 backdrop-blur-sm mb-8">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Leaderboard
          </h2>
          {leaderboard.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No entries yet. Be the first!</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={`${entry.username}-${entry.createdAt}`}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    currentUser?.username === entry.username
                      ? 'bg-cyan-900/60 border-2 border-cyan-400'
                      : 'bg-gray-800/40'
                  }`}
                >
                  <div className="w-12 flex items-center justify-center">
                    {getRankIcon(entry.rank) || (
                      <span className="text-gray-400 font-bold">#{entry.rank}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold ${entry.rank <= 3 ? 'text-yellow-300' : 'text-white'}`}>
                      {entry.username}
                      {currentUser?.username === entry.username && (
                        <span className="ml-2 text-xs text-cyan-400">(You)</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold text-lg">{entry.score.toLocaleString()}</p>
                    <p className="text-gray-400 text-sm">{entry.distance}m</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back button */}
        <div className="text-center mt-8">
          <Link href="/contests" className="inline-block text-cyan-400 hover:text-cyan-300 text-base font-mono font-semibold px-6 py-3 rounded-lg border border-cyan-400/30 hover:border-cyan-400/60 hover:bg-cyan-400/10 transition-all">
            ← Back to All Contests
          </Link>
        </div>
      </div>

      {/* Prize Claim Modal */}
      {userPrize && currentUser && myClaim && (
        <PrizeClaimModal
          isOpen={showClaimModal}
          onClose={() => setShowClaimModal(false)}
          prize={userPrize.prize}
          rank={userPrize.rank}
          userEmail={currentUser.email || ''}
          onSubmit={handleClaimPrize}
        />
      )}

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
