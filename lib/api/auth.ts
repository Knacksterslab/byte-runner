import { API_DOMAIN, FDI_VERSION, clearAntiCsrf, extractAndStoreAntiCsrf, fetchWithSession } from './client'
import type { AuthResult, BackendUser } from './types'

export async function getCurrentUser(): Promise<BackendUser | null> {
  const res = await fetchWithSession('/users/me', { method: 'GET' })
  if (res.status === 401) return null
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to fetch user.')
  }
  return res.json()
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  try {
    await fetch(`${API_DOMAIN}/users/clear-session`, { method: 'POST', credentials: 'include' })
  } catch {
    // Ignore errors
  }
  clearAntiCsrf()

  const res = await fetch(`${API_DOMAIN}/auth/signup`, {
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
        { id: 'password', value: password },
      ],
    }),
  })

  const jsonResponse = await res.json()
  extractAndStoreAntiCsrf(res, jsonResponse)
  return jsonResponse
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    await fetch(`${API_DOMAIN}/users/clear-session`, { method: 'POST', credentials: 'include' })
  } catch {
    // Ignore errors
  }
  clearAntiCsrf()

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
        { id: 'password', value: password },
      ],
    }),
  })

  const jsonResponse = await res.json()
  extractAndStoreAntiCsrf(res, jsonResponse)
  return jsonResponse
}

export interface PasswordResetEmailResult {
  status: 'OK' | 'FIELD_ERROR' | 'RESET_PASSWORD_INVALID_TOKEN_ERROR' | string
  message?: string
  formFields?: Array<{ id: string; error?: string }>
}

export async function sendPasswordResetEmail(email: string): Promise<PasswordResetEmailResult> {
  const res = await fetch(`${API_DOMAIN}/auth/user/password/reset/token`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      rid: 'emailpassword',
      'fdi-version': FDI_VERSION,
      'st-auth-mode': 'cookie',
    },
    credentials: 'include',
    body: JSON.stringify({
      formFields: [{ id: 'email', value: email }],
    }),
  })

  const jsonResponse = await res.json().catch(() => ({ status: 'UNKNOWN_ERROR', message: 'Unexpected response' }))
  extractAndStoreAntiCsrf(res, jsonResponse)
  return jsonResponse
}

export interface PasswordResetResult {
  status: 'OK' | 'RESET_PASSWORD_INVALID_TOKEN_ERROR' | 'FIELD_ERROR' | string
  message?: string
  formFields?: Array<{ id: string; error?: string }>
}

export async function submitPasswordReset(token: string, password: string): Promise<PasswordResetResult> {
  const res = await fetch(`${API_DOMAIN}/auth/user/password/reset`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      rid: 'emailpassword',
      'fdi-version': FDI_VERSION,
      'st-auth-mode': 'cookie',
    },
    credentials: 'include',
    body: JSON.stringify({
      method: 'token',
      token,
      formFields: [{ id: 'password', value: password }],
    }),
  })

  const jsonResponse = await res.json().catch(() => ({ status: 'UNKNOWN_ERROR', message: 'Unexpected response' }))
  extractAndStoreAntiCsrf(res, jsonResponse)
  return jsonResponse
}

export async function signOut() {
  const res = await fetchWithSession('/auth/signout', {
    method: 'POST',
    headers: { rid: 'session', 'fdi-version': FDI_VERSION, 'st-auth-mode': 'cookie' },
  })
  if (!res.ok) throw new Error('Failed to sign out.')
  return res.json()
}

export async function setUsername(username: string): Promise<BackendUser> {
  const res = await fetchWithSession('/users/username', {
    method: 'POST',
    body: JSON.stringify({ username }),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to set username.')
  }
  return res.json()
}
