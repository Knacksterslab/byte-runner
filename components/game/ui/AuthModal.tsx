'use client'

import type { FormEvent } from 'react'

export interface AuthModalProps {
  mode: 'signin' | 'signup'
  email: string
  password: string
  error: string | null
  loading: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onToggleMode: () => void
  onClose: () => void
}

export function AuthModal({
  mode,
  email,
  password,
  error,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onToggleMode,
  onClose,
}: AuthModalProps) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm bg-[#0b1020]/90 border border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-[0_0_26px_rgba(0,200,255,0.2)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-cyan-200 font-mono text-sm sm:text-base font-bold tracking-wide">
            {mode === 'signup' ? 'Create account' : 'Sign in'}
          </h3>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-cyan-400/40 text-cyan-200 hover:text-white hover:border-cyan-300 transition-colors"
            aria-label="Close auth"
          >
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full bg-black/40 border border-cyan-600/40 rounded-md px-3 py-2 text-cyan-100 text-base font-mono"
            placeholder="email@example.com"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="w-full bg-black/40 border border-cyan-600/40 rounded-md px-3 py-2 text-cyan-100 text-base font-mono"
            placeholder="password"
            required
            minLength={8}
          />
          {error && <p className="text-red-300 text-xs font-mono">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-black py-2 rounded-full text-xs font-mono tracking-widest shadow-[0_0_20px_rgba(80,200,255,0.5)] disabled:opacity-60"
          >
            {loading ? 'WORKING...' : mode === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}
          </button>
        </form>
        <div className="flex items-center justify-between mt-3 text-[11px] font-mono">
          <button
            onClick={onToggleMode}
            className="text-cyan-300 hover:text-cyan-200 transition-colors"
          >
            {mode === 'signup' ? 'Have an account? Sign in' : 'New here? Create account'}
          </button>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Continue without saving
          </button>
        </div>
      </div>
    </div>
  )
}
