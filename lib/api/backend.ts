export interface BackendUser {
  id: string
  username: string | null
  email: string | null
  continueTokens: number
  featuredBadge: string | null
  createdAt: string
}

export interface Badge {
  id: string
  name: string
  description: string
  emoji: string
  category: 'achievement' | 'social' | 'contest' | 'skill'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  requirement_type: string
  requirement_value: number
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  badges: Badge
}

export interface LeaderboardItem {
  username: string
  score: number
  distance: number
  createdAt: string
  featuredBadge?: string | null
  badgeEmoji?: string | null
}

interface AuthResult {
  status: 'OK' | 'FIELD_ERROR' | 'WRONG_CREDENTIALS_ERROR' | 'SIGN_IN_NOT_ALLOWED' | 'SIGN_UP_NOT_ALLOWED'
  message?: string
  formFields?: Array<{ id: string; error?: string }>
}

const RAW_API_DOMAIN = process.env.NEXT_PUBLIC_API_DOMAIN || 'http://localhost:4000'
const API_DOMAIN = RAW_API_DOMAIN.startsWith('http://') || RAW_API_DOMAIN.startsWith('https://')
  ? RAW_API_DOMAIN.replace(/\/+$/, '')
  : `https://${RAW_API_DOMAIN.replace(/\/+$/, '')}`
const ANTI_CSRF_KEY = 'byte-runner-anti-csrf'
const FDI_VERSION = '1.18'
let cachedAntiCsrf: string | null = null

function getAntiCsrf(): string | null {
  if (cachedAntiCsrf !== null) return cachedAntiCsrf
  if (typeof window === 'undefined') return null
  cachedAntiCsrf = window.localStorage.getItem(ANTI_CSRF_KEY)
  return cachedAntiCsrf
}

function setAntiCsrf(value: string) {
  cachedAntiCsrf = value
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(ANTI_CSRF_KEY, value)
  }
}

function extractAntiCsrfFromFrontToken(frontToken: string | null): string | null {
  if (!frontToken) return null
  try {
    // front-token is a JWT-like token: header.payload.signature
    const parts = frontToken.split('.')
    if (parts.length < 2) return null
    
    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]))
    return payload?.antiCsrfToken || payload?.anti_csrf || null
  } catch {
    return null
  }
}

/**
 * SINGLE SOURCE OF TRUTH: Extract anti-CSRF token from SuperTokens response
 * Checks all possible locations: body JSON, anti-csrf header, front-token JWT
 */
function extractAndStoreAntiCsrf(res: Response, bodyJson?: any): void {
  const bodyAntiCsrf = bodyJson?.antiCsrfToken || null
  const headerAntiCsrf = res.headers.get('anti-csrf')
  const frontToken = res.headers.get('front-token')
  const frontTokenAntiCsrf = extractAntiCsrfFromFrontToken(frontToken)
  
  const antiCsrf = bodyAntiCsrf || headerAntiCsrf || frontTokenAntiCsrf
  
  if (antiCsrf) {
    setAntiCsrf(antiCsrf)
  }
}

async function refreshSession(): Promise<boolean> {
  const headers = new Headers()
  headers.set('content-type', 'application/json')
  headers.set('rid', 'session')
  headers.set('fdi-version', FDI_VERSION)
  headers.set('st-auth-mode', 'cookie')

  const antiCsrf = getAntiCsrf()
  if (antiCsrf) headers.set('anti-csrf', antiCsrf)

  const res = await fetch(`${API_DOMAIN}/auth/session/refresh`, {
    method: 'POST',
    headers,
    credentials: 'include',
  })

  // Use single source of truth for anti-CSRF extraction
  extractAndStoreAntiCsrf(res)

  return res.ok
}

async function fetchWithSession(input: string, init: RequestInit = {}, allowRetry = true): Promise<Response> {
  const headers = new Headers(init.headers || {})
  headers.set('content-type', 'application/json')
  const antiCsrf = getAntiCsrf()
  if (antiCsrf) headers.set('anti-csrf', antiCsrf)

  const res = await fetch(`${API_DOMAIN}${input}`, {
    ...init,
    headers,
    credentials: 'include'
  })

  // Use single source of truth for anti-CSRF extraction
  extractAndStoreAntiCsrf(res)

  if (res.status === 401 && allowRetry && !input.startsWith('/auth/session/refresh')) {
    try {
      const refreshed = await refreshSession()
      if (refreshed) {
        return fetchWithSession(input, init, false)
      }
    } catch {
      // Fall through and return original 401 response
    }
  }

  return res
}

