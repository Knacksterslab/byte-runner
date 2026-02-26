import type { ThreatCategory } from './threatData'
import { getRandomItem, findById } from './utils'
import { kitsBasic } from './data/kitsBasic'
import { kitsIntermediate } from './data/kitsIntermediate'
import { kitsAdvanced } from './data/kitsAdvanced'
import { kitsEnterprise } from './data/kitsEnterprise'
import { kitsModern } from './data/kitsModern'

export interface ProtectionKit {
  id: string
  name: string
  protectsAgainst: ThreatCategory
  description: string
  learningPoints: string[]
  emoji: string
  color: string
  whatItIs: string
  whyItMatters: string
  howToGetIt: string[]
  howItWorks: string
  realWorldExample: {
    title: string
    description: string
    impact: string
  }
  stepByStepSetup: {
    platform: string
    steps: string[]
  }[]
}

export const protectionKits: ProtectionKit[] = [
  ...kitsBasic,
  ...kitsIntermediate,
  ...kitsAdvanced,
  ...kitsEnterprise,
  ...kitsModern
]

export function getProtectionKitById(id: string): ProtectionKit | undefined {
  return findById(protectionKits, id)
}

export { getProtectionKitName, getProtectionKitForThreat, getProtectionKitForCategory } from './protectionKitHelpers'

export function getRandomProtectionKit(): ProtectionKit {
  return getRandomItem(protectionKits)
}
