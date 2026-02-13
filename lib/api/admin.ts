// Admin API functions
const RAW_API_DOMAIN = process.env.NEXT_PUBLIC_API_DOMAIN || 'http://localhost:4000'
const API_DOMAIN = RAW_API_DOMAIN.startsWith('http://') || RAW_API_DOMAIN.startsWith('https://')
  ? RAW_API_DOMAIN.replace(/\/+$/, '')
  : `https://${RAW_API_DOMAIN.replace(/\/+$/, '')}`
const ANTI_CSRF_KEY = 'byte-runner-anti-csrf'
const FDI_VERSION = '1.18'

function getAntiCsrf(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(ANTI_CSRF_KEY)
}

function setAntiCsrf(value: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(ANTI_CSRF_KEY, value)
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

  const nextAntiCsrf = res.headers.get('anti-csrf')
  if (nextAntiCsrf) setAntiCsrf(nextAntiCsrf)

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

  const nextAntiCsrf = res.headers.get('anti-csrf')
  if (nextAntiCsrf) setAntiCsrf(nextAntiCsrf)

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

export interface CreateContestData {
  name: string
  description?: string
  startDate: string
  endDate: string
  contestTimezone?: string
  status?: 'upcoming' | 'active' | 'ended' | 'cancelled'
  prizePool?: Record<string, string>
  rules?: Record<string, any>
  maxEntriesPerUser?: number
}

export async function checkIsAdmin(): Promise<boolean> {
  try {
    const res = await fetchWithSession('/contests/admin/check', { method: 'GET' })
    return res.ok
  } catch {
    return false
  }
}

export async function createContest(data: CreateContestData): Promise<any> {
  const res = await fetchWithSession('/contests/admin/create', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to create contest.')
  }
  
  return res.json()
}

export async function updateContest(contestId: string, data: Partial<CreateContestData>): Promise<any> {
  console.log('🔄 Updating contest:', contestId, 'with data:', data)
  
  const res = await fetchWithSession(`/contests/admin/${contestId}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
  
  console.log('📡 Update response status:', res.status, res.statusText)
  
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    console.error('❌ Update failed with payload:', payload)
    throw new Error(payload?.message || `Failed to update contest. Status: ${res.status}`)
  }
  
  return res.json()
}

export async function deleteContest(contestId: string): Promise<void> {
  const res = await fetchWithSession(`/contests/admin/${contestId}`, {
    method: 'DELETE'
  })
  
  if (!res.ok) {
    throw new Error('Failed to delete contest.')
  }
}

export async function updateContestStatuses(): Promise<any> {
  const res = await fetchWithSession('/contests/admin/update-statuses', {
    method: 'POST'
  })
  
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to update contest statuses.')
  }
  
  return res.json()
}
