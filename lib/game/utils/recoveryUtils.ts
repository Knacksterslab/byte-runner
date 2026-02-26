import { getThreatName, threatTypes } from '@/lib/game/threatData'
import { getProtectionKitById } from '@/lib/game/protectionKits'

/** Content is filled from threat + kit data per topic — same template, different copy for each level/quiz/threat. */
export interface RecoveryOverlayOption2 {
  threatId: string | null
  kitType: string
  attackLabel: string
  attackSubtext: string
  protectionLabel: string
  leftPanel: { label: string; subtexts: string[]; pointsDisplay: string; barLabel?: string; barValue?: number }
  rightPanel: { label: string; subtexts: string[]; pointsDisplay: string; barLabel?: string; barValue?: number }
  whatWasBlocked: string[]
  securePractices: string[]
  realWorldTools: { label: string; url?: string }[]
  timeLeft: number
  progress: number
}

/** Parse "Label (detail): domain.com" or "Label: domain.com" into { label, url? }. */
function parseRealWorldTool(entry: string): { label: string; url?: string } {
  const lastColon = entry.lastIndexOf(': ')
  if (lastColon === -1) return { label: entry }
  const after = entry.slice(lastColon + 2).trim()
  const looksLikeDomain = /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(\/.*)?$/i.test(after) || /\.(com|org|net|io|app)\b/i.test(after)
  if (!looksLikeDomain || /\s/.test(after)) return { label: entry }
  const url = after.startsWith('http') ? after : `https://${after}`
  const label = entry.slice(0, lastColon).trim()
  return { label: label || entry, url }
}

const DEFAULT_WHAT_WAS_BLOCKED = ['Unauthorized access', 'Data exposure', 'System impact']

export function buildRecoveryOverlayOption2(
  kitType: string,
  threatId: string | null,
  timeLeft: number,
  progress: number
): RecoveryOverlayOption2 {
  const kit = getProtectionKitById(kitType)
  const threatName = threatId ? getThreatName(threatId) : 'Privacy Threat'
  const threatData = threatId ? threatTypes.find((t) => t.id === threatId) ?? null : null

  const edu = threatData?.educationalContent ?? ['Reduce exposure', 'Block common attacks', 'Keep data safe']
  const learning = kit?.learningPoints ?? ['Use trusted tools', 'Enable built-in protections', 'Follow best practices']
  const howToGet = kit?.howToGetIt ?? ['Use trusted tools', 'Enable built-in protections', 'Follow best practices']
  const whatWasBlocked = (threatData?.consequences?.length ? threatData.consequences : DEFAULT_WHAT_WAS_BLOCKED).slice(0, 3)

  const leftPanel = threatData?.badExample
    ? { label: threatData.badExample.label, subtexts: threatData.badExample.tags, pointsDisplay: '−', barLabel: threatData.badExample.barLabel, barValue: threatData.badExample.barValue ?? 0.25 }
    : { label: threatName, subtexts: whatWasBlocked.slice(0, 2), pointsDisplay: '−' }
  const rightPanel = threatData?.goodExample
    ? { label: threatData.goodExample.label, subtexts: threatData.goodExample.tags, pointsDisplay: '+', barLabel: threatData.goodExample.barLabel, barValue: threatData.goodExample.barValue ?? 1 }
    : { label: kit?.name ?? 'Protection Kit', subtexts: learning.slice(0, 3), pointsDisplay: '+' }

  return {
    threatId,
    kitType,
    attackLabel: threatName.toUpperCase().replace(/\s+/g, ' '),
    attackSubtext: threatData?.description ?? 'Threat detected.',
    protectionLabel: kit?.name ?? 'Protection Kit',
    leftPanel,
    rightPanel,
    whatWasBlocked,
    securePractices: learning.slice(0, 3),
    realWorldTools: howToGet.slice(0, 4).map(parseRealWorldTool),
    timeLeft,
    progress,
  }
}
