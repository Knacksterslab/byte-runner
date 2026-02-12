// Admin API functions
const RAW_API_DOMAIN = process.env.NEXT_PUBLIC_API_DOMAIN || 'http://localhost:4000'
const API_DOMAIN = RAW_API_DOMAIN.startsWith('http://') || RAW_API_DOMAIN.startsWith('https://')
  ? RAW_API_DOMAIN.replace(/\/+$/, '')
  : `https://${RAW_API_DOMAIN.replace(/\/+$/, '')}`

async function fetchWithSession(input: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {})
  headers.set('content-type', 'application/json')
  
  const antiCsrf = typeof window !== 'undefined' 
    ? window.localStorage.getItem('byte-runner-anti-csrf')
    : null
    
  if (antiCsrf) headers.set('anti-csrf', antiCsrf)

  const res = await fetch(`${API_DOMAIN}${input}`, {
    ...init,
    headers,
    credentials: 'include'
  })

  const nextAntiCsrf = res.headers.get('anti-csrf')
  if (nextAntiCsrf && typeof window !== 'undefined') {
    window.localStorage.setItem('byte-runner-anti-csrf', nextAntiCsrf)
  }

  return res
}

export interface CreateContestData {
  name: string
  description?: string
  startDate: string
  endDate: string
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
