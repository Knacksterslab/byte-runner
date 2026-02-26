const RAW_API_DOMAIN = process.env.NEXT_PUBLIC_API_DOMAIN || 'http://localhost:4000'
export const API_DOMAIN =
  RAW_API_DOMAIN.startsWith('http://') || RAW_API_DOMAIN.startsWith('https://')
    ? RAW_API_DOMAIN.replace(/\/+$/, '')
    : `https://${RAW_API_DOMAIN.replace(/\/+$/, '')}`

const ANTI_CSRF_KEY = 'byte-runner-anti-csrf'
export const FDI_VERSION = '1.18'

let cachedAntiCsrf: string | null = null

export function getAntiCsrf(): string | null {
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

export function clearAntiCsrf(): void {
  cachedAntiCsrf = null
  if (typeof window !== 'undefined') window.localStorage.removeItem(ANTI_CSRF_KEY)
}

function extractAntiCsrfFromFrontToken(frontToken: string | null): string | null {
  if (!frontToken) return null
  try {
    const parts = frontToken.split('.')
    let payload: any
    if (parts.length === 3) {
      payload = JSON.parse(atob(parts[1]))
    } else if (parts.length === 1) {
      payload = JSON.parse(atob(parts[0]))
    } else {
      return null
    }
    return payload?.up?.antiCsrfToken || payload?.antiCsrfToken || payload?.anti_csrf || null
  } catch {
    return null
  }
}

export function extractAndStoreAntiCsrf(res: Response, bodyJson?: any): void {
  const antiCsrf =
    bodyJson?.antiCsrfToken ||
    res.headers.get('anti-csrf') ||
    extractAntiCsrfFromFrontToken(res.headers.get('front-token'))
  if (antiCsrf) setAntiCsrf(antiCsrf)
}

export async function refreshSession(): Promise<boolean> {
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
  extractAndStoreAntiCsrf(res)
  return res.ok
}

export async function fetchWithSession(
  input: string,
  init: RequestInit = {},
  allowRetry = true,
): Promise<Response> {
  const headers = new Headers(init.headers || {})
  headers.set('content-type', 'application/json')
  const antiCsrf = getAntiCsrf()
  if (antiCsrf) headers.set('anti-csrf', antiCsrf)

  const res = await fetch(`${API_DOMAIN}${input}`, { ...init, headers, credentials: 'include' })
  extractAndStoreAntiCsrf(res)

  if (res.status === 401 && allowRetry && !input.startsWith('/auth/session/refresh')) {
    try {
      const refreshed = await refreshSession()
      if (refreshed) return fetchWithSession(input, init, false)
    } catch {
      // Fall through and return original 401 response
    }
  }
  return res
}
