import { Clock, DollarSign } from 'lucide-react'
import styles from './StartScreen.module.css'
import type { HourlyChallenge, HourlyChallengeEligibility } from '@/lib/api/backend'

interface HourlyChallengeBannerProps {
  challenge: HourlyChallenge
  isAuthenticated: boolean
  eligibility?: HourlyChallengeEligibility | null
  eligibilityLoading?: boolean
}

function minutesLeftInChallenge(challengeHour: string): number {
  const nextHour = new Date(challengeHour)
  nextHour.setHours(nextHour.getHours() + 1)
  return Math.max(0, Math.floor((nextHour.getTime() - Date.now()) / (1000 * 60)))
}

function formatTimeUntil(isoTime: string | null): string | null {
  if (!isoTime) return null
  const diffMs = new Date(isoTime).getTime() - Date.now()
  if (!Number.isFinite(diffMs) || diffMs <= 0) return 'now'
  const totalMinutes = Math.ceil(diffMs / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours <= 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

export function HourlyChallengeBanner({
  challenge,
  isAuthenticated,
  eligibility = null,
  eligibilityLoading = false,
}: HourlyChallengeBannerProps) {
  const nextEligibilityWindow = formatTimeUntil(eligibility?.nextEligibleAt ?? null)

  return (
    <div className="w-full max-w-full md:max-w-[calc(50%-1rem)] mb-4 sm:mb-6">
      <div className={`${styles.panel} px-5 sm:px-8 py-4 text-left bg-gradient-to-br from-green-900/20 to-emerald-900/20`}>
        <span className={styles.panelOutline} style={{ borderColor: 'rgba(34, 197, 94, 0.5)' }} />
        <div className={styles.panelTitle}>
          <span className={styles.titleLine} style={{ background: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.6), transparent)' }} />
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            HOURLY CHALLENGE
          </span>
          <span className={styles.titleLine} style={{ background: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.6), transparent)' }} />
        </div>
        <div className="bg-black/30 rounded-lg p-3 sm:p-4 border border-green-600/30">
          <div className="flex items-center justify-between gap-3 mb-2 sm:mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-white text-base sm:text-lg font-bold">Win $1.00</p>
                <p className="text-green-300 text-[10px] sm:text-xs font-mono">
                  Highest eligible score this hour wins
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-orange-300 text-xs sm:text-sm font-mono font-bold">
                {minutesLeftInChallenge(challenge.challengeHour)}min left
              </p>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-300 space-y-2">
            <p>
              Your best run this hour is counted automatically.
              Prize eligibility: account age 24h+, at least 5 completed runs, max 3 wins/day.
            </p>
            {!isAuthenticated && (
              <p className="text-cyan-200/90">Sign in to see your personal eligibility status.</p>
            )}
            {isAuthenticated && eligibilityLoading && (
              <p className="text-cyan-200/90">Checking your eligibility...</p>
            )}
            {isAuthenticated && !eligibilityLoading && eligibility?.eligible && (
              <p className="text-emerald-300 font-semibold">You are eligible for this hourly prize.</p>
            )}
            {isAuthenticated && !eligibilityLoading && eligibility && !eligibility.eligible && (
              <p className="text-amber-300">
                Not eligible yet: {eligibility.reason}
                {nextEligibilityWindow && nextEligibilityWindow !== 'now'
                  ? ` Eligible in about ${nextEligibilityWindow}.`
                  : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
