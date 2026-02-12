 'use client'
 
 import { useEffect } from 'react'
import { Keyboard, AlertTriangle, Shield, Skull, Gamepad2, Trophy } from 'lucide-react'
import CyberspaceBackground from '@/components/CyberspaceBackground'
 import { useGameStore } from '@/lib/store/gameStore'

interface Contest {
  id: string
  name: string
  end_date: string
  prize_pool: Record<string, string> | null
  status: string
}
 
export interface StartScreenPixelProps {
  onStart: () => void
  onShowTutorial: () => void
  onSignIn?: () => void
  signInLabel?: string
  onViewLeaderboard?: () => void
  activeContests?: Contest[]
}
 
export function StartScreenPixel({ onStart, onShowTutorial, onSignIn, signInLabel = 'Sign in', onViewLeaderboard, activeContests = [] }: StartScreenPixelProps) {
  const leaderboard = useGameStore((state) => state.leaderboard)
  const ensureLeaderboardSeeded = useGameStore((state) => state.ensureLeaderboardSeeded)
  const entries = leaderboard.slice(0, 3)
 
   useEffect(() => {
     ensureLeaderboardSeeded()
   }, [ensureLeaderboardSeeded])

 
   return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#05070d] text-white">
      <CyberspaceBackground />
      <div className="absolute inset-0 nebula-background" />
      <div className="absolute inset-0 globe-boost" />
      <div className="absolute inset-0 vignette" />
 
      {onSignIn && (
        <button
          onClick={onSignIn}
          className="absolute left-6 top-6 z-20 rounded-full border border-cyan-400/50 bg-[#08131c]/80 px-3 py-1 text-[10px] sm:text-xs font-mono tracking-wide text-cyan-100 shadow-[0_0_12px_rgba(0,255,255,0.3)] transition hover:border-cyan-300 hover:text-white"
          title={signInLabel}
        >
          {signInLabel}
        </button>
      )}

      <button
        onClick={onShowTutorial}
        className="absolute right-6 top-6 z-20 flex h-[54px] w-[54px] items-center justify-center rounded-[10px] border border-cyan-300/60 bg-[#0a1a24] text-2xl font-bold text-cyan-200 shadow-[0_0_22px_rgba(0,255,255,0.45)] transition hover:scale-105"
        title="Show tutorial"
      >
        <span className="question-frame" aria-hidden="true" />
        <span className="relative z-10 text-cyan-100 drop-shadow-[0_0_8px_rgba(0,255,255,0.9)]">?</span>
      </button>

      <div className="absolute bottom-5 right-6 z-20 flex gap-2 text-xs text-cyan-100/70">
        <a href="/privacy" className="hover:text-cyan-200 transition-colors">Privacy</a>
        <span className="text-cyan-100/40">•</span>
        <a href="/terms" className="hover:text-cyan-200 transition-colors">Terms</a>
        <span className="text-cyan-100/40">•</span>
        <a href="/faq" className="hover:text-cyan-200 transition-colors">FAQ</a>
      </div>
 
      <div className="screen-safe screen-stack screen-scroll relative z-10 mx-auto flex w-full max-w-[740px] flex-col items-center px-6 pb-6 pt-3 text-center">
        <img
          src="/logo.png"
          alt="Byte Runner"
          className="logo h-20 w-auto drop-shadow-[0_0_38px_rgba(0,255,255,0.85)] sm:h-24"
        />

        <div className="mt-2 space-y-1">
          <h1 className="headline text-3xl font-bold tracking-[0.24em] text-red-100 sm:text-4xl md:text-[2.7rem]">
             THE CYBER STORM IS HERE
           </h1>
          <p className="subheadline text-base font-bold tracking-[0.5em] text-orange-200 sm:text-lg md:text-xl">
             — FORTIFY OR FALL —
           </p>
         </div>

        <div className="panel stack-panel mt-3 w-full max-w-[700px] px-8 py-4 text-left">
          <span className="panel-outline" aria-hidden="true" />
          <div className="panel-title">
            <span className="title-line" aria-hidden="true" />
            <span>HOW TO PLAY</span>
            <span className="title-line" aria-hidden="true" />
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
                <span className="text-slate-200">Avoid enemies</span>
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
 
        <div className="panel stack-panel mt-2 w-full max-w-[700px] px-8 py-4 text-left">
          <span className="panel-outline" aria-hidden="true" />
          <div className="panel-title">
            <span className="title-line" aria-hidden="true" />
            <span>TOP RUNS</span>
            <span className="title-line" aria-hidden="true" />
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

        {/* Active Contests */}
        {activeContests.length > 0 && (
          <div className="panel stack-panel mt-2 w-full max-w-[700px] px-8 py-4 text-left bg-gradient-to-br from-yellow-900/20 to-orange-900/20">
            <span className="panel-outline" aria-hidden="true" style={{ borderColor: 'rgba(234, 179, 8, 0.5)' }} />
            <div className="panel-title">
              <span className="title-line" aria-hidden="true" style={{ background: 'linear-gradient(90deg, transparent, rgba(234, 179, 8, 0.6), transparent)' }} />
              <span className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                ACTIVE CONTESTS
              </span>
              <span className="title-line" aria-hidden="true" style={{ background: 'linear-gradient(90deg, transparent, rgba(234, 179, 8, 0.6), transparent)' }} />
            </div>
            <div className="space-y-2.5">
              {activeContests.slice(0, 2).map((contest) => {
                const endDate = new Date(contest.end_date)
                const now = new Date()
                const hoursLeft = Math.max(0, Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60)))
                const topPrize = contest.prize_pool ? Object.values(contest.prize_pool)[0] : null
                
                return (
                  <div key={contest.id} className="bg-black/30 rounded-lg p-3 border border-yellow-600/30 hover:border-yellow-500/50 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-bold truncate">{contest.name}</p>
                        {topPrize && (
                          <p className="text-yellow-300 text-xs font-mono mt-0.5">
                            🏆 Top Prize: {topPrize}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-orange-300 text-xs font-mono font-bold">
                          {hoursLeft}h left
                        </p>
                      </div>
                    </div>
                    <a
                      href={`/contests/${contest.id}`}
                      className="block w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white text-xs font-bold py-2 rounded-lg transition-all text-center shadow-[0_0_12px_rgba(234,179,8,0.3)]"
                    >
                      Enter Contest →
                    </a>
                  </div>
                )
              })}
              {activeContests.length > 2 && (
                <a
                  href="/contests"
                  className="block text-center text-yellow-300 hover:text-yellow-200 text-xs font-mono transition-colors mt-2"
                >
                  View all {activeContests.length} contests →
                </a>
              )}
            </div>
          </div>
        )}

        <button
          onClick={onStart}
          className="start-btn stack-button mt-3 mb-1"
        >
          <span className="btn-glow" aria-hidden="true" />
          <span className="btn-inner">
            <Gamepad2 className="h-6 w-6 text-slate-100 drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]" />
            <span>START GAME</span>
          </span>
        </button>
       </div>
 
       <style jsx>{`
 
        .nebula-background {
          background-image: url('/space-nebula.png');
          background-size: cover;
          background-position: center;
          opacity: 0.4;
          z-index: 1;
          pointer-events: none;
        }

        .vignette {
          background: radial-gradient(ellipse at 50% 50%, transparent 0%, transparent 20%, rgba(2, 4, 10, 0.75) 55%, rgba(2, 4, 10, 0.95) 85%, rgba(0, 0, 0, 0.98) 100%);
          z-index: 3;
        }

       .globe-boost {
          background: radial-gradient(
            ellipse 120% 50% at 50% 70%, 
            rgba(0, 255, 140, 0.32) 0%,
            rgba(0, 245, 135, 0.25) 10%,
            rgba(0, 235, 130, 0.18) 20%,
            rgba(0, 220, 125, 0.12) 30%,
            rgba(0, 200, 120, 0.06) 45%,
            transparent 65%
          );
          mix-blend-mode: screen;
          opacity: 1;
          z-index: 2;
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
          background-image: linear-gradient(rgba(0, 255, 255, 0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.18) 1px, transparent 1px);
          background-size: 10px 10px;
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

        /* Gold - 1st Place with Crown/Laurels */
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

        /* Silver - 2nd Place */
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

        /* Bronze - 3rd Place */
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
          opacity: 0.7;
        }

        .medal-badge[data-rank="3"]::after {
          color: #fb923c;
          filter: drop-shadow(0 2px 4px rgba(251, 146, 60, 0.6));
        }

        .medal-badge[data-rank="3"] .medal-number {
          color: #431407;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5),
                       0 0 6px rgba(251, 146, 60, 0.5);
        }

        .leaderboard-link {
          font-family: monospace;
          letter-spacing: 0.02em;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .leaderboard-link:disabled {
          cursor: default;
        }

        .start-btn {
          position: relative;
          border-radius: 16px;
          border: 1px solid rgba(0, 210, 255, 0.95);
          padding: 10px 56px;
          background: linear-gradient(180deg, rgba(24, 200, 255, 0.95), rgba(10, 140, 230, 1));
          box-shadow: 0 0 55px rgba(0, 220, 255, 0.8), inset 0 0 22px rgba(255, 255, 255, 0.22);
          color: white;
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 0.32em;
          transition: transform 0.2s ease;
        }

        .start-btn:hover {
          transform: scale(1.03);
        }

        .btn-glow {
          position: absolute;
          inset: -8px;
          border-radius: 18px;
          background: radial-gradient(circle at 50% 0%, rgba(0, 255, 255, 0.8), transparent 60%);
          opacity: 0.9;
          pointer-events: none;
        }

        .btn-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 12px;
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

          .start-btn {
            padding: 9px 46px;
            font-size: 1rem;
            letter-spacing: 0.28em;
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

          .start-btn {
            padding: 8px 40px;
            font-size: 0.95rem;
            letter-spacing: 0.22em;
          }

          .btn-inner {
            gap: 10px;
          }
        }

        @media (max-height: 800px) {
          .logo {
            height: 72px;
          }

          .panel {
            padding: 14px 18px;
          }

          .panel-title {
            margin-bottom: 10px;
          }

          .start-btn {
            padding: 8px 42px;
            font-size: 0.98rem;
          }
        }

        @media (max-height: 700px) {
          .logo {
            height: 68px;
          }

          .headline {
            font-size: 1.9rem;
            letter-spacing: 0.2em;
          }

          .subheadline {
            font-size: 0.9rem;
            letter-spacing: 0.4em;
          }

          .stack-panel {
            margin-top: 10px !important;
            padding: 12px 16px;
          }

          .panel-title {
            font-size: 0.85rem;
            letter-spacing: 0.35em;
            margin-bottom: 8px;
          }

          .title-line {
            width: 34px;
          }

          .stack-button {
            margin-top: 10px !important;
            margin-bottom: 4px !important;
          }

          .start-btn {
            padding: 8px 38px;
            font-size: 0.95rem;
          }
        }

        @media (max-height: 700px) {
          .screen-scroll {
            overflow-y: auto;
          }
        }

        @media (pointer: coarse) {
          .screen-scroll {
            overflow-y: auto;
          }
        }

        @media (hover: none) {
          .screen-scroll {
            overflow-y: auto;
          }
        }

         @keyframes globe-spin {
           from {
             transform: rotate(0deg);
           }
           to {
             transform: rotate(360deg);
           }
         }
 
        @media (max-width: 640px) {
        }
       `}</style>
     </div>
   )
 }
