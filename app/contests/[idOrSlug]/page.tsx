'use client'

import { useEffect, useState } from 'react'
import { getContest, getContestLeaderboard, getMyContestEntries, getCurrentUser, getMyClaimForContest, submitPrizeClaim, type Contest, type ContestLeaderboardEntry, type BackendUser, type PrizeClaim } from '@/lib/api/backend'
import { formatInTimeZone, getContestTimeRemaining } from '@/lib/utils/contest'
import { Trophy } from 'lucide-react'
import Link from 'next/link'
import { PrizeClaimModal } from '@/components/PrizeClaimModal'
import { PageWrapper } from '@/components/PageWrapper'
import { ContestCountdown } from '@/components/contests/ContestCountdown'
import { ContestPrizePool } from '@/components/contests/ContestPrizePool'
import { ContestLeaderboard } from '@/components/contests/ContestLeaderboard'
import { ContestUserStatus } from '@/components/contests/ContestUserStatus'

export default function ContestDetailPage({ params }: { params: { idOrSlug: string } }) {
  const contestId = params.idOrSlug

  const [contest, setContest] = useState<Contest | null>(null)
  const [leaderboard, setLeaderboard] = useState<ContestLeaderboardEntry[]>([])
  const [currentUser, setCurrentUser] = useState<BackendUser | null>(null)
  const [myEntries, setMyEntries] = useState<any>(null)
  const [myClaim, setMyClaim] = useState<PrizeClaim | null>(null)
  const [loading, setLoading] = useState(true)
  const [showClaimModal, setShowClaimModal] = useState(false)

  useEffect(() => { loadContestData() }, [contestId])

  useEffect(() => {
    if (!contest) return
    if (contest.status !== 'active' && contest.status !== 'upcoming') return

    const checkContestStatus = async () => {
      try {
        if (Date.now() > new Date(contest.end_date).getTime() && contest.status === 'active') {
          const updated = await getContest(contestId)
          if (updated.status === 'ended') await loadContestData()
        }
      } catch { /* silently retry */ }
    }

    const interval = setInterval(checkContestStatus, 30_000)
    if (Date.now() > new Date(contest.end_date).getTime() && contest.status === 'active') {
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
        const [entries, claim] = await Promise.all([
          getMyContestEntries(contestId),
          getMyClaimForContest(contestId),
        ])
        setMyEntries(entries)
        setMyClaim(claim)
      }
    } catch { /* silently fail */ } finally {
      setLoading(false)
    }
  }

  const getUserPrize = () => {
    if (!contest?.prize_pool || !myEntries?.rank) return null
    const rank = myEntries.rank.toString()
    if (contest.prize_pool[rank]) return { rank: myEntries.rank, prize: contest.prize_pool[rank] }
    for (const [key, value] of Object.entries(contest.prize_pool)) {
      if (key.includes('-')) {
        const [start, end] = key.split('-').map(Number)
        if (myEntries.rank >= start && myEntries.rank <= end) return { rank: myEntries.rank, prize: value }
      }
    }
    return null
  }

  const handleClaimPrize = async (claimData: any) => {
    if (!myClaim) return
    try {
      await submitPrizeClaim(myClaim.id, {
        payment_method: claimData.paymentMethod,
        email: claimData.email,
        ...(claimData.usdtWallet && { usdt_wallet: claimData.usdtWallet, usdt_network: claimData.usdtNetwork }),
      })
      setMyClaim(await getMyClaimForContest(contestId))
      alert('Prize claim submitted successfully! Check your email for confirmation.')
    } catch (error: any) {
      throw new Error(error.message || 'Failed to submit claim')
    }
  }

  const SPACE_BG = (
    <style jsx>{`
      .space-background { background-image: url('/space-background.png'); background-size: cover; background-position: center; background-attachment: fixed; background-color: #05070d; }
      .vignette { background: radial-gradient(circle at 50% 40%, transparent 0%, rgba(2, 4, 10, 0.85) 70%); }
    `}</style>
  )

  if (loading) {
    return (
      <PageWrapper className="relative text-white flex items-center justify-center space-background">
        <div className="relative z-10 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent" />
          <p className="text-gray-400 mt-4 font-mono">Loading contest...</p>
        </div>
        {SPACE_BG}
      </PageWrapper>
    )
  }

  if (!contest) {
    return (
      <PageWrapper className="relative text-white flex items-center justify-center space-background">
        <div className="relative z-10 text-center">
          <p className="text-gray-400 text-lg">Contest not found</p>
          <a href="/contests" className="text-cyan-400 hover:text-cyan-300 underline mt-4 inline-block">← Back to Contests</a>
        </div>
        {SPACE_BG}
      </PageWrapper>
    )
  }

  const userPrize = getUserPrize()
  const timeRemaining = getContestTimeRemaining(contest.end_date)

  return (
    <PageWrapper className="relative text-white space-background">
      <div className="absolute inset-0 vignette pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
          <span>→</span>
          <Link href="/contests" className="hover:text-cyan-400 transition-colors">Contests</Link>
          <span>→</span>
          <span className="text-cyan-400">{contest.name}</span>
        </div>

        <div className="text-center mb-8">
          <Link href="/">
            <img src="/logo.png" alt="Byte Runner" className="h-20 sm:h-24 w-auto drop-shadow-[0_0_38px_rgba(0,255,255,0.85)] mx-auto mb-4 cursor-pointer hover:scale-105 transition-transform" />
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-2">{contest.name}</h1>
          {contest.description && <p className="text-gray-300 max-w-2xl mx-auto">{contest.description}</p>}
        </div>

        <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <ContestCountdown status={contest.status} timeRemaining={timeRemaining} />
        </div>

        {contest.status === 'active' && (
          <div className="mb-8 text-center">
            <Link href="/?play=true">
              <button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:shadow-[0_0_40px_rgba(34,211,238,0.7)] transition-all transform hover:scale-105 active:scale-95">
                🎮 Play to Enter Contest
              </button>
            </Link>
            {myEntries?.entries.length > 0 && (
              <p className="text-gray-400 text-sm mt-3">You&apos;ve already entered! Play again to improve your rank.</p>
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

        {contest.prize_pool && <ContestPrizePool prizePool={contest.prize_pool} />}

        {currentUser && myEntries && (
          <ContestUserStatus
            contestStatus={contest.status}
            leaderboardCount={leaderboard.length}
            myEntries={myEntries}
            myClaim={myClaim}
            userPrize={userPrize}
            onClaimPrize={() => setShowClaimModal(true)}
          />
        )}

        <ContestLeaderboard entries={leaderboard} currentUsername={currentUser?.username ?? undefined} />

        <div className="text-center mt-8">
          <Link href="/contests" className="inline-block text-cyan-400 hover:text-cyan-300 text-base font-mono font-semibold px-6 py-3 rounded-lg border border-cyan-400/30 hover:border-cyan-400/60 hover:bg-cyan-400/10 transition-all">
            ← Back to All Contests
          </Link>
        </div>
      </div>

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

      {SPACE_BG}
    </PageWrapper>
  )
}
