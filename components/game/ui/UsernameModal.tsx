'use client'

import type { FormEvent } from 'react'

export interface UsernameModalProps {
  username: string
  error: string | null
  loading: boolean
  onUsernameChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClose: () => void
}

export function UsernameModal({
  username,
  error,
  loading,
  onUsernameChange,
  onSubmit,
  onClose,
}: UsernameModalProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm bg-[#0b1020]/90 border border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-[0_0_26px_rgba(0,200,255,0.2)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-cyan-200 font-mono text-sm sm:text-base font-bold tracking-wide">
            Choose a username
          </h3>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-cyan-400/40 text-cyan-200 hover:text-white hover:border-cyan-300 transition-colors"
            aria-label="Close username"
          >
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="text"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            className="w-full bg-black/40 border border-cyan-600/40 rounded-md px-3 py-2 text-cyan-100 text-base font-mono"
            placeholder="3-16 letters, numbers, underscores"
            minLength={3}
            maxLength={16}
            required
          />
          {error && <p className="text-red-300 text-xs font-mono">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-black font-black py-2 rounded-full text-xs font-mono tracking-widest shadow-[0_0_20px_rgba(80,255,160,0.45)] disabled:opacity-60"
          >
            {loading ? 'SAVING...' : 'SET USERNAME'}
          </button>
        </form>
        <p className="mt-2 text-[11px] text-gray-300 font-mono">
          This name will appear on the leaderboard.
        </p>
      </div>
    </div>
  )
}