export async function getCurrentUser(): Promise<BackendUser | null> {
  const res = await fetchWithSession('/users/me', { method: 'GET' })

  if (res.status === 401) return null
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to fetch user.')
  }
  return res.json()
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardItem[]> {
  const res = await fetchWithSession(`/leaderboard/current?limit=${limit}`, { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch leaderboard.')
  return res.json()
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  // FORCE clear all SuperTokens cookies server-side
  try {
    await fetch(`${API_DOMAIN}/users/clear-session`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (e) {
    // Ignore errors
  }

  // Clear any existing anti-csrf token to ensure fresh signup
  cachedAntiCsrf = null;
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(ANTI_CSRF_KEY);
  }

  const requestHeaders = {
    'content-type': 'application/json',
    rid: 'emailpassword',
    'fdi-version': FDI_VERSION,
    'st-auth-mode': 'cookie',
  }

  const res = await fetch(`${API_DOMAIN}/auth/signup`, {
    method: 'POST',
    headers: requestHeaders,
    credentials: 'include',
    body: JSON.stringify({
      formFields: [
        { id: 'email', value: email },
        { id: 'password', value: password }
      ]
    })
  })

  const jsonResponse = await res.json()
  
  // Use single source of truth for anti-CSRF extraction
  extractAndStoreAntiCsrf(res, jsonResponse)

  return jsonResponse
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  // FORCE clear all SuperTokens cookies server-side
  try {
    await fetch(`${API_DOMAIN}/users/clear-session`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (e) {
    // Ignore errors
  }

  // Clear any existing anti-csrf token
  cachedAntiCsrf = null;
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(ANTI_CSRF_KEY);
  }

  const res = await fetch(`${API_DOMAIN}/auth/signin`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      rid: 'emailpassword',
      'fdi-version': FDI_VERSION,
      'st-auth-mode': 'cookie',
    },
    credentials: 'include',
    body: JSON.stringify({
      formFields: [
        { id: 'email', value: email },
        { id: 'password', value: password }
      ]
    })
  })

  const jsonResponse = await res.json()
  
  // Use single source of truth for anti-CSRF extraction
  extractAndStoreAntiCsrf(res, jsonResponse)

  return jsonResponse
}

export async function setUsername(username: string): Promise<BackendUser> {
  const res = await fetchWithSession('/users/username', {
    method: 'POST',
    body: JSON.stringify({ username })
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to set username.')
  }
  return res.json()
}

export async function signOut() {
  const res = await fetchWithSession('/auth/signout', {
    method: 'POST',
    headers: {
      rid: 'session',
      'fdi-version': FDI_VERSION,
      'st-auth-mode': 'cookie',
    },
  })
  if (!res.ok) {
    throw new Error('Failed to sign out.')
  }
  return res.json()
}

export async function submitRun(payload: {
  score: number
  distance: number
  durationMs: number
  clientVersion?: string
}) {
  const startRes = await fetchWithSession('/runs/start', { method: 'POST' })
  if (!startRes.ok) throw new Error('Failed to start run.')
  const startPayload = await startRes.json()

  const finishRes = await fetchWithSession('/runs/finish', {
    method: 'POST',
    body: JSON.stringify({
      runToken: startPayload.runToken,
      score: payload.score,
      distance: payload.distance,
      durationMs: payload.durationMs,
      clientVersion: payload.clientVersion
    })
  })

  if (!finishRes.ok) {
    const payload = await finishRes.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to submit run.')
  }

  return finishRes.json()
}

export async function recordShare(platform: string, score?: number, runId?: string): Promise<{ id: string; platform: string; createdAt: string }> {
  const res = await fetchWithSession('/shares', {
    method: 'POST',
    body: JSON.stringify({
      platform,
      score,
      runId
    })
  })

  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to record share.')
  }

  return res.json()
}

export async function getShareCount(): Promise<number> {
  const res = await fetchWithSession('/shares/count', { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch share count.')
  const data = await res.json()
  return data.count
}

// Contest types
export interface Contest {
  id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  contest_timezone: string
  status: 'upcoming' | 'active' | 'ended' | 'cancelled'
  prize_pool: Record<string, string> | null
  rules: Record<string, any> | null
  max_entries_per_user: number
  created_at: string
  updated_at: string
}

export interface ContestLeaderboardEntry {
  rank: number
  userId: string
  username: string
  score: number
  distance: number
  createdAt: string
}

export interface PrizeClaim {
  id: string
  contest_id: string
  rank: number
  prize_description: string
  claim_status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'paid'
  contact_info: any
  submitted_at: string | null
  created_at: string
}

// Contest API functions
export async function getAllContests(status?: string): Promise<Contest[]> {
  const url = status ? `/contests?status=${status}` : '/contests'
  const res = await fetchWithSession(url, { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch contests.')
  return res.json()
}

export async function getActiveContests(): Promise<Contest[]> {
  const res = await fetchWithSession('/contests/active', { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch active contests.')
  return res.json()
}

export async function getContest(contestId: string): Promise<Contest> {
  const res = await fetchWithSession(`/contests/${contestId}`, { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch contest.')
  return res.json()
}

export async function getContestLeaderboard(contestId: string, limit = 100): Promise<ContestLeaderboardEntry[]> {
  const res = await fetchWithSession(`/contests/${contestId}/leaderboard?limit=${limit}`, { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch contest leaderboard.')
  return res.json()
}

export async function enterContest(contestId: string, runId: string, score: number, distance: number): Promise<any> {
  const res = await fetchWithSession(`/contests/${contestId}/enter`, {
    method: 'POST',
    body: JSON.stringify({ runId, score, distance })
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to enter contest.')
  }
  return res.json()
}

export async function getMyContestEntries(contestId: string): Promise<{ entries: any[]; rank: number | null }> {
  const res = await fetchWithSession(`/contests/${contestId}/my-entries`, { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch contest entries.')
  return res.json()
}

// Prize claims API functions
export async function getMyClaims(): Promise<PrizeClaim[]> {
  const res = await fetchWithSession('/prize-claims/my-claims', { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch prize claims.')
  return res.json()
}

export async function getMyClaimForContest(contestId: string): Promise<PrizeClaim | null> {
  const res = await fetchWithSession(`/prize-claims/contest/${contestId}/my-claim`, { method: 'GET' })
  if (!res.ok) return null
  return res.json()
}

export async function submitPrizeClaim(claimId: string, contactInfo: any): Promise<any> {
  const res = await fetchWithSession(`/prize-claims/${claimId}/submit`, {
    method: 'POST',
    body: JSON.stringify(contactInfo)
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to submit prize claim.')
  }
  return res.json()
}

// Badges API functions
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
    body: JSON.stringify({ badgeId })
  })
  if (!res.ok) throw new Error('Failed to set featured badge.')
  return res.json()
}
