'use client'

import { useEffect } from 'react'
import { Keyboard, AlertTriangle, Shield, Skull, Trophy } from 'lucide-react'
import { useGameStore } from '@/lib/store/gameStore'

interface Contest {
  id: string
  name: string
  end_date: string
  prize_pool: Record<string, string> | null
  status: string
}

export interface StartScreenNewProps {
  onStart: () => void
  onShowTutorial: () => void
  onSignIn?: () => void
  signInLabel?: string
  onViewLeaderboard?: () => void
  activeContests?: Contest[]
}

export function StartScreenNew({ 
  onStart, 
  onShowTutorial, 
  onSignIn, 
  signInLabel = 'Sign in', 
  onViewLeaderboard,
  activeContests = [] 
}: StartScreenNewProps) {
  const leaderboard = useGameStore((state) => state.leaderboard)
  const ensureLeaderboardSeeded = useGameStore((state) => state.ensureLeaderboardSeeded)
  const entries = leaderboard.slice(0, 3)

  useEffect(() => {
    ensureLeaderboardSeeded()
  }, [ensureLeaderboardSeeded])

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#05070d] text-white">
      {/* Background with built-in grid */}
      <div className="absolute inset-0 nebula-background" />
      <div className="absolute inset-0 vignette" />

      {/* Sign in button */}
      {onSignIn && (
        <button
          onClick={onSignIn}
          className="absolute left-6 top-6 z-20 rounded-full border border-cyan-400/50 bg-[#08131c]/80 px-3 py-1 text-[10px] sm:text-xs font-mono tracking-wide text-cyan-100 shadow-[0_0_12px_rgba(0,255,255,0.3)] transition hover:border-cyan-300 hover:text-white"
        >
          {signInLabel}
        </button>
      )}

      {/* Tutorial button */}
      <button
        onClick={onShowTutorial}
        className="absolute right-6 top-6 z-20 flex h-[54px] w-[54px] items-center justify-center rounded-[10px] border border-cyan-300/60 bg-[#0a1a24] text-2xl font-bold text-cyan-200 shadow-[0_0_22px_rgba(0,255,255,0.45)] transition hover:scale-105"
      >
        <span className="question-frame" />
        <span className="relative z-10 text-cyan-100 drop-shadow-[0_0_8px_rgba(0,255,255,0.9)]">?</span>
      </button>

      {/* Footer links */}
      <div className="absolute bottom-5 right-6 z-20 flex gap-2 text-xs text-cyan-100/70">
        <a href="/privacy" className="hover:text-cyan-200 transition-colors">Privacy</a>
        <span className="text-cyan-100/40">•</span>
        <a href="/terms" className="hover:text-cyan-200 transition-colors">Terms</a>
        <span className="text-cyan-100/40">•</span>
        <a href="/faq" className="hover:text-cyan-200 transition-colors">FAQ</a>
      </div>

      {/* Main content */}
      <div className="screen-safe screen-stack screen-scroll relative z-10 mx-auto flex w-full max-w-[1100px] flex-col items-center px-6 pb-6 pt-3 text-center">
        {/* Logo */}
        <img
          src="/logo.png"
          alt="Byte Runner"
          className="logo h-20 w-auto drop-shadow-[0_0_38px_rgba(0,255,255,0.85)] sm:h-24"
        />

        {/* Headlines */}
        <div className="mt-2 space-y-1">
          <h1 className="headline text-3xl font-bold tracking-[0.24em] text-red-100 sm:text-4xl md:text-[2.7rem]">
            THE CYBER STORM IS HERE
          </h1>
          <p className="subheadline text-base font-bold tracking-[0.5em] text-orange-200 sm:text-lg md:text-xl">
            — FORTIFY OR FALL —
          </p>
        </div>

          {/* START GAME Button */}
          <button
            onClick={onStart}
            className="start-btn-new relative mt-6 mb-3"
          >
            <span className="btn-outer-glow" />
            <span className="btn-text">START GAME</span>
          </button>

        {/* Two Column Grid */}
        <div className="w-full grid md:grid-cols-2 gap-6 mt-3">
          {/* HOW TO PLAY Panel */}
          <div className="panel stack-panel px-8 py-4 text-left">
            <span className="panel-outline" />
            <div className="panel-title">
              <span className="title-line" />
              <span>HOW TO PLAY</span>
              <span className="title-line" />
            </div>
            <div className="space-y-2.5 text-[0.95rem] sm:text-base">
              <div className="flex items-center gap-4">
                <Keyboard className="h-7 w-7 text-cyan-300" />
                <div>
                  <span className="font-bold text-cyan-300">MOVE:</span>{' '}
                  <span className="text-slate-200">WASD / Arrows / Touch</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <AlertTriangle className="h-7 w-7 text-orange-400" />
                <div>
                  <span className="font-bold text-orange-300">DODGE THREATS:</span>{' '}
                  <span className="text-slate-200">Avoid hostile enemies</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Shield className="h-7 w-7 text-emerald-400" />
                <div>
                  <span className="font-bold text-emerald-300">COLLECT KITS:</span>{' '}
                  <span className="text-slate-200">Protection items</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skull className="h-7 w-7 text-red-400" />
                <div>
                  <span className="font-bold text-red-300">NO KIT = GAME OVER:</span>{' '}
                  <span className="text-slate-200">Stay stocked</span>
                </div>
              </div>
            </div>
          </div>

          {/* TOP RUNS Panel */}
          <div className="panel stack-panel px-8 py-4 text-left">
            <span className="panel-outline" />
            <div className="panel-title">
              <span className="title-line" />
              <span>TOP RUNS</span>
              <span className="title-line" />
            </div>
            {entries.length === 0 ? (
              <div className="text-center text-xs text-cyan-100/70">No runs yet. Be the first!</div>
            ) : (
              <>
                <div className="space-y-2.5 text-sm text-slate-200 sm:text-base">
                  {entries.map((entry, index) => (
                    <div key={entry.id} className="flex items-center gap-4 font-mono">
                      <div className="medal-badge" data-rank={index + 1}>
                        <span className="medal-number">{index + 1}</span>
                      </div>
                      <span className={`flex-1 truncate text-base ${entry.isPlayer ? 'text-yellow-300' : 'text-white'}`}>
                        {entry.name}
                      </span>
                      <span className="text-white font-semibold whitespace-nowrap">{entry.score} pts</span>
                      <span className="text-slate-400 whitespace-nowrap">• {entry.distance}m</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-center">
                  <button
                    onClick={onViewLeaderboard}
                    className="leaderboard-link text-sm text-slate-300 hover:text-cyan-300 transition-colors"
                    disabled={!onViewLeaderboard}
                  >
                    View full leaderboard →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Active Contests Section */}
        <div className="panel stack-panel mt-6 w-full px-8 py-4 text-left">
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
            <div className="grid md:grid-cols-2 gap-4">
              {activeContests.slice(0, 2).map((contest) => {
                const endDate = new Date(contest.end_date)
                const now = new Date()
                const hoursLeft = Math.max(0, Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60)))
                const topPrize = contest.prize_pool ? Object.values(contest.prize_pool)[0] : null
                
                return (
                  <div key={contest.id} className="contest-card">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white text-base font-bold truncate mb-1">{contest.name}</h3>
                        {topPrize && (
                          <p className="text-yellow-300 text-sm font-mono">
                            🏆 Top Prize: <span className="font-bold">{topPrize}</span>
                          </p>
                        )}
                      </div>
                      <div className="contest-timer">
                        <span className="text-lg font-bold">{hoursLeft}h</span>
                        <span className="text-xs">left</span>
                      </div>
                    </div>
                    <a
                      href={`/contests/${contest.id}`}
                      className="contest-cta"
                    >
                      <span>Enter Contest</span>
                      <span className="text-lg">→</span>
                    </a>
                  </div>
                )
              })}
            </div>
          ) : (
            // Placeholder contests
            <div className="grid md:grid-cols-2 gap-4">
              <div className="contest-card opacity-60">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-base font-bold mb-1">Weekly Championship</h3>
                    <p className="text-yellow-300 text-sm font-mono">
                      🏆 Top Prize: <span className="font-bold">$500</span>
                    </p>
                  </div>
                  <div className="contest-timer">
                    <span className="text-lg font-bold">--</span>
                    <span className="text-xs">hours</span>
                  </div>
                </div>
                <div className="contest-cta-disabled">
                  <span>Coming Soon</span>
                </div>
              </div>

              <div className="contest-card opacity-60">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-base font-bold mb-1">Speed Run Challenge</h3>
                    <p className="text-yellow-300 text-sm font-mono">
                      🏆 Top Prize: <span className="font-bold">$250</span>
                    </p>
                  </div>
                  <div className="contest-timer">
                    <span className="text-lg font-bold">--</span>
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
              <a
                href="/contests"
                className="text-cyan-400 hover:text-cyan-300 text-sm font-mono transition-colors"
              >
                View all {activeContests.length} contests →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* CSS Styles from original */}
      <style jsx>{`
        .nebula-background {
          background-image: url('/space-background-new.png');
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
          touch-action: pan-y;
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
          width: 500px;
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
        }

        .start-btn-new:hover {
          transform: scale(1.03);
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
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #D5F6FA;
          filter: drop-shadow(0 0 10px rgba(148, 251, 210, 0.25));
        }

        .screen-safe {
          padding-bottom: calc(20px + env(safe-area-inset-bottom));
        }

        .screen-scroll {
          height: 100dvh;
          overflow-y: auto;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          padding-top: max(12px, env(safe-area-inset-top));
          touch-action: pan-y;
          scrollbar-width: none;
        }

        .screen-scroll::-webkit-scrollbar {
          width: 0;
          height: 0;
        }

        .leaderboard-link {
          font-weight: 500;
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
        }

        .contest-card:hover {
          border-color: rgba(251, 191, 36, 0.6);
          box-shadow: 0 0 30px rgba(251, 191, 36, 0.4), inset 0 0 15px rgba(251, 191, 36, 0.12);
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
          display: block;
          width: 100%;
          text-align: center;
          padding: 10px 16px;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.4) 0%, rgba(234, 88, 12, 0.5) 100%);
          border: 2px solid rgba(251, 191, 36, 0.7);
          border-radius: 10px;
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
          transition: all 0.2s ease;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .contest-cta:hover {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.6) 0%, rgba(234, 88, 12, 0.7) 100%);
          transform: scale(1.02);
          box-shadow: 0 0 30px rgba(251, 191, 36, 0.6);
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
          font-weight: 700;
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
            padding: 18px 22px;
          }

          .panel-title {
            font-size: 0.9rem;
            letter-spacing: 0.45em;
          }

          .title-line {
            width: 52px;
          }

          .start-btn-new {
            height: 50px;
          }

          .btn-text {
            font-size: 16px;
          }
        }

        @media (max-width: 560px) {
          .logo {
            height: 72px;
          }

          .panel {
            max-width: 94%;
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
          }

          .btn-text {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  )
}
