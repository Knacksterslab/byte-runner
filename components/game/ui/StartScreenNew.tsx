'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useGameStore } from '@/lib/store/gameStore'
import {
  getCurrentHourlyChallenge,
  getMyHourlyChallengeEligibility,
  type HourlyChallenge,
  type HourlyChallengeEligibility,
  type Contest,
} from '@/lib/api/backend'
import styles from './StartScreen.module.css'
import { HowToPlayPanel } from './HowToPlayPanel'
import { TopRunsPanel } from './TopRunsPanel'
import { HourlyChallengeBanner } from './HourlyChallengeBanner'
import { ActiveContestsPanel } from './ActiveContestsPanel'

export interface StartScreenNewProps {
  onStart: () => void
  onShowTutorial: () => void
  onSignIn?: () => void
  signInLabel?: string
  activeContests?: Contest[]
  username?: string | null
  isAuthenticated?: boolean
  onRequestSetUsername?: () => void
}

export function StartScreenNew({
  onStart,
  onShowTutorial,
  onSignIn,
  signInLabel = 'Sign in',
  activeContests = [],
  username = null,
  isAuthenticated = false,
  onRequestSetUsername,
}: StartScreenNewProps) {
  const leaderboard = useGameStore((state) => state.leaderboard)
  const ensureLeaderboardSeeded = useGameStore((state) => state.ensureLeaderboardSeeded)
  const entries = leaderboard.slice(0, 3)
  const [hourlyChallenge, setHourlyChallenge] = useState<HourlyChallenge | null>(null)
  const [hourlyEligibility, setHourlyEligibility] = useState<HourlyChallengeEligibility | null>(null)
  const [eligibilityLoading, setEligibilityLoading] = useState(false)

  useEffect(() => {
    let isActive = true
    ensureLeaderboardSeeded()
    getCurrentHourlyChallenge()
      .then((res) => {
        if (!isActive) return
        setHourlyChallenge(res.challenge)
      })
      .catch(() => {})

    if (!isAuthenticated) {
      setHourlyEligibility(null)
      setEligibilityLoading(false)
      return () => {
        isActive = false
      }
    }

    setEligibilityLoading(true)
    getMyHourlyChallengeEligibility()
      .then((res) => {
        if (!isActive) return
        setHourlyEligibility(res)
      })
      .catch(() => {
        if (!isActive) return
        setHourlyEligibility(null)
      })
      .finally(() => {
        if (!isActive) return
        setEligibilityLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [ensureLeaderboardSeeded, isAuthenticated])

  return (
    <div className="relative w-full bg-[#05070d] text-white" style={{ minHeight: 'calc(100vh + 1px)', paddingBottom: '40px' }}>
      <div className={`fixed inset-0 ${styles.nebulaBackground}`} style={{ zIndex: 0 }} />
      <div className={`fixed inset-0 ${styles.vignette}`} style={{ zIndex: 1 }} />

      {isAuthenticated ? (
        <Link href="/profile">
          <div
            className="fixed left-4 sm:left-6 z-20 flex items-center gap-2 sm:gap-3 rounded-full border border-cyan-400/50 bg-[#08131c]/80 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-mono font-bold tracking-wide text-cyan-100 shadow-[0_0_12px_rgba(0,255,255,0.3)] transition hover:border-cyan-300 hover:text-white touch-manipulation cursor-pointer group"
            style={{ top: 'max(12px, calc(env(safe-area-inset-top) + 8px))' }}
          >
            <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-cyan-500/20 border border-cyan-400/50 group-hover:bg-cyan-500/30 transition">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="hidden sm:inline">{username || 'Player'}</span>
          </div>
        </Link>
      ) : (
        onSignIn && (
          <button
            onClick={onSignIn}
            className="fixed left-4 sm:left-6 z-20 rounded-full border border-cyan-400/50 bg-[#08131c]/80 px-3 py-1.5 sm:py-1 text-[10px] sm:text-xs font-mono font-bold tracking-wide text-cyan-100 shadow-[0_0_12px_rgba(0,255,255,0.3)] transition hover:border-cyan-300 hover:text-white touch-manipulation"
            style={{ top: 'max(12px, calc(env(safe-area-inset-top) + 8px))' }}
          >
            {signInLabel}
          </button>
        )
      )}

      <button
        onClick={onShowTutorial}
        className="fixed right-4 sm:right-6 z-20 flex h-[48px] w-[48px] sm:h-[54px] sm:w-[54px] items-center justify-center rounded-[10px] border border-cyan-300/60 bg-[#0a1a24] text-xl sm:text-2xl font-bold text-cyan-200 shadow-[0_0_22px_rgba(0,255,255,0.45)] transition hover:scale-105 touch-manipulation"
        style={{ top: 'max(12px, calc(env(safe-area-inset-top) + 8px))' }}
      >
        <span className={styles.questionFrame} />
        <span className="relative z-10 text-cyan-100 drop-shadow-[0_0_8px_rgba(0,255,255,0.9)]">?</span>
      </button>

      <div className={`${styles.screenSafe} relative z-10 mx-auto flex w-full max-w-[980px] flex-col items-center px-4 sm:px-6 pb-6 pt-3 text-center`}>
        <img src="/logo.png" alt="Byte Runner" className={`${styles.logo} h-20 w-auto drop-shadow-[0_0_38px_rgba(0,255,255,0.85)] sm:h-24`} />

        <div className="mt-2 space-y-1">
          <h1 className={`${styles.headline} text-2xl font-bold tracking-[0.24em] text-red-100 sm:text-3xl md:text-4xl lg:text-[2.7rem]`}>
            THE CYBER STORM IS HERE
          </h1>
          <p className={`${styles.subheadline} text-sm font-bold tracking-[0.5em] text-orange-200 sm:text-base md:text-lg lg:text-xl`}>
            — FORTIFY OR FALL —
          </p>
        </div>

        <button onClick={onStart} className={`${styles.startBtnNew} relative mt-6 sm:mt-8 mb-4 sm:mb-6`}>
          <span className={styles.btnOuterGlow} />
          <span className={styles.btnText}>START GAME</span>
        </button>

        {isAuthenticated && !username && onRequestSetUsername && (
          <div className="w-full max-w-md mb-4 sm:mb-6 px-4 py-3 rounded-lg bg-amber-900/20 border border-amber-500/40">
            <p className="text-amber-200/90 text-xs sm:text-sm font-mono mb-2">Set a username to save runs and enter contests.</p>
            <button type="button" onClick={onRequestSetUsername} className="text-amber-300 hover:text-amber-200 font-mono text-xs sm:text-sm font-bold underline transition-colors">
              Set username →
            </button>
          </div>
        )}

        {hourlyChallenge && (
          <HourlyChallengeBanner
            challenge={hourlyChallenge}
            isAuthenticated={isAuthenticated}
            eligibility={hourlyEligibility}
            eligibilityLoading={eligibilityLoading}
          />
        )}

        <div className="w-full grid md:grid-cols-2 gap-4 md:gap-8 mt-0">
          <HowToPlayPanel />
          <TopRunsPanel entries={entries} />
        </div>

        <ActiveContestsPanel activeContests={activeContests} />

        <div className="mt-4 mb-2 flex gap-2 text-xs text-cyan-100/70 sm:fixed sm:bottom-5 sm:right-6 sm:z-20">
          <a href="/privacy" className="hover:text-cyan-200 transition-colors">Privacy</a>
          <span className="text-cyan-100/40">•</span>
          <a href="/terms" className="hover:text-cyan-200 transition-colors">Terms</a>
          <span className="text-cyan-100/40">•</span>
          <a href="/faq" className="hover:text-cyan-200 transition-colors">FAQ</a>
        </div>
      </div>
    </div>
  )
}
