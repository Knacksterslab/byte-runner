import { getRandomItem, findById, filterByCategory } from './utils'
import { threatsBasic } from './data/threatsBasic'
import { threatsIntermediate } from './data/threatsIntermediate'
import { threatsAdvanced } from './data/threatsAdvanced'
import { threatsEnterprise } from './data/threatsEnterprise'
import { threatsModern } from './data/threatsModern'

export type ThreatCategory =
  | 'password'
  | 'phishing'
  | 'updates'
  | 'privacy'
  | 'wifi'
  | 'authentication'
  | 'data-loss'
  | 'social-engineering'
  | 'physical-security'
  | 'secure-disposal'
  | 'policy'
  | 'incident-reporting'
  | 'compliance'
  | 'remote-work'
  | 'meeting-security'
  | 'travel-security'
  | 'data-protection'
  | 'supply-chain'
  | 'insider-threats'
  | 'email-security'
  | 'data-classification'
  | 'social-media'
  | 'removable-media'
export type DamageType = 'instant' | 'minor'

/** Outcomes that were prevented when protection activated (for "What was blocked" section). */
export interface ThreatConsequences {
  /** Short labels for bad outcomes this threat could cause, e.g. "Account takeover" */
  whatWasBlocked: string[]
}

/** Optional concrete bad/good example for recovery overlay panels (e.g. bad password vs good password). */
export interface ThreatExample {
  label: string
  tags: string[]
  /** Optional progress bar label under tags (e.g. "Weak • Leaked", "14 Chars • Safe"). */
  barLabel?: string
  /** Bar fill 0–1; left panel typically low (e.g. 0.25), right panel 1. */
  barValue?: number
}

export interface ThreatType {
  id: string
  name: string
  category: ThreatCategory
  color: string
  damage: DamageType
  emoji: string
  description: string
  realWorldExample: string
  educationalContent: string[]
  /** Outcomes prevented when protection activates; used for "What was blocked". If missing, fallback is used. */
  consequences?: string[]
  /** Optional bad example for left panel (e.g. weak password label + tags). */
  badExample?: ThreatExample
  /** Optional good example for right panel (e.g. strong password label + tags). */
  goodExample?: ThreatExample
}

export const threatTypes: ThreatType[] = [
  ...threatsBasic,
  ...threatsIntermediate,
  ...threatsAdvanced,
  ...threatsEnterprise,
  ...threatsModern
]

export function getRandomThreat(): ThreatType {
  return getRandomItem(threatTypes)
}

export function getThreatById(id: string): ThreatType | undefined {
  return findById(threatTypes, id)
}

export function getThreatsByCategory(category: ThreatCategory): ThreatType[] {
  return filterByCategory(threatTypes, category)
}

export function getThreatName(threatId: string): string {
  const threat = getThreatById(threatId)
  return threat ? threat.name : 'Unknown Threat'
}

export function getQuickTip(threatId: string): string {
  const threat = getThreatById(threatId)
  return threat && threat.educationalContent.length > 0
    ? threat.educationalContent[0]
    : 'Stay vigilant online!'
}
