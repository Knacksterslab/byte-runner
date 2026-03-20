'use client'

import { FormEvent, Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { sendPasswordResetEmail, submitPasswordReset } from '@/lib/api/backend'
import { PageWrapper } from '@/components/PageWrapper'

function ResetPasswordPageContent() {
  const searchParams = useSearchParams()
  const token = useMemo(() => searchParams.get('token') || '', [searchParams])
  const hasToken = Boolean(token)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const handleSendResetEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)
    try {
      const result = await sendPasswordResetEmail(email.trim())
      if (result.status !== 'OK') {
        const fieldError = result.formFields?.find((field) => field.error)?.error
        setError(result.message || fieldError || 'Could not send reset link.')
        setLoading(false)
        return
      }
      setInfo('If an account exists for this email, a reset link has been sent.')
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Could not send reset link.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }
    try {
      const result = await submitPasswordReset(token, password)
      if (result.status !== 'OK') {
        const fieldError = result.formFields?.find((field) => field.error)?.error
        setError(result.message || fieldError || 'Reset link is invalid or expired.')
        setLoading(false)
        return
      }
      setInfo('Password updated. You can now sign in with your new password.')
      setPassword('')
      setConfirmPassword('')
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0b1020]/90 border border-cyan-500/40 rounded-2xl p-5 shadow-[0_0_26px_rgba(0,200,255,0.2)]">
        <h1 className="text-cyan-200 font-mono text-lg font-bold tracking-wide mb-2">
          {hasToken ? 'Set New Password' : 'Reset Password'}
        </h1>
        <p className="text-gray-300 text-sm mb-4">
          {hasToken
            ? 'Enter and confirm your new password below.'
            : 'Enter your email to receive a reset password link.'}
        </p>

        {!hasToken ? (
          <form onSubmit={handleSendResetEmail} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-cyan-600/40 rounded-md px-3 py-2 text-cyan-100 text-base font-mono"
              placeholder="email@example.com"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-black py-2 rounded-full text-xs font-mono tracking-widest shadow-[0_0_20px_rgba(80,200,255,0.5)] disabled:opacity-60"
            >
              {loading ? 'WORKING...' : 'SEND RESET LINK'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-cyan-600/40 rounded-md px-3 py-2 text-cyan-100 text-base font-mono"
              placeholder="new password"
              minLength={8}
              required
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-black/40 border border-cyan-600/40 rounded-md px-3 py-2 text-cyan-100 text-base font-mono"
              placeholder="confirm new password"
              minLength={8}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-black py-2 rounded-full text-xs font-mono tracking-widest shadow-[0_0_20px_rgba(80,200,255,0.5)] disabled:opacity-60"
            >
              {loading ? 'WORKING...' : 'RESET PASSWORD'}
            </button>
          </form>
        )}

        {error && <p className="text-red-300 text-xs font-mono mt-3">{error}</p>}
        {info && <p className="text-cyan-200 text-xs font-mono mt-3">{info}</p>}

        <div className="mt-4 text-[11px] font-mono">
          <Link href="/" className="text-cyan-300 hover:text-cyan-200 transition-colors">
            Back to home
          </Link>
        </div>
      </div>
    </PageWrapper>
  )
}

function ResetPasswordFallback() {
  return (
    <PageWrapper className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0b1020]/90 border border-cyan-500/40 rounded-2xl p-5 shadow-[0_0_26px_rgba(0,200,255,0.2)]">
        <p className="text-cyan-200 text-sm font-mono">Loading reset form...</p>
      </div>
    </PageWrapper>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordPageContent />
    </Suspense>
  )
}
