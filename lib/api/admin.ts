// Admin API functions
const RAW_API_DOMAIN = process.env.NEXT_PUBLIC_API_DOMAIN || 'http://localhost:4000'
const API_DOMAIN = RAW_API_DOMAIN.startsWith('http://') || RAW_API_DOMAIN.startsWith('https://')
  ? RAW_API_DOMAIN.replace(/\/+$/, '')
  : `https://${RAW_API_DOMAIN.replace(/\/+$/, '')}`
const ANTI_CSRF_KEY = 'byte-runner-anti-csrf'
const FDI_VERSION = '1.18'
const DEBUG_ENDPOINT = 'http://127.0.0.1:7244/ingest/8044fb5f-bff6-484b-95e6-3e4a2d42e250'

function debugLog(hypothesisId: string, location: string, message: string, data: Record<string, unknown>) {
  // #region agent log
  fetch(DEBUG_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      runId: 'contest-submit-debug',
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {})
  // #endregion
}

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

  // #region agent log
  debugLog('H1', 'admin.ts:refreshSession:before', 'Attempting session refresh', {
    hasAntiCsrf: Boolean(antiCsrf),
    apiDomain: API_DOMAIN,
  })
  // #endregion

  const res = await fetch(`${API_DOMAIN}/auth/session/refresh`, {
    method: 'POST',
    headers,
    credentials: 'include',
  })
  let responsePreview = ''
  try {
    responsePreview = await res.clone().text()
  } catch {
    responsePreview = ''
  }

  const nextAntiCsrf = res.headers.get('anti-csrf')
  if (nextAntiCsrf) setAntiCsrf(nextAntiCsrf)

  // #region agent log
  debugLog('H1', 'admin.ts:refreshSession:after', 'Session refresh response', {
    status: res.status,
    ok: res.ok,
    hasNextAntiCsrf: Boolean(nextAntiCsrf),
    acao: res.headers.get('access-control-allow-origin'),
    responsePreview: responsePreview.slice(0, 180),
  })
  // #endregion
  console.log('[contest-submit-debug][H1] refresh response', {
    status: res.status,
    ok: res.ok,
    hasNextAntiCsrf: Boolean(nextAntiCsrf),
    responsePreview: responsePreview.slice(0, 180),
  })

  return res.ok
}

async function fetchWithSession(input: string, init: RequestInit = {}, allowRetry = true): Promise<Response> {
  const headers = new Headers(init.headers || {})
  headers.set('content-type', 'application/json')
  
  const antiCsrf = getAntiCsrf()
    
  if (antiCsrf) headers.set('anti-csrf', antiCsrf)

  // #region agent log
  debugLog('H2', 'admin.ts:fetchWithSession:before', 'Sending session fetch', {
    input,
    method: init.method || 'GET',
    allowRetry,
    hasAntiCsrf: Boolean(antiCsrf),
  })
  // #endregion

  let res: Response
  try {
    res = await fetch(`${API_DOMAIN}${input}`, {
      ...init,
      headers,
      credentials: 'include'
    })
  } catch (error: any) {
    // #region agent log
    debugLog('H2', 'admin.ts:fetchWithSession:error', 'Session fetch threw network error', {
      input,
      method: init.method || 'GET',
      errorName: error?.name || 'unknown',
      errorMessage: error?.message || String(error),
    })
    // #endregion
    throw error
  }

  const nextAntiCsrf = res.headers.get('anti-csrf')
  if (nextAntiCsrf) setAntiCsrf(nextAntiCsrf)

  // #region agent log
  debugLog('H2', 'admin.ts:fetchWithSession:after', 'Session fetch response', {
    input,
    method: init.method || 'GET',
    status: res.status,
    ok: res.ok,
    hasNextAntiCsrf: Boolean(nextAntiCsrf),
    acao: res.headers.get('access-control-allow-origin'),
  })
  // #endregion
  console.log('[contest-submit-debug][H2] fetch response', {
    input,
    method: init.method || 'GET',
    status: res.status,
    ok: res.ok,
  })

  if (res.status === 401 && allowRetry && !input.startsWith('/auth/session/refresh')) {
    try {
      // #region agent log
      debugLog('H3', 'admin.ts:fetchWithSession:401', '401 received, trying refresh', {
        input,
        method: init.method || 'GET',
      })
      // #endregion
      const refreshed = await refreshSession()
      if (refreshed) {
        // #region agent log
        debugLog('H3', 'admin.ts:fetchWithSession:retry', 'Refresh succeeded, retrying request', {
          input,
          method: init.method || 'GET',
        })
        // #endregion
        return fetchWithSession(input, init, false)
      }
      console.warn('[contest-submit-debug][H3] refresh returned false', {
        input,
        method: init.method || 'GET',
      })
    } catch {
      // #region agent log
      debugLog('H3', 'admin.ts:fetchWithSession:refresh-failed', 'Refresh path threw error', {
        input,
        method: init.method || 'GET',
      })
      // #endregion
      console.error('[contest-submit-debug][H3] refresh path threw error', {
        input,
        method: init.method || 'GET',
      })
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
