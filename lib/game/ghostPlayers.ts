import type { ThreatCategory } from './threatData'
import { getRandomItem } from './utils'
import {
  ghostPlayerNames,
  nameSuffixes,
  playerEmojis,
  specialities,
  allThreatCategories
} from './data/ghostPlayerData'

export interface GhostPlayer {
  id: string
  name: string
  level: number
  speciality: string
  category: ThreatCategory
  emoji?: string
}

export function getRandomGhostPlayer(preferredCategory?: ThreatCategory): GhostPlayer {
  const baseName = getRandomItem(ghostPlayerNames)
  const suffix = getRandomItem(nameSuffixes)
  const name = baseName + suffix

  let level: number
  const roll = Math.random()
  if (roll < 0.3) {
    level = Math.floor(Math.random() * 30) + 1
  } else if (roll < 0.6) {
    level = Math.floor(Math.random() * 40) + 31
  } else if (roll < 0.9) {
    level = Math.floor(Math.random() * 29) + 71
  } else {
    level = Math.floor(Math.random() * 51) + 100
  }

  const category: ThreatCategory = preferredCategory || getRandomItem(allThreatCategories)
  const categorySpecialities = specialities[category]
  const speciality = getRandomItem(categorySpecialities)
  const emoji = Math.random() < 0.2 ? getRandomItem(playerEmojis) : undefined

  return {
    id: `ghost_${Date.now()}_${Math.random()}`,
    name,
    level,
    speciality,
    category,
    emoji
  }
}

export function getGhostPlayerByCategory(category: ThreatCategory): GhostPlayer {
  return getRandomGhostPlayer(category)
}

export function getUniqueGhostPlayers(count: number): GhostPlayer[] {
  const players: GhostPlayer[] = []
  const usedNames = new Set<string>()

  while (players.length < count && usedNames.size < ghostPlayerNames.length) {
    const player = getRandomGhostPlayer()
    if (!usedNames.has(player.name)) {
      players.push(player)
      usedNames.add(player.name)
    }
  }

  return players
}
