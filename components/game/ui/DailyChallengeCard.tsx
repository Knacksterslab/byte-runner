'use client'

import { useEffect, useState } from 'react'
import type { DailyChallenge } from '@/lib/api/daily'

function useCountdown(endsAt: string): string {
  const [label, setLabel] = useState('--:--:--')
  useEffect(() => {
    const tick = () => {
      const ms = new Date(endsAt).getTime() - Date.now()
      if (ms <= 0) { setLabel('00:00:00'); return }
      const h = Math.floor(ms / 3_600_000)
      const m = Math.floor((ms % 3_600_000) / 60_000)
      const s = Math.floor((ms % 60_000) / 1000)
      setLabel(`${h}h ${m}m ${s}s`)
    }
    tick()
    const tid = setInterval(tick, 1000)
    return () => clearInterval(tid)
  }, [endsAt])
  return label
}

/** Start-screen card for today's seeded Incident challenge. */
export function DailyChallengeCard({ challenge }: { challenge: DailyChallenge }) {
  const countdown = useCountdown(challenge.endsAt)
  return (
    <div className="w-full max-w-2xl mb-4 rounded-xl border border-amber-400/50 bg-gradient-to-br from-[#1a1205]/90 to-[#0a0e1a]/95 px-4 py-3 shadow-[0_0_18px_rgba(251,191,36,0.25)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[11px] tracking-[0.22em] text-amber-300 uppercase">
          🚨 Daily Incident — {challenge.name}
        </p>
        <p className="font-mono text-[10px] text-amber-200/70">resets in {countdown}</p>
      </div>
      <p className="mt-1 text-xs text-slate-300">{challenge.description}</p>

      <p className="mt-1.5 font-mono text-[10px] text-amber-200/80">
        🏆 100 pts · 🥈 50 · 🥉 25 — winner crowned at reset · cash out at 500 pts
      </p>
      {challenge.stages && (
        <div className="mt-2 rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-2.5 py-2">
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="text-cyan-200">
              📚 Today&apos;s path — reach level {challenge.stages.targetLevel}
            </span>
            {challenge.myCurriculum && (
              <span className={challenge.myCurriculum.complete ? 'text-emerald-300' : 'text-slate-400'}>
                {challenge.myCurriculum.complete
                  ? challenge.myCurriculum.rewardCredited
                    ? '✓ complete · +20 pts earned'
                    : '✓ complete'
                  : `you're at ${challenge.myCurriculum.levelToday}`}
              </span>
            )}
          </div>
          {challenge.myCurriculum && !challenge.myCurriculum.complete && (
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                style={{
                  width: `${Math.min(100, Math.round((challenge.myCurriculum.levelToday / challenge.myCurriculum.targetLevel) * 100))}%`,
                }}
              />
            </div>
          )}
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-1.5">
        {challenge.modifiers.boostedThreats.slice(0, 3).map((t) => (
          <span key={t} className="rounded-full border border-rose-400/40 bg-rose-500/10 px-2 py-0.5 font-mono text-[10px] text-rose-300">
            ▲ {t.replace(/-/g, ' ')}
          </span>
        ))}
        {challenge.modifiers.scarceKits.slice(0, 2).map((k) => (
          <span key={k} className="rounded-full border border-sky-400/40 bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] text-sky-300">
            ▼ {k.replace(/-/g, ' ')}
          </span>
        ))}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-amber-400/20 pt-2">
        <div className="flex items-center gap-3">
          {challenge.leaderboard.slice(0, 3).map((e, i) => (
            <span key={i} className="font-mono text-[10px] text-slate-400">
              <span className="text-amber-300">{i + 1}.</span> {e.username}{' '}
              <span className="text-slate-500">{e.score}</span>
            </span>
          ))}
          {challenge.leaderboard.length === 0 && (
            <span className="font-mono text-[10px] text-slate-500">No entries yet — be first</span>
          )}
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px]">
          {challenge.myBest !== null && (
            <span className="text-slate-400">best <span className="text-cyan-300">{challenge.myBest}</span></span>
          )}
          {challenge.myStreak > 0 && (
            <span className="text-amber-300">🔥 {challenge.myStreak}d streak</span>
          )}
        </div>
      </div>
    </div>
  )
}
