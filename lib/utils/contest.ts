/** Format an ISO date string in a given IANA timezone. */
export function formatInTimeZone(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(iso))
}

/** Returns a human-readable time-remaining string, or "Ended" if in the past. */
export function getContestTimeString(endDate: string): string {
  const diff = new Date(endDate).getTime() - Date.now()
  if (diff < 0) return 'Ended'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `${days}d ${hours}h remaining`
  return `${hours}h remaining`
}

/** Returns structured days/hours/minutes object, or null if the contest has ended. */
export function getContestTimeRemaining(
  endDate: string
): { days: number; hours: number; minutes: number } | null {
  const diff = new Date(endDate).getTime() - Date.now()
  if (diff < 0) return null
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
  }
}
