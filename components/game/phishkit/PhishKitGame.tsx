'use client'

import { useEffect, useMemo, useState } from 'react'
import { poolForDate, resolveLure, type PersonaOutcome, type Resolution } from '@/lib/game/phishKit/resolver'
import type { LurePart, LureSlot } from '@/lib/game/phishKit/catalog'
import { recordQuizMiss } from '@/lib/game/weaknessProfile'
import { submitRun } from '@/lib/api/runs'

type Phase = 'brief' | 'step' | 'preview' | 'office' | 'aftermath' | 'reveal' | 'selftest' | 'results'

const SLOTS: { slot: LureSlot; title: string }[] = [
  { slot: 'sender', title: 'WHO is it from?' },
  { slot: 'pretext', title: 'WHAT is the story?' },
  { slot: 'pressure', title: 'WHY act now?' },
  { slot: 'payload', title: 'WHAT do they do?' },
]

interface PhishKitGameProps {
  dateKey: string
  incidentName: string
  incidentDescription: string
  onExit: () => void
  onSubmitted?: (score: number) => void
}

/**
 * Phish Kit — the attacker's daily. Parts-only lure construction against a
 * deterministic simulated office. See SPEC-PHISH-KIT.md.
 */
export function PhishKitGame({ dateKey, incidentName, incidentDescription, onExit, onSubmitted }: PhishKitGameProps) {
  const pool = useMemo(() => poolForDate(dateKey), [dateKey])
  const [phase, setPhase] = useState<Phase>('brief')
  const [stepIdx, setStepIdx] = useState(0)
  const [selected, setSelected] = useState<Partial<Record<LureSlot, LurePart>>>({})
  const [resolution, setResolution] = useState<Resolution | null>(null)
  const [personaIdx, setPersonaIdx] = useState(0)
  const [selfTestAnswer, setSelfTestAnswer] = useState<'phish' | 'legit' | null>(null)
  const [decoyLine, setDecoyLine] = useState('')
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'done' | 'skipped'>('idle')
  const [finalScore, setFinalScore] = useState<number | null>(null)

  const complete = SLOTS.every(({ slot }) => selected[slot])
  const parts = SLOTS.map(({ slot }) => selected[slot]!).filter(Boolean)

  // ── Office scene: personas resolve one by one ──
  useEffect(() => {
    if (phase !== 'office' || !resolution) return
    if (personaIdx >= resolution.outcomes.length) {
      setPhase('aftermath')
      return
    }
    const tid = setTimeout(() => setPersonaIdx((i) => i + 1), 700)
    return () => clearTimeout(tid)
  }, [phase, personaIdx, resolution])

  const release = () => {
    const ids = SLOTS.map(({ slot }) => selected[slot]!.id)
    setResolution(resolveLure(dateKey, ids))
    setPersonaIdx(0)
    setPhase('office')
  }

  // ── Self-test: the player's own lure + one legit decoy ──
  const startSelfTest = () => {
    const legitLines = [
      'IT Helpdesk <helpdesk@byterunner.co> — “Scheduled maintenance Sunday 02:00–04:00. No action needed.”',
      'Payroll <payroll@byterunner.co> — “Payslips are now available in the HR portal as usual.”',
      'HR <hr@byterunner.co> — “Reminder: quarterly policy acknowledgment opens Monday.”',
    ]
    setDecoyLine(legitLines[Math.floor(Math.random() * legitLines.length)]!)
    setSelfTestAnswer(null)
    setPhase('selftest')
  }

  const answerSelfTest = (says: 'phish' | 'legit') => {
    setSelfTestAnswer(says)
    // The shown item IS the player's own phish — saying "phish" is correct.
    if (says !== 'phish') {
      recordQuizMiss('phishing') // fooled by your own weapon
    }
  }

  const submit = async () => {
    setSubmitState('sending')
    try {
      const res = await submitRun({
        score: resolution?.score ?? 0,
        distance: 0,
        durationMs: 90_000,
        mechanic: 'phishkit',
        parts: SLOTS.map(({ slot }) => selected[slot]!.id),
      })
      setFinalScore(typeof res.score === 'number' ? res.score : (resolution?.score ?? 0))
      setSubmitState('done')
      onSubmitted?.(typeof res.score === 'number' ? res.score : (resolution?.score ?? 0))
    } catch {
      setSubmitState('skipped') // not signed in / no username — run stays local
    }
  }

  const hookedLever = (o: PersonaOutcome): string => {
    const part = parts.find((p) => p.id === o.hookedByPartId)
    return part ? part.levers[0] : '—'
  }

  // ─────────────────────────────── render ───────────────────────────────
  return (
    <div className="absolute inset-0 z-[60] overflow-y-auto bg-[#05070d] px-4 py-6">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-mono text-[10px] tracking-[0.3em] text-rose-400 uppercase">
            🎣 Phish Kit — {incidentName}
          </p>
          <button onClick={onExit} className="font-mono text-[10px] text-slate-500 hover:text-slate-300">
            exit ✕
          </button>
        </div>

        {phase === 'brief' && (
          <div className="mt-16 rounded-2xl border border-rose-400/40 bg-[#160a0e] p-6 text-center">
            <p className="text-4xl">🎣</p>
            <h2 className="mt-3 font-mono text-xl font-black tracking-wide text-rose-200">
              Build the lure. Fool the office.
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Four choices. One phish. Who falls is up to you.
            </p>
            <button
              onClick={() => { setStepIdx(0); setPhase('step') }}
              className="mt-5 w-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-3 font-mono text-sm font-black tracking-widest text-white shadow-[0_0_24px_rgba(244,63,94,0.4)] transition hover:scale-[1.01]"
            >
              START BUILDING →
            </button>
          </div>
        )}

        {phase === 'step' && (() => {
          const { slot, title } = SLOTS[stepIdx]!
          return (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="font-mono text-[10px] tracking-[0.3em] text-slate-500 uppercase">
                  {stepIdx + 1} of 4 · {title}
                </p>
                <div className="flex gap-1.5">
                  {SLOTS.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-5 rounded-full ${i < stepIdx ? 'bg-rose-400' : i === stepIdx ? 'bg-rose-400/60' : 'bg-white/10'}`}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {pool[slot].map((part) => (
                  <button
                    key={part.id}
                    onClick={() => {
                      setSelected((sel) => ({ ...sel, [slot]: part }))
                      if (stepIdx < 3) {
                        setStepIdx(stepIdx + 1)
                      } else {
                        setPhase('preview')
                      }
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-left transition hover:border-rose-400/60 hover:bg-rose-500/5"
                  >
                    <span className="block font-mono text-sm leading-snug text-slate-200">
                      {part.rendered}
                    </span>
                    <span className="mt-1.5 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">{part.label}</span>
                      <span className="text-[10px] text-amber-300/70">{'★'.repeat(part.subtlety)}</span>
                    </span>
                  </button>
                ))}
              </div>
              {stepIdx > 0 && (
                <button
                  onClick={() => setStepIdx(stepIdx - 1)}
                  className="mt-4 w-full rounded-full border border-white/10 px-4 py-2 font-mono text-[11px] text-slate-500 hover:text-slate-300"
                >
                  ← back
                </button>
              )}
            </div>
          )
        })()}

        {phase === 'preview' && (
          <div>
            <p className="mb-3 font-mono text-[10px] tracking-[0.3em] text-slate-500 uppercase">
              Your finished lure
            </p>
            <div className="rounded-2xl border border-white/15 bg-[#0b0f18] p-4">
              <p className="border-b border-white/10 pb-2 font-mono text-xs text-slate-400">
                <span className="text-slate-500">From:</span> {selected.sender?.rendered}
              </p>
              <p className="border-b border-white/10 py-2 font-mono text-xs text-slate-300">
                {selected.pretext?.rendered} {selected.pressure?.rendered}
              </p>
              <p className="pt-2 font-mono text-xs text-amber-200/80">{selected.payload?.rendered}</p>
            </div>
            <button
              onClick={release}
              className="mt-5 w-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-3 font-mono text-sm font-black tracking-widest text-white shadow-[0_0_24px_rgba(244,63,94,0.4)] transition hover:scale-[1.01]"
            >
              🎣 RELEASE THE LURE
            </button>
            <button
              onClick={() => { setStepIdx(3); setPhase('step') }}
              className="mt-2 w-full rounded-full border border-white/10 px-4 py-2 font-mono text-[11px] text-slate-500 hover:text-slate-300"
            >
              ← change parts
            </button>
          </div>
        )}

        {phase === 'office' && resolution && (
          <div className="rounded-xl border border-white/10 bg-black/40 p-5">
            <p className="mb-4 font-mono text-[10px] tracking-[0.25em] text-slate-500 uppercase">
              The office reads your mail…
            </p>
            <div className="space-y-2">
              {resolution.outcomes.slice(0, personaIdx).map((o) => (
                <div key={o.persona.id} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
                  <span className="font-mono text-xs text-slate-300">
                    {o.persona.name} <span className="text-slate-600">· {o.persona.role}</span>
                  </span>
                  <span className="font-mono text-xs">
                    {o.fell ? (
                      <span className="text-rose-400">BIT — hooked by {hookedLever(o)}</span>
                    ) : o.reported ? (
                      <span className="text-amber-400">REPORTED IT</span>
                    ) : (
                      <span className="text-emerald-400">ignored</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === 'aftermath' && resolution && (
          <div className="rounded-xl border border-rose-400/40 bg-[#160a0e]/80 p-5 text-center">
            <p className="font-mono text-3xl font-black text-rose-300">{resolution.falls} fell</p>
            <p className="font-mono text-sm text-slate-400">
              {resolution.reports} reported · cunning score {resolution.score}
            </p>
            <div className="mt-4 space-y-1.5 text-left">
              {resolution.outcomes
                .filter((o) => o.fell)
                .map((o) => (
                  <div key={o.persona.id} className="rounded-lg bg-rose-500/10 px-3 py-2 font-mono text-[11px] text-slate-300">
                    <span className="text-rose-300">{o.persona.name}</span> fell for{' '}
                    <span className="text-amber-300 uppercase">{hookedLever(o)}</span> —{' '}
                    {hookedLever(o) === 'authority'
                      ? 'did anything about this email feel *authorized*?'
                      : hookedLever(o) === 'urgency'
                        ? 'the deadline did the thinking, not her.'
                        : hookedLever(o) === 'greed'
                          ? 'the prize was louder than the sender.'
                          : 'the story was juicier than the source.'}
                  </div>
                ))}
            </div>
            <button
              onClick={() => setPhase('reveal')}
              className="mt-4 w-full rounded-full border border-rose-300/50 bg-rose-500/10 px-4 py-2.5 font-mono text-xs font-bold tracking-widest text-rose-200"
            >
              HOW THEY&apos;D CATCH YOU →
            </button>
          </div>
        )}

        {phase === 'reveal' && (
          <div className="rounded-xl border border-cyan-400/40 bg-[#08131c]/80 p-5">
            <p className="font-mono text-[10px] tracking-[0.25em] text-cyan-300 uppercase">The tell</p>
            {parts.map((p) => (
              <div key={p.id} className="mt-2 rounded-lg bg-white/[0.03] px-3 py-2">
                <p className="font-mono text-[11px] text-slate-300">{p.rendered}</p>
                <p className="mt-0.5 font-mono text-[10px] text-cyan-300/80">
                  tell: {p.tell.replace(/-/g, ' ')} — this is what a defender scans first
                </p>
              </div>
            ))}
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              Every part you wield teaches its own defense. Defenders read senders before stories,
              trust deadlines less than processes, and treat requests for codes, wires, and
              attachments as the moment to slow down.
            </p>
            <button
              onClick={startSelfTest}
              className="mt-4 w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 font-mono text-xs font-bold tracking-widest text-white"
            >
              FINAL TEST: CATCH YOUR OWN PHISH →
            </button>
          </div>
        )}

        {phase === 'selftest' && (
          <div className="rounded-xl border border-cyan-400/40 bg-[#08131c]/80 p-5">
            <p className="mb-3 font-mono text-[10px] tracking-[0.25em] text-cyan-300 uppercase">
              Which of these is the phish?
            </p>
            <div className="space-y-2">
              <div className="rounded-lg bg-white/[0.04] px-3 py-2 font-mono text-[11px] text-slate-300">
                A. {selected.sender?.rendered} — “{selected.pretext?.rendered}” {selected.payload?.rendered}
              </div>
              <div className="rounded-lg bg-white/[0.04] px-3 py-2 font-mono text-[11px] text-slate-300">
                B. {decoyLine}
              </div>
            </div>
            {selfTestAnswer === null ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => answerSelfTest('phish')}
                  className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 font-mono text-xs font-bold tracking-widest text-white"
                >
                  A IS THE PHISH
                </button>
                <button
                  onClick={() => answerSelfTest('legit')}
                  className="rounded-full border border-white/20 bg-white/[0.04] px-4 py-2.5 font-mono text-xs font-bold tracking-widest text-slate-300"
                >
                  B IS THE PHISH
                </button>
              </div>
            ) : (
              <div className="mt-4">
                <p className={`font-mono text-sm ${selfTestAnswer === 'phish' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selfTestAnswer === 'phish'
                    ? '✓ Correct — A was your own weapon. You know your tells.'
                    : '✗ Fooled by your own lure. The urgency you wield works on you too — that’s the lesson.'}
                </p>
                <button
                  onClick={() => setPhase('results')}
                  className="mt-3 w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 font-mono text-xs font-bold tracking-widest text-white"
                >
                  SEE RESULTS →
                </button>
              </div>
            )}
          </div>
        )}

        {phase === 'results' && resolution && (
          <div className="rounded-xl border border-amber-400/40 bg-[#1a1205]/80 p-5 text-center">
            <p className="font-mono text-[10px] tracking-[0.25em] text-amber-300 uppercase">Cunning score</p>
            <p className="font-mono text-4xl font-black text-amber-200">{finalScore ?? resolution.score}</p>
            <p className="mt-1 font-mono text-xs text-slate-400">
              {resolution.falls} falls · {resolution.reports} reports
              {resolution.dominantLever ? ` · ${resolution.dominantLever} combo` : ''}
            </p>
            {submitState === 'sending' && <p className="mt-3 font-mono text-xs text-slate-500">submitting…</p>}
            {submitState === 'done' && (
              <p className="mt-3 font-mono text-xs text-emerald-400">
                ✓ Ranked on today&apos;s incident leaderboard
              </p>
            )}
            {submitState === 'skipped' && (
              <p className="mt-3 font-mono text-xs text-slate-500">
                Not submitted — sign in and set a username to rank on the daily ladder.
              </p>
            )}
            {submitState === 'idle' && (
              <button
                onClick={submit}
                className="mt-4 w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 font-mono text-xs font-bold tracking-widest text-black"
              >
                SUBMIT TO TODAY&apos;S LADDER
              </button>
            )}
            <button
              onClick={onExit}
              className="mt-3 w-full rounded-full border border-white/15 px-4 py-2 font-mono text-[11px] text-slate-400 hover:text-slate-200"
            >
              back to base
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
