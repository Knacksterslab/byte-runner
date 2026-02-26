// Shared utility functions for game modules
// Eliminates DRY violations across the codebase

/**
 * Get a random item from an array
 * @param array - Array to select from
 * @returns Random item from the array
 */
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Filter an array and return a random item from the filtered results
 * @param array - Array to filter and select from
 * @param predicate - Filter function
 * @returns Random item matching the predicate, or null if none match
 */
export function getRandomByFilter<T>(
  array: T[],
  predicate: (item: T) => boolean
): T | null {
  const filtered = array.filter(predicate)
  return filtered.length > 0 ? getRandomItem(filtered) : null
}

/**
 * Find an item by its ID
 * @param array - Array of items with id property
 * @param id - ID to search for
 * @returns Item with matching ID, or undefined if not found
 */
export function findById<T extends { id: string }>(
  array: T[],
  id: string
): T | undefined {
  return array.find(item => item.id === id)
}

/**
 * Filter items by category
 * @param array - Array of items with category property
 * @param category - Category to filter by
 * @returns Array of items matching the category
 */
export function filterByCategory<T extends { category: string }>(
  array: T[],
  category: string
): T[] {
  return array.filter(item => item.category === category)
}

/**
 * Calculate total count across all kit types in inventory
 * @param kitInventory - Kit inventory object
 * @returns Total number of kits
 */
export function calculateTotalKits(kitInventory: Record<string, number>): number {
  return Object.values(kitInventory).reduce((sum, count) => sum + (count || 0), 0)
}

/**
 * Axis-aligned bounding box collision test.
 * All coordinates are top-left origin.
 */
export function isColliding(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}
