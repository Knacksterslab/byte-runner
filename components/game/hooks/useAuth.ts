import { useState, useEffect, useRef, type FormEvent } from 'react'
import {
  getCurrentUser,
  signIn,
  signUp,
  signOut,
  sendPasswordResetEmail,
  setUsername as apiSetUsername,
  type BackendUser,
} from '@/lib/api/backend'
import { trackSignIn, trackSignUp, trackUsernameSet } from '@/lib/analytics'

export type AuthStatus = 'checking' | 'guest' | 'authed'

export interface AuthState {
  authStatus: AuthStatus
  currentUser: BackendUser | null
  showAuthModal: boolean
  authMode: 'signin' | 'signup' | 'forgot'
  authEmail: string
  authPassword: string
  authError: string | null
  authInfo: string | null
  authLoading: boolean
  showUsernameModal: boolean
  usernameInput: string
  usernameError: string | null
  usernameLoading: boolean
  setShowAuthModal: (show: boolean) => void
  setShowUsernameModal: (show: boolean) => void
  setAuthMode: (mode: 'signin' | 'signup' | 'forgot') => void
  setAuthEmail: (email: string) => void
  setAuthPassword: (password: string) => void
  setUsernameInput: (input: string) => void
  handleAuthSubmit: (event: FormEvent<HTMLFormElement>) => void
  handleUsernameSubmit: (event: FormEvent<HTMLFormElement>) => void
  handleSignOut: () => Promise<void>
}

export interface UseAuthCallbacks {
  /** Called after sign-in/sign-up succeeds; use to trigger a pending save. */
  onSignedIn: (user: BackendUser) => Promise<void>
  /** Called after username is set; clears save message and pending-save flag. */
  onUsernameSet: () => void
  /** Called after sign-out; resets all save state. */
  onSignOut: () => void
}

export function useAuth(callbacks: UseAuthCallbacks): AuthState {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking')
  const [currentUser, setCurrentUser] = useState<BackendUser | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signup')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authInfo, setAuthInfo] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [showUsernameModal, setShowUsernameModal] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [usernameLoading, setUsernameLoading] = useState(false)

  // Keep callbacks in a ref so handlers always call the latest version.
  const callbacksRef = useRef(callbacks)
  callbacksRef.current = callbacks

  useEffect(() => {
    let isActive = true

    const loadUser = async () => {
      try {
        const user = await getCurrentUser()
        if (!isActive) return
        if (user) {
          setCurrentUser(user)
          setAuthStatus('authed')
          // No username yet? The amber chip nudges passively; the modal only
          // asks when a run is submitted and a name actually matters.
        } else {
          setCurrentUser(null)
          setAuthStatus('guest')
        }
      } catch {
        if (!isActive) return
        setCurrentUser(null)
        setAuthStatus('guest')
      }
    }

    loadUser()
    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    setAuthError(null)
    setAuthInfo(null)
  }, [authMode])

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthLoading(true)
    setAuthError(null)
    setAuthInfo(null)
    try {
      if (authMode === 'forgot') {
        const result = await sendPasswordResetEmail(authEmail.trim())
        if (result.status !== 'OK') {
          const fieldError = result.formFields?.find(f => f.error)?.error
          setAuthError(result.message || fieldError || 'Could not send reset link.')
          setAuthLoading(false)
          return
        }
        setAuthInfo('If an account exists for this email, a reset link has been sent.')
        setAuthMode('signin')
        setAuthPassword('')
        setAuthLoading(false)
        return
      }

      const result = authMode === 'signup'
        ? await signUp(authEmail.trim(), authPassword)
        : await signIn(authEmail.trim(), authPassword)

      if (result.status !== 'OK') {
        const fieldError = result.formFields?.find(f => f.error)?.error
        setAuthError(result.message || fieldError || 'Authentication failed.')
        setAuthLoading(false)
        return
      }

      const user = await getCurrentUser()
      setCurrentUser(user)
      setAuthStatus(user ? 'authed' : 'guest')
      setShowAuthModal(false)

      if (authMode === 'signup') trackSignUp()
      else trackSignIn()

      if (user) {
        // Username (if missing) is requested at first leaderboard save,
        // not as an interruption right after auth.
        await callbacksRef.current.onSignedIn(user)
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleUsernameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setUsernameLoading(true)
    setUsernameError(null)
    try {
      const updated = await apiSetUsername(usernameInput.trim())
      setCurrentUser(updated)
      setShowUsernameModal(false)
      trackUsernameSet()
      callbacksRef.current.onUsernameSet()
    } catch (error) {
      setUsernameError(error instanceof Error ? error.message : 'Failed to set username.')
    } finally {
      setUsernameLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch {
      // Ignore sign-out errors to avoid blocking UI reset
    } finally {
      setCurrentUser(null)
      setAuthStatus('guest')
      callbacksRef.current.onSignOut()
    }
  }

  return {
    authStatus,
    currentUser,
    showAuthModal,
    authMode,
    authEmail,
    authPassword,
    authError,
    authInfo,
    authLoading,
    showUsernameModal,
    usernameInput,
    usernameError,
    usernameLoading,
    setShowAuthModal,
    setShowUsernameModal,
    setAuthMode,
    setAuthEmail,
    setAuthPassword,
    setUsernameInput,
    handleAuthSubmit,
    handleUsernameSubmit,
    handleSignOut,
  }
}
