'use client'

import type { FormEvent } from 'react'

interface UsernameSetupCardProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  loading: boolean
  error: string | null
}

export function UsernameSetupCard({ value, onChange, onSubmit, loading, error }: UsernameSetupCardProps) {
  return (
    <div className="mb-8 p-6 rounded-xl border-2 border-amber-500/50 bg-amber-900/20">
      <h2 className="text-lg font-bold text-amber-300 font-mono mb-2">Choose your username</h2>
      <p className="text-amber-200/90 text-sm font-mono mb-4">
        Required to save runs and enter contests. This name will appear on the leaderboard.
      </p>
      <form onSubmit={onSubmit} className="space-y-3 max-w-sm">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-black/40 border border-cyan-600/40 rounded-md px-3 py-2 text-cyan-100 text-sm font-mono"
          placeholder="3–16 letters, numbers, underscores"
          minLength={3}
          maxLength={16}
          required
        />
        {error && <p className="text-red-300 text-xs font-mono">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-black font-black py-2 rounded-full text-xs font-mono tracking-widest disabled:opacity-60"
        >
          {loading ? 'SAVING...' : 'SET USERNAME'}
        </button>
      </form>
    </div>
  )
}
