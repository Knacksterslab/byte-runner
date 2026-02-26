import type { ThreatCategory } from './threatData'
import { getRandomByFilter, findById, filterByCategory } from './utils'
import { passwordAndUpdatePuzzles } from './data/puzzleDataA'
import { privacyAndWifiPuzzles } from './data/puzzleDataB'

export interface PuzzleChoice {
  text: string
  isCorrect: boolean
  explanation: string
  redFlags?: string[]
}

export interface PuzzleTemplate {
  id: string
  category: ThreatCategory
  scenario: string
  choices: PuzzleChoice[]
}

export const puzzleTemplates: PuzzleTemplate[] = [
  ...passwordAndUpdatePuzzles,
  ...privacyAndWifiPuzzles
]

export function getRandomPuzzle(category: ThreatCategory): PuzzleTemplate | null {
  return getRandomByFilter(puzzleTemplates, p => p.category === category)
}

export function getPuzzlesByCategory(category: ThreatCategory): PuzzleTemplate[] {
  return filterByCategory(puzzleTemplates, category)
}

export function getPuzzleById(id: string): PuzzleTemplate | undefined {
  return findById(puzzleTemplates, id)
}
