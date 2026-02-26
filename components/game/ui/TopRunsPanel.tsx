import styles from './StartScreen.module.css'
import type { LeaderboardEntry } from '@/lib/store/gameStore'

interface TopRunsPanelProps {
  entries: LeaderboardEntry[]
}

export function TopRunsPanel({ entries }: TopRunsPanelProps) {
  return (
    <div className={`${styles.panel} px-5 sm:px-8 py-4 text-left`}>
      <span className={styles.panelOutline} />
      <div className={styles.panelTitle}>
        <span className={styles.titleLine} />
        <span>TOP RUNS</span>
        <span className={styles.titleLine} />
      </div>
      {entries.length === 0 ? (
        <div className="text-center text-xs text-cyan-100/70 font-semibold">No runs yet. Be the first!</div>
      ) : (
        <div className="space-y-2.5 text-sm text-slate-200 sm:text-base">
          {entries.map((entry, index) => (
            <div key={entry.id} className="flex items-center gap-2 sm:gap-4 font-mono">
              <div className={styles.medalBadge} data-rank={index + 1}>
                <span className={styles.medalNumber}>{index + 1}</span>
              </div>
              <span className={`flex-1 truncate text-sm sm:text-base font-bold ${entry.isPlayer ? 'text-yellow-300' : 'text-white'}`}>
                {entry.name}
              </span>
              <span className="text-white font-bold whitespace-nowrap text-sm sm:text-base">{entry.score} pts</span>
              <span className="text-slate-300 font-semibold whitespace-nowrap text-xs sm:text-sm hidden xs:inline">• {entry.distance}m</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
