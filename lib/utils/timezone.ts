const FALLBACK_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
]

export function getSupportedTimeZones(): string[] {
  try {
    const supportedValuesOf = (Intl as any).supportedValuesOf
    if (typeof supportedValuesOf === 'function') {
      return supportedValuesOf('timeZone')
    }
  } catch {
    // Fallback below
  }
  return FALLBACK_TIMEZONES
}

function toPartsInTimeZone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    hour12: false,
  })
  const parts = formatter.formatToParts(date)
  const pick = (type: string) => parts.find((part) => part.type === type)?.value || '00'
  return {
    year: Number(pick('year')),
    month: Number(pick('month')),
    day: Number(pick('day')),
    hour: Number(pick('hour')),
    minute: Number(pick('minute')),
    second: Number(pick('second')),
  }
}

export function zonedDateTimeToIso(datetimeLocal: string, timeZone: string): string {
  if (!datetimeLocal) return ''
  const [datePart, timePart = '00:00'] = datetimeLocal.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)
  const targetUtcMillis = Date.UTC(year, month - 1, day, hour, minute, 0)

  let guessUtcMillis = targetUtcMillis
  for (let i = 0; i < 4; i += 1) {
    const guessParts = toPartsInTimeZone(new Date(guessUtcMillis), timeZone)
    const guessAsUtcMillis = Date.UTC(
      guessParts.year,
      guessParts.month - 1,
      guessParts.day,
      guessParts.hour,
      guessParts.minute,
      guessParts.second,
    )
    guessUtcMillis += targetUtcMillis - guessAsUtcMillis
  }

  return new Date(guessUtcMillis).toISOString()
}

export function isoToDatetimeLocalInZone(isoString: string, timeZone: string): string {
  if (!isoString) return ''
  const parts = toPartsInTimeZone(new Date(isoString), timeZone)
  return `${parts.year.toString().padStart(4, '0')}-${parts.month.toString().padStart(2, '0')}-${parts.day.toString().padStart(2, '0')}T${parts.hour.toString().padStart(2, '0')}:${parts.minute.toString().padStart(2, '0')}`
}

export function formatDateInTimeZone(isoString: string, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(isoString))
}
