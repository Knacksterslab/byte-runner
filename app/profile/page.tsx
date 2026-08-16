'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, signOut, getAllBadges, getMyBadges, setFeaturedBadge, getMyBalance, getMyStats, setUsername as apiSetUsername, type BackendUser, type Badge, type UserBadge, type BalanceInfo } from '@/lib/api/backend'
import { EarningsDashboard } from '@/components/profile/EarningsDashboard'
import { BadgesGrid } from '@/components/profile/BadgesGrid'
import { UsernameSetupCard } from '@/components/profile/UsernameSetupCard'
import { ProfileStatsGrid } from '@/components/profile/ProfileStatsGrid'
import { ProfileActions } from '@/components/profile/ProfileActions'
import { User, Mail } from 'lucide-react'
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
  const [usernameInput, setUsernameInput] = useState('')
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [usernameLoading, setUsernameLoading] = useState(false)

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
    } catch {
      // Silently fail; page shows loading → redirects or empty state
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch {
      // Ignore sign-out errors; redirect anyway
    }
  }

  const handleUsernameSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUsernameLoading(true)
    setUsernameError(null)
    try {
      const updated = await apiSetUsername(usernameInput.trim())
      setCurrentUser(updated)
      setUsernameInput('')
    } catch (error) {
      setUsernameError(error instanceof Error ? error.message : 'Failed to set username.')
    } finally {
      setUsernameLoading(false)
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
            background-image: url('/space-background.webp');
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

        {!currentUser.username && (
          <UsernameSetupCard
            value={usernameInput}
            onChange={setUsernameInput}
            onSubmit={handleUsernameSubmit}
            loading={usernameLoading}
            error={usernameError}
          />
        )}

        <ProfileStatsGrid
          bestScore={userStats.bestScore}
          bestDistance={userStats.bestDistance}
          rank={userStats.rank}
          totalRuns={userStats.totalRuns}
        />

        {balance && (
          <EarningsDashboard
            balance={balance}
            onRequestWithdrawal={() => setShowWithdrawalModal(true)}
          />
        )}

        {showWithdrawalModal && balance && (
          <WithdrawalModal
            currentBalance={balance.balanceCents}
            onClose={() => setShowWithdrawalModal(false)}
            onSuccess={() => { setShowWithdrawalModal(false); loadProfile() }}
          />
        )}

        <BadgesGrid
          allBadges={allBadges}
          myBadges={myBadges}
          featuredBadgeId={currentUser.featuredBadge}
          onSetFeatured={(id) => setFeaturedBadge(id)}
        />

        <ProfileActions continueTokens={currentUser.continueTokens} onSignOut={handleSignOut} />
      </div>

      <style jsx>{`
        .space-background {
          background-image: url('/space-background.webp');
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
