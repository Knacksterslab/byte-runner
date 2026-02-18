'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Keyboard, AlertTriangle, Shield, Skull, Trophy, Clock, DollarSign } from 'lucide-react'
import { useGameStore } from '@/lib/store/gameStore'
import { getCurrentHourlyChallenge, type HourlyChallenge } from '@/lib/api/backend'

interface Contest {
  id: string
  name: string
  slug: string
  end_date: string
  prize_pool: Record<string, string> | null
  status: string
}

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
  onRequestSetUsername
}: StartScreenNewProps) {
  const leaderboard = useGameStore((state) => state.leaderboard)
  const ensureLeaderboardSeeded = useGameStore((state) => state.ensureLeaderboardSeeded)
  const entries = leaderboard.slice(0, 3)
  const [hourlyChallenge, setHourlyChallenge] = useState<HourlyChallenge | null>(null)

  useEffect(() => {
    ensureLeaderboardSeeded()
    
    // Fetch current hourly challenge
    getCurrentHourlyChallenge()
      .then(res => setHourlyChallenge(res.challenge))
      .catch(() => {}) // Silently fail if service unavailable
  }, [ensureLeaderboardSeeded])

  return (
    <div className="relative w-full bg-[#05070d] text-white" style={{ minHeight: 'calc(100vh + 1px)', paddingBottom: '40px' }}>
      {/* Background with built-in grid */}
      <div className="fixed inset-0 nebula-background" style={{ zIndex: 0 }} />
      <div className="fixed inset-0 vignette" style={{ zIndex: 1 }} />

      {/* Profile icon or Sign in button */}
      {isAuthenticated ? (
        <Link href="/profile">
          <div className="fixed left-4 sm:left-6 top-4 sm:top-6 z-20 flex items-center gap-2 sm:gap-3 rounded-full border border-cyan-400/50 bg-[#08131c]/80 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-mono font-bold tracking-wide text-cyan-100 shadow-[0_0_12px_rgba(0,255,255,0.3)] transition hover:border-cyan-300 hover:text-white touch-manipulation cursor-pointer group">
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
            className="fixed left-4 sm:left-6 top-4 sm:top-6 z-20 rounded-full border border-cyan-400/50 bg-[#08131c]/80 px-3 py-1.5 sm:py-1 text-[10px] sm:text-xs font-mono font-bold tracking-wide text-cyan-100 shadow-[0_0_12px_rgba(0,255,255,0.3)] transition hover:border-cyan-300 hover:text-white touch-manipulation"
          >
            {signInLabel}
          </button>
        )
      )}

      {/* Tutorial button */}
      <button
        onClick={onShowTutorial}
        className="fixed right-4 sm:right-6 top-4 sm:top-6 z-20 flex h-[48px] w-[48px] sm:h-[54px] sm:w-[54px] items-center justify-center rounded-[10px] border border-cyan-300/60 bg-[#0a1a24] text-xl sm:text-2xl font-bold text-cyan-200 shadow-[0_0_22px_rgba(0,255,255,0.45)] transition hover:scale-105 touch-manipulation"
      >
        <span className="question-frame" />
        <span className="relative z-10 text-cyan-100 drop-shadow-[0_0_8px_rgba(0,255,255,0.9)]">?</span>
      </button>

      {/* Main content */}
      <div className="screen-safe relative z-10 mx-auto flex w-full max-w-[980px] flex-col items-center px-4 sm:px-6 pb-6 pt-3 text-center">
        {/* Logo */}
        <img
          src="/logo.png"
          alt="Byte Runner"
          className="logo h-20 w-auto drop-shadow-[0_0_38px_rgba(0,255,255,0.85)] sm:h-24"
        />

        {/* Headlines */}
        <div className="mt-2 space-y-1">
          <h1 className="headline text-2xl font-bold tracking-[0.24em] text-red-100 sm:text-3xl md:text-4xl lg:text-[2.7rem]">
            THE CYBER STORM IS HERE
          </h1>
          <p className="subheadline text-sm font-bold tracking-[0.5em] text-orange-200 sm:text-base md:text-lg lg:text-xl">
            — FORTIFY OR FALL —
          </p>
        </div>

          {/* START GAME Button */}
          <button
            onClick={onStart}
            className="start-btn-new relative mt-6 sm:mt-8 mb-4 sm:mb-6"
          >
            <span className="btn-outer-glow" />
            <span className="btn-text">START GAME</span>
          </button>

        {/* Set username reminder when signed in but no username */}
        {isAuthenticated && !username && onRequestSetUsername && (
          <div className="w-full max-w-md mb-4 sm:mb-6 px-4 py-3 rounded-lg bg-amber-900/20 border border-amber-500/40">
            <p className="text-amber-200/90 text-xs sm:text-sm font-mono mb-2">
              Set a username to save runs and enter contests.
            </p>
            <button
              type="button"
              onClick={onRequestSetUsername}
              className="text-amber-300 hover:text-amber-200 font-mono text-xs sm:text-sm font-bold underline transition-colors"
            >
              Set username →
            </button>
          </div>
        )}

        {/* Hourly Challenge Banner */}
        {hourlyChallenge && (
          <div className="w-full max-w-full md:max-w-[calc(50%-1rem)] mb-4 sm:mb-6">
            <div className="panel stack-panel px-5 sm:px-8 py-4 text-left bg-gradient-to-br from-green-900/20 to-emerald-900/20">
              <span className="panel-outline" style={{ borderColor: 'rgba(34, 197, 94, 0.5)' }} />
              <div className="panel-title">
                <span className="title-line" style={{ background: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.6), transparent)' }} />
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  HOURLY CHALLENGE
                </span>
                <span className="title-line" style={{ background: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.6), transparent)' }} />
              </div>
              <div className="bg-black/30 rounded-lg p-3 sm:p-4 border border-green-600/30">
                <div className="flex items-center justify-between gap-3 mb-2 sm:mb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-white text-base sm:text-lg font-bold">Win $1.00</p>
                      <p className="text-green-300 text-[10px] sm:text-xs font-mono">Highest score this hour wins</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-orange-300 text-xs sm:text-sm font-mono font-bold">
                      {(() => {
                        const now = new Date()
                        const challengeHour = new Date(hourlyChallenge.challengeHour)
                        const nextHour = new Date(challengeHour)
                        nextHour.setHours(nextHour.getHours() + 1)
                        const minutesLeft = Math.max(0, Math.floor((nextHour.getTime() - now.getTime()) / (1000 * 60)))
                        return `${minutesLeft}min left`
                      })()}
                    </p>
                  </div>
                </div>
                <div className="text-[10px] sm:text-xs text-gray-300 mb-2 sm:mb-3">
                  Every hour, the player with the highest score automatically wins $1! Your best run counts automatically.
                </div>
                <p className="text-green-200/90 text-[10px] sm:text-xs font-mono text-center">
                  Use &quot;Start game&quot; above — your best run this hour counts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Two Column Grid */}
        <div className="w-full grid md:grid-cols-2 gap-4 md:gap-8 mt-0">
          {/* HOW TO PLAY Panel */}
          <div className="panel stack-panel px-5 sm:px-8 py-4 text-left">
            <span className="panel-outline" />
            <div className="panel-title">
              <span className="title-line" />
              <span>HOW TO PLAY</span>
              <span className="title-line" />
            </div>
            <div className="space-y-2.5 text-[0.9rem] sm:text-[0.95rem]">
              <div className="flex items-center gap-3 sm:gap-4">
                <Keyboard className="h-6 w-6 sm:h-7 sm:w-7 text-cyan-300 flex-shrink-0" />
                <div>
                  <span className="font-bold text-cyan-300">MOVE:</span>{' '}
                  <span className="text-white font-semibold">WASD / Arrows / Touch</span>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7 text-orange-400 flex-shrink-0" />
                <div>
                  <span className="font-bold text-orange-300">DODGE THREATS:</span>{' '}
                  <span className="text-white font-semibold">Avoid hostile enemies</span>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="font-bold text-emerald-300">COLLECT KITS:</span>{' '}
                  <span className="text-white font-semibold">Protection items</span>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <Skull className="h-6 w-6 sm:h-7 sm:w-7 text-red-400 flex-shrink-0" />
                <div>
                  <span className="font-bold text-red-300">NO KIT = GAME OVER:</span>{' '}
                  <span className="text-white font-semibold">Stay stocked</span>
                </div>
              </div>
            </div>
          </div>

          {/* TOP RUNS Panel */}
          <div className="panel stack-panel px-5 sm:px-8 py-4 text-left">
            <span className="panel-outline" />
            <div className="panel-title">
              <span className="title-line" />
              <span>TOP RUNS</span>
              <span className="title-line" />
            </div>
            {entries.length === 0 ? (
              <div className="text-center text-xs text-cyan-100/70 font-semibold">No runs yet. Be the first!</div>
            ) : (
              <>
                <div className="space-y-2.5 text-sm text-slate-200 sm:text-base">
                  {entries.map((entry, index) => (
                    <div key={entry.id} className="flex items-center gap-2 sm:gap-4 font-mono">
                      <div className="medal-badge" data-rank={index + 1}>
                        <span className="medal-number">{index + 1}</span>
                      </div>
                      <span className={`flex-1 truncate text-sm sm:text-base font-bold ${entry.isPlayer ? 'text-yellow-300' : 'text-white'}`}>
                        {entry.name}
                      </span>
                      <span className="text-white font-bold whitespace-nowrap text-sm sm:text-base">{entry.score} pts</span>
                      <span className="text-slate-300 font-semibold whitespace-nowrap text-xs sm:text-sm hidden xs:inline">• {entry.distance}m</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Active Contests Section */}
        <div className="panel stack-panel mt-6 sm:mt-8 w-full px-5 sm:px-8 py-4 text-left">
          <span className="panel-outline" />
          <div className="panel-title">
            <span className="title-line" />
            <span className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              ACTIVE CONTESTS
            </span>
            <span className="title-line" />
          </div>

          {/* Show real contests if available, otherwise show placeholder */}
          {activeContests.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
              {activeContests.slice(0, 2).map((contest) => {
                const endDate = new Date(contest.end_date)
                const now = new Date()
                const hoursLeft = Math.max(0, Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60)))
                const topPrize = contest.prize_pool ? Object.values(contest.prize_pool)[0] : null
                
                return (
                  <div key={contest.id} className="contest-card">
                    <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white text-sm sm:text-base font-extrabold truncate mb-1">{contest.name}</h3>
                        {topPrize && (
                          <p className="text-yellow-300 text-xs sm:text-sm font-mono">
                            🏆 <span className="font-bold">Top Prize:</span> <span className="font-extrabold">{topPrize}</span>
                          </p>
                        )}
                      </div>
                      <div className="contest-timer flex-shrink-0">
                        <span className="text-base sm:text-lg font-bold">{hoursLeft}h</span>
                        <span className="text-xs">left</span>
                      </div>
                    </div>
                    <Link href={`/contests/${contest.slug || contest.id}`}>
                      <button
                        type="button"
                        className="contest-cta"
                      >
                        <span>View Contest</span>
                        <span className="text-lg">→</span>
                      </button>
                    </Link>
                  </div>
                )
              })}
            </div>
          ) : (
            // Placeholder contests
            <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
              <div className="contest-card opacity-60">
                <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm sm:text-base font-extrabold mb-1">Weekly Championship</h3>
                    <p className="text-yellow-300 text-xs sm:text-sm font-mono">
                      🏆 <span className="font-bold">Top Prize:</span> <span className="font-extrabold">$500</span>
                    </p>
                  </div>
                  <div className="contest-timer flex-shrink-0">
                    <span className="text-base sm:text-lg font-bold">--</span>
                    <span className="text-xs">hours</span>
                  </div>
                </div>
                <div className="contest-cta-disabled">
                  <span>Coming Soon</span>
                </div>
              </div>

              <div className="contest-card opacity-60">
                <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm sm:text-base font-extrabold mb-1">Speed Run Challenge</h3>
                    <p className="text-yellow-300 text-xs sm:text-sm font-mono">
                      🏆 <span className="font-bold">Top Prize:</span> <span className="font-extrabold">$250</span>
                    </p>
                  </div>
                  <div className="contest-timer flex-shrink-0">
                    <span className="text-base sm:text-lg font-bold">--</span>
                    <span className="text-xs">hours</span>
                  </div>
                </div>
                <div className="contest-cta-disabled">
                  <span>Coming Soon</span>
                </div>
              </div>
            </div>
          )}

          {activeContests.length > 2 && (
            <div className="mt-4 text-center">
              <Link
                href="/contests"
                className="text-cyan-400 hover:text-cyan-300 text-base font-mono font-bold transition-colors inline-block px-4 py-2 rounded-lg hover:bg-cyan-400/10"
              >
                View All Contests & Standings →
              </Link>
            </div>
          )}
        </div>

        {/* Footer links: scroll on mobile, fixed on desktop */}
        <div className="mt-4 mb-2 flex gap-2 text-xs text-cyan-100/70 sm:fixed sm:bottom-5 sm:right-6 sm:z-20">
          <a href="/privacy" className="hover:text-cyan-200 transition-colors">Privacy</a>
          <span className="text-cyan-100/40">•</span>
          <a href="/terms" className="hover:text-cyan-200 transition-colors">Terms</a>
          <span className="text-cyan-100/40">•</span>
          <a href="/faq" className="hover:text-cyan-200 transition-colors">FAQ</a>
        </div>
      </div>

      {/* CSS Styles from original */}
      <style jsx>{`
        .nebula-background {
          background-image: url('/space-background-final.png');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          opacity: 1;
          z-index: 1;
          pointer-events: none;
        }

        .vignette {
          background: radial-gradient(circle at 50% 40%, transparent 0%, rgba(2, 4, 10, 0.3) 70%);
          z-index: 3;
          pointer-events: none;
        }

        .headline {
          text-shadow: 0 0 22px rgba(255, 70, 70, 0.9), 0 0 45px rgba(255, 20, 20, 0.6);
        }

        .subheadline {
          text-shadow: 0 0 18px rgba(255, 150, 0, 0.75);
        }

        .question-frame {
          position: absolute;
          inset: 4px;
          border-radius: 8px;
          border: 1px solid rgba(120, 240, 255, 0.7);
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.6), inset 0 0 12px rgba(0, 255, 255, 0.3);
          background: radial-gradient(circle at 30% 30%, rgba(0, 255, 255, 0.18), transparent 55%);
        }

        .panel {
          position: relative;
          border-radius: 14px;
          border: 2px solid rgba(0, 210, 255, 0.85);
          background: rgba(4, 10, 16, 0.98);
          box-shadow: 0 0 36px rgba(0, 220, 255, 0.55), inset 0 0 15px rgba(0, 220, 255, 0.12);
          backdrop-filter: blur(3px);
        }

        .panel-outline {
          position: absolute;
          inset: 6px;
          border-radius: 10px;
          border: 1px solid rgba(0, 255, 255, 0.38);
          box-shadow: inset 0 0 14px rgba(0, 255, 255, 0.18);
          pointer-events: none;
        }

        .panel-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-bottom: 14px;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.55em;
          color: #7be9ff;
          text-shadow: 0 0 14px rgba(0, 200, 255, 0.9);
        }

        .title-line {
          height: 1px;
          width: 68px;
          background: rgba(0, 210, 255, 0.8);
          box-shadow: 0 0 12px rgba(0, 210, 255, 0.9);
        }

        .medal-badge {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          flex-shrink: 0;
          font-weight: 700;
          font-size: 1.125rem;
          border: 3px solid;
        }

        .medal-badge::before {
          content: '';
          position: absolute;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          z-index: -1;
        }

        .medal-badge::after {
          content: '★';
          position: absolute;
          top: -8px;
          font-size: 14px;
          z-index: 10;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
        }

        .medal-badge[data-rank="1"] {
          background: radial-gradient(circle at 30% 30%, #ffd700 0%, #fbbf24 40%, #d97706 100%);
          border-color: #92400e;
          box-shadow: 0 0 25px rgba(251, 191, 36, 0.8), 
                      0 0 40px rgba(251, 191, 36, 0.4),
                      inset 0 2px 10px rgba(255, 255, 255, 0.4),
                      inset 0 -2px 8px rgba(0, 0, 0, 0.2);
        }

        .medal-badge[data-rank="1"]::before {
          background: 
            radial-gradient(2px 2px at 14px 10px, #fbbf24 50%, transparent 51%),
            radial-gradient(2px 2px at 42px 10px, #fbbf24 50%, transparent 51%),
            radial-gradient(2px 2px at 10px 24px, #fbbf24 50%, transparent 51%),
            radial-gradient(2px 2px at 46px 24px, #fbbf24 50%, transparent 51%),
            radial-gradient(2px 2px at 14px 46px, #fbbf24 50%, transparent 51%),
            radial-gradient(2px 2px at 42px 46px, #fbbf24 50%, transparent 51%);
          opacity: 0.9;
        }

        .medal-badge[data-rank="1"]::after {
          content: '👑';
          top: -10px;
          font-size: 16px;
          filter: drop-shadow(0 2px 6px rgba(251, 191, 36, 0.8));
        }

        .medal-badge[data-rank="1"] .medal-number {
          color: #451a03;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6),
                       0 0 8px rgba(255, 215, 0, 0.8);
        }

        .medal-badge[data-rank="2"] {
          background: radial-gradient(circle at 30% 30%, #f1f5f9 0%, #cbd5e1 40%, #64748b 100%);
          border-color: #475569;
          box-shadow: 0 0 20px rgba(203, 213, 225, 0.6), 
                      0 0 35px rgba(203, 213, 225, 0.3),
                      inset 0 2px 10px rgba(255, 255, 255, 0.4),
                      inset 0 -2px 6px rgba(0, 0, 0, 0.15);
        }

        .medal-badge[data-rank="2"]::before {
          background: 
            radial-gradient(2px 2px at 16px 12px, #cbd5e1 50%, transparent 51%),
            radial-gradient(2px 2px at 40px 12px, #cbd5e1 50%, transparent 51%),
            radial-gradient(2px 2px at 12px 24px, #cbd5e1 50%, transparent 51%),
            radial-gradient(2px 2px at 44px 24px, #cbd5e1 50%, transparent 51%),
            radial-gradient(2px 2px at 16px 44px, #cbd5e1 50%, transparent 51%),
            radial-gradient(2px 2px at 40px 44px, #cbd5e1 50%, transparent 51%);
          opacity: 0.8;
        }

        .medal-badge[data-rank="2"]::after {
          color: #cbd5e1;
          filter: drop-shadow(0 2px 4px rgba(203, 213, 225, 0.6));
        }

        .medal-badge[data-rank="2"] .medal-number {
          color: #1e293b;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6),
                       0 0 6px rgba(203, 213, 225, 0.6);
        }

        .medal-badge[data-rank="3"] {
          background: radial-gradient(circle at 30% 30%, #fdba74 0%, #fb923c 40%, #c2410c 100%);
          border-color: #7c2d12;
          box-shadow: 0 0 20px rgba(251, 146, 60, 0.6), 
                      0 0 35px rgba(251, 146, 60, 0.3),
                      inset 0 2px 10px rgba(255, 255, 255, 0.3),
                      inset 0 -2px 6px rgba(0, 0, 0, 0.2);
        }

        .medal-badge[data-rank="3"]::before {
          background: 
            radial-gradient(2px 2px at 16px 12px, #fb923c 50%, transparent 51%),
            radial-gradient(2px 2px at 40px 12px, #fb923c 50%, transparent 51%),
            radial-gradient(2px 2px at 12px 24px, #fb923c 50%, transparent 51%),
            radial-gradient(2px 2px at 44px 24px, #fb923c 50%, transparent 51%),
            radial-gradient(2px 2px at 16px 44px, #fb923c 50%, transparent 51%),
            radial-gradient(2px 2px at 40px 44px, #fb923c 50%, transparent 51%);
          opacity: 0.75;
        }

        .medal-badge[data-rank="3"]::after {
          color: #fb923c;
          filter: drop-shadow(0 2px 4px rgba(251, 146, 60, 0.6));
        }

        .medal-badge[data-rank="3"] .medal-number {
          color: #451a03;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5),
                       0 0 6px rgba(251, 146, 60, 0.6);
        }

        /* New START GAME button with exact specs */
        .start-btn-new {
          position: relative;
          width: 360px;
          max-width: 90vw;
          height: 60px;
          border-radius: 16px;
          border: 2px solid #94FBD2;
          background: linear-gradient(to bottom, #0A2A3E 0%, #061C2E 100%);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.55);
          transition: transform 0.2s ease;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-tap-highlight-color: transparent;
        }

        .start-btn-new:hover {
          transform: scale(1.03);
        }

        @media (hover: none) {
          .start-btn-new:active {
            transform: scale(0.97);
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.7);
          }
        }

        .btn-outer-glow {
          pointer-events: none;
          position: absolute;
          inset: -8px;
          border-radius: 20px;
          box-shadow: 0 0 28px rgba(148, 251, 210, 0.35), 0 0 60px rgba(66, 186, 131, 0.20);
        }

        .btn-text {
          position: relative;
          z-index: 10;
          font-family: 'Space Grotesk', 'Inter', ui-sans-serif, system-ui;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #D5F6FA;
          filter: drop-shadow(0 0 10px rgba(148, 251, 210, 0.25));
        }

        .screen-safe {
          padding-top: max(12px, env(safe-area-inset-top));
          padding-bottom: calc(20px + env(safe-area-inset-bottom));
        }

        .leaderboard-link {
          font-weight: 600;
        }

        .contest-card {
          position: relative;
          background: rgba(10, 15, 25, 0.6);
          border: 2px solid rgba(251, 191, 36, 0.4);
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.25), inset 0 0 10px rgba(251, 191, 36, 0.08);
          backdrop-filter: blur(2px);
          transition: all 0.3s ease;
          min-height: 48px;
        }

        .contest-card:hover {
          border-color: rgba(251, 191, 36, 0.6);
          box-shadow: 0 0 30px rgba(251, 191, 36, 0.4), inset 0 0 15px rgba(251, 191, 36, 0.12);
        }

        @media (hover: none) {
          .contest-card:active {
            border-color: rgba(251, 191, 36, 0.6);
            transform: scale(0.98);
          }
        }

        .contest-timer {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px 12px;
          background: rgba(234, 88, 12, 0.2);
          border: 1px solid rgba(234, 88, 12, 0.5);
          border-radius: 8px;
          color: #fb923c;
          text-align: center;
          min-width: 60px;
        }

        .contest-cta {
          display: flex;
          width: 100%;
          text-align: center;
          padding: 10px 16px;
          min-height: 44px;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.4) 0%, rgba(234, 88, 12, 0.5) 100%);
          border: 2px solid rgba(251, 191, 36, 0.7);
          border-radius: 10px;
          color: white;
          font-weight: 800;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
          transition: all 0.2s ease;
          text-decoration: none;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .contest-cta:hover {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.6) 0%, rgba(234, 88, 12, 0.7) 100%);
          transform: scale(1.02);
          box-shadow: 0 0 30px rgba(251, 191, 36, 0.6);
        }

        @media (hover: none) {
          .contest-cta:active {
            background: linear-gradient(135deg, rgba(251, 191, 36, 0.7) 0%, rgba(234, 88, 12, 0.8) 100%);
            transform: scale(0.98);
          }
        }

        .contest-cta-disabled {
          display: block;
          width: 100%;
          text-align: center;
          padding: 10px 16px;
          background: rgba(100, 100, 100, 0.2);
          border: 2px solid rgba(150, 150, 150, 0.3);
          border-radius: 10px;
          color: #94a3b8;
          font-weight: 800;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .logo {
            height: 88px;
          }

          .panel {
            max-width: 600px;
            padding: 20px 24px;
          }

          .panel-title {
            font-size: 0.9rem;
            letter-spacing: 0.45em;
          }

          .title-line {
            width: 52px;
          }

          .start-btn-new {
            height: 52px;
            width: 320px;
          }

          .btn-text {
            font-size: 16px;
          }

          .contest-card {
            padding: 16px;
          }

          .contest-timer {
            font-size: 11px;
            padding: 4px 10px;
          }
        }

        @media (max-width: 640px) {
          .logo {
            height: 76px;
          }

          .headline {
            text-shadow: 0 0 16px rgba(255, 100, 50, 0.35);
          }

          .subheadline {
            text-shadow: 0 0 10px rgba(255, 150, 80, 0.3);
          }

          .panel {
            max-width: 100%;
            padding: 18px 20px;
          }

          .start-btn-new {
            height: 50px;
            width: 280px;
          }

          .btn-text {
            font-size: 15px;
          }
        }

        @media (max-width: 480px) {
          .logo {
            height: 64px;
          }

          .panel {
            max-width: 100%;
            padding: 16px 18px;
          }

          .panel-outline {
            inset: 5px;
          }

          .panel-title {
            font-size: 0.82rem;
            letter-spacing: 0.38em;
            gap: 10px;
          }

          .title-line {
            width: 38px;
          }

          .start-btn-new {
            height: 48px;
            width: 260px;
          }

          .btn-text {
            font-size: 14px;
          }

          .contest-card {
            padding: 14px;
          }

          .contest-timer {
            font-size: 10px;
            padding: 3px 8px;
          }

          .contest-cta {
            padding: 8px 16px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  )
}
