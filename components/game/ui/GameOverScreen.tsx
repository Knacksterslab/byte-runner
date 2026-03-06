'use client'

import { getThreatName } from '@/lib/game/threatData'
import { getProtectionKitForThreat } from '@/lib/game/protectionKits'
import { trackQuizAttempt, trackSocialShare, trackDeepDiveViewed } from '@/lib/analytics'
import { isCrazyGames } from '@/lib/crazygames'
import { audioManager } from '@/lib/audio'
import { recordShare } from '@/lib/api/backend'
import type { GhostPlayer } from '@/lib/game/ghostPlayers'
import type { BackendUser } from '@/lib/api/backend'

interface GameOverScreenProps {
  lastAttacker: GhostPlayer | null
  lastThreatType: string | null
  level: number
  score: number
  authStatus: string
  currentUser: BackendUser | null
  onContinueRun: () => void
  onRestart: () => void
  onSignInToSave: () => void
  onLearnMore: () => void
}

export function GameOverScreen({
  lastAttacker,
  lastThreatType,
  level,
  score,
  authStatus,
  currentUser,
  onContinueRun,
  onRestart,
  onSignInToSave,
  onLearnMore,
}: GameOverScreenProps) {
  const handleContinue = () => {
    if (lastThreatType) {
      const kit = getProtectionKitForThreat(lastThreatType)
      if (kit) trackQuizAttempt(kit.id)
    }
    onContinueRun()
  }

  const handleShare = async () => {
    audioManager.play('share')
    const tweetText = `I just scored ${score} points in Byte Runner! 🎮🔐\n\nCan you beat my score?\n\nPlay now: ${window.location.origin}`
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
    window.open(tweetUrl, '_blank', 'width=550,height=420')
    try {
      await recordShare('twitter', score)
      trackSocialShare('twitter', score)
    } catch {
      // Share recording is non-critical
    }
  }

  const handleLearnMore = () => {
    if (lastThreatType) {
      const kit = getProtectionKitForThreat(lastThreatType)
      if (kit) trackDeepDiveViewed(kit.id)
    }
    onLearnMore()
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 p-3 md:p-4 pb-[calc(12px+env(safe-area-inset-bottom))]">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/space-background-final.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.84,
            filter: 'saturate(0.72) brightness(0.9)',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,0,0,0.08)_0%,rgba(2,4,10,0.42)_72%)]" />
      </div>

      <div className="relative z-10 w-full max-w-[680px] text-center">
        <div className="mb-4 rounded-2xl border border-red-500/55 bg-[#1a0a12]/45 px-4 py-3 shadow-[0_0_20px_rgba(255,80,80,0.2)]">
          <p className="text-white text-[1.05rem] sm:text-xl font-mono">
            <span className="mr-2 text-2xl">{lastAttacker?.emoji ?? '🔥'}</span>
            Killed by <span className="font-bold text-red-400">{lastAttacker?.name ?? 'Unknown Threat'}</span>{' '}
            {lastAttacker && (
              <span className={`${lastAttacker.level >= 100 ? 'text-red-400' : lastAttacker.level >= 71 ? 'text-yellow-400' : 'text-cyan-400'}`}>
                (Lv{lastAttacker.level}[{lastAttacker.level >= 71 ? 'MID' : 'LOW'}])
              </span>
            )}
          </p>
          <p className="mt-1 text-yellow-200 text-sm sm:text-base font-mono">
            Cause: {lastThreatType ? getThreatName(lastThreatType) : 'Unknown Cause'}
          </p>
        </div>

        <div className="mb-5 text-white font-mono text-2xl sm:text-3xl tracking-wide">
          <span className="text-gray-300">Level:</span> <span className="font-extrabold text-cyan-300">{level}</span>
          <span className="mx-3 text-gray-500">•</span>
          <span className="text-gray-300">Score:</span> <span className="font-extrabold text-yellow-300">{score}</span>
        </div>

        <div className="rounded-[24px] border-2 border-cyan-300/80 bg-[#050c1b]/82 px-3 py-4 sm:px-5 sm:py-5 shadow-[0_0_30px_rgba(34,211,238,0.35)]">
          <h3 className="mb-4 flex items-center justify-center gap-3 text-cyan-100 text-[1.8rem] sm:text-[2.2rem] font-black font-mono tracking-[0.16em]">
            <span className="h-px w-10 sm:w-14 bg-cyan-300/65" />
            <span>⚡ CONTINUE RUN</span>
            <span className="h-px w-10 sm:w-14 bg-cyan-300/65" />
          </h3>

          <button
            onClick={handleContinue}
            className="w-full rounded-full border border-cyan-100/55 bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 px-4 py-2.5 sm:py-3 text-[1.25rem] sm:text-[1.5rem] font-black font-mono tracking-[0.12em] text-white shadow-[0_0_26px_rgba(80,200,255,0.55)]"
          >
            CONTINUE RUN
          </button>

          <p className="mt-3 text-gray-200 text-[1rem] sm:text-[1.2rem] font-mono">Take 30s quiz to keep level & kits</p>
          <div className="my-4 h-px bg-cyan-300/20" />

          <button
            onClick={onRestart}
            className="w-full rounded-full border border-cyan-300/45 bg-[#07101f]/78 px-4 py-2.5 sm:py-3 text-[1.15rem] sm:text-[1.35rem] font-semibold font-mono tracking-[0.05em] text-cyan-100 hover:border-cyan-300/75 transition-colors"
          >
            Restart from scratch
          </button>
        </div>

        <div className="mt-5 text-white font-mono text-[1.2rem] sm:text-[1.4rem]">
          {!isCrazyGames() && (
            <>
              {authStatus !== 'authed' ? (
                <button onClick={onSignInToSave} className="text-white hover:text-cyan-200 transition-colors">
                  Sign in to save score
                </button>
              ) : (
                <span className="text-cyan-400">✓ Signed in as {currentUser?.username || 'Player'}</span>
              )}
              <span className="mx-3 text-gray-400">•</span>
            </>
          )}
          <button onClick={handleShare} className="font-semibold hover:text-cyan-200 transition-colors">
            Share run
          </button>
          <span className="mx-3 text-gray-400">•</span>
          <a
            href="https://x.com/playByteRunner"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-200 transition-colors"
          >
            Follow us
          </a>
        </div>

        {lastThreatType && (
          <button
            onClick={handleLearnMore}
            className="mt-3 text-cyan-300 text-[1.2rem] sm:text-[1.35rem] font-mono hover:text-cyan-200 transition-colors"
          >
            More details →
          </button>
        )}
      </div>
    </div>
  )
}
