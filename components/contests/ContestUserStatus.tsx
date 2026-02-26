import { User, Trophy } from 'lucide-react'
import Link from 'next/link'
import type { PrizeClaim } from '@/lib/api/backend'

interface ContestEntry {
  score: number
  distance: number
}

interface MyEntries {
  rank?: number
  entries: ContestEntry[]
}

interface UserPrize {
  rank: number
  prize: string
}

interface ContestUserStatusProps {
  contestStatus: string
  leaderboardCount: number
  myEntries: MyEntries
  myClaim: PrizeClaim | null
  userPrize: UserPrize | null
  onClaimPrize: () => void
}

const CLAIM_LABEL: Record<string, string> = {
  pending: 'Not Claimed',
  submitted: 'Claim Submitted',
  approved: 'Approved',
  paid: 'Paid ✓',
}

const CLAIM_COLOR: Record<string, string> = {
  submitted: 'bg-blue-600/80',
  approved: 'bg-green-600/80',
  paid: 'bg-emerald-600/80',
}

export function ContestUserStatus({
  contestStatus,
  leaderboardCount,
  myEntries,
  myClaim,
  userPrize,
  onClaimPrize,
}: ContestUserStatusProps) {
  return (
    <div className="mb-8 bg-gradient-to-br from-cyan-900/40 to-blue-900/30 border-2 border-cyan-400/60 rounded-lg p-6 backdrop-blur-sm shadow-[0_0_20px_rgba(34,211,238,0.3)]">
      <h2 className="text-2xl font-bold text-cyan-300 mb-6 flex items-center gap-2">
        <User className="w-6 h-6" />
        Your Contest Status
      </h2>

      {myEntries.rank && (
        <div className="mb-6 text-center bg-cyan-500/20 border-2 border-cyan-400/50 rounded-xl py-6 px-4">
          <p className="text-cyan-300 text-sm font-semibold mb-2">CURRENT RANK</p>
          <p className="text-5xl sm:text-6xl font-black text-white mb-2">#{myEntries.rank}</p>
          <p className="text-gray-300 text-sm">
            out of {leaderboardCount} {leaderboardCount === 1 ? 'player' : 'players'}
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

      {userPrize && contestStatus === 'ended' && (
        <div className="mt-4 bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-2 border-yellow-600/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-yellow-300 text-sm font-semibold">🎉 You Won!</div>
              <div className="text-white text-xl font-bold">{userPrize.prize}</div>
            </div>
            {myClaim?.claim_status && (
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${CLAIM_COLOR[myClaim.claim_status] ?? 'bg-gray-600/80'}`}>
                {CLAIM_LABEL[myClaim.claim_status] ?? myClaim.claim_status}
              </div>
            )}
          </div>
          {myClaim?.claim_status === 'pending' ? (
            <button
              onClick={onClaimPrize}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-5 h-5" /> Claim Your Prize
            </button>
          ) : myClaim?.claim_status === 'submitted' ? (
            <div className="text-center text-gray-300 text-sm">Your claim has been submitted. Check your email for updates.</div>
          ) : myClaim?.claim_status === 'paid' ? (
            <div className="text-center text-green-400 text-sm font-semibold">Prize has been sent! Check your email/wallet.</div>
          ) : null}
        </div>
      )}

      {contestStatus === 'active' && (
        <Link href="/">
          <button className="mt-4 w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition-all">
            Play Now to Enter
          </button>
        </Link>
      )}
    </div>
  )
}
