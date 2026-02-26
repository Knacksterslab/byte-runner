import { fetchWithSession } from './client'
import type { Badge, UserBadge } from './types'

export async function getAllBadges(): Promise<Badge[]> {
  const res = await fetchWithSession('/badges', { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch badges.')
  return res.json()
}

export async function getMyBadges(): Promise<UserBadge[]> {
  const res = await fetchWithSession('/badges/my-badges', { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch user badges.')
  return res.json()
}

export async function checkBadges(): Promise<{ awarded: string[]; message: string }> {
  const res = await fetchWithSession('/badges/check', { method: 'POST' })
  if (!res.ok) throw new Error('Failed to check badges.')
  return res.json()
}

export async function setFeaturedBadge(badgeId: string): Promise<any> {
  const res = await fetchWithSession('/badges/featured', {
    method: 'POST',
    body: JSON.stringify({ badgeId }),
  })
  if (!res.ok) throw new Error('Failed to set featured badge.')
  return res.json()
}
