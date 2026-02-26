import { Trophy } from 'lucide-react'
import Link from 'next/link'
import styles from './StartScreen.module.css'
import type { Contest } from '@/lib/api/backend'

interface ActiveContestsPanelProps {
  activeContests: Contest[]
}

export function ActiveContestsPanel({ activeContests }: ActiveContestsPanelProps) {
  return (
    <div className={`${styles.panel} mt-6 sm:mt-8 w-full px-5 sm:px-8 py-4 text-left`}>
      <span className={styles.panelOutline} />
      <div className={styles.panelTitle}>
        <span className={styles.titleLine} />
        <span className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          ACTIVE CONTESTS
        </span>
        <span className={styles.titleLine} />
      </div>

      {activeContests.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
          {activeContests.slice(0, 2).map((contest) => {
            const hoursLeft = Math.max(0, Math.floor((new Date(contest.end_date).getTime() - Date.now()) / (1000 * 60 * 60)))
            const topPrize = contest.prize_pool ? Object.values(contest.prize_pool)[0] : null
            return (
              <div key={contest.id} className={styles.contestCard}>
                <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm sm:text-base font-extrabold truncate mb-1">{contest.name}</h3>
                    {topPrize && (
                      <p className="text-yellow-300 text-xs sm:text-sm font-mono">
                        🏆 <span className="font-bold">Top Prize:</span> <span className="font-extrabold">{topPrize}</span>
                      </p>
                    )}
                  </div>
                  <div className={`${styles.contestTimer} flex-shrink-0`}>
                    <span className="text-base sm:text-lg font-bold">{hoursLeft}h</span>
                    <span className="text-xs">left</span>
                  </div>
                </div>
                <Link href={`/contests/${contest.slug || contest.id}`}>
                  <button type="button" className={styles.contestCta}>
                    <span>View Contest</span>
                    <span className="text-lg">→</span>
                  </button>
                </Link>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
          {[
            { name: 'Weekly Championship', prize: '$500' },
            { name: 'Speed Run Challenge', prize: '$250' },
          ].map(({ name, prize }) => (
            <div key={name} className={`${styles.contestCard} opacity-60`}>
              <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-sm sm:text-base font-extrabold mb-1">{name}</h3>
                  <p className="text-yellow-300 text-xs sm:text-sm font-mono">
                    🏆 <span className="font-bold">Top Prize:</span> <span className="font-extrabold">{prize}</span>
                  </p>
                </div>
                <div className={`${styles.contestTimer} flex-shrink-0`}>
                  <span className="text-base sm:text-lg font-bold">--</span>
                  <span className="text-xs">hours</span>
                </div>
              </div>
              <div className={styles.contestCtaDisabled}><span>Coming Soon</span></div>
            </div>
          ))}
        </div>
      )}

      {activeContests.length > 2 && (
        <div className="mt-4 text-center">
          <Link href="/contests" className="text-cyan-400 hover:text-cyan-300 text-base font-mono font-bold transition-colors inline-block px-4 py-2 rounded-lg hover:bg-cyan-400/10">
            View All Contests & Standings →
          </Link>
        </div>
      )}
    </div>
  )
}
