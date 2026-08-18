'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { WEAK_PASSWORDS } from '@/lib/game/data/weakPasswords'

/**
 * TYPING DRILL — remediation format for the password/authentication topics.
 * Weak passwords appear one at a time; the player types a strong replacement
 * before the crack bar fills. Framework: physics (typing), progression
 * (escalating rules + rounds), tactics (which rule to satisfy first),
 * economy (time is the resource).
 */

interface TypingDrillProps {
  topic: 'password' | 'authentication'
  onComplete: (passed: boolean, score: number) => void
}

const TOTAL_ROUNDS = 10
const PASS_FRACTION = 0.6

function rulesForRound(round: number): { id: string; label: string; test: (s: string, weak: string) => boolean }[] {
  const rules = [
    { id: 'len', label: '12+ characters', test: (s: string) => s.length >= 12 },
    { id: 'case', label: 'upper + lower case', test: (s: string) => /[a-z]/.test(s) && /[A-Z]/.test(s) },
    { id: 'digit', label: 'a number', test: (s: string) => /\d/.test(s) },
    { id: 'diff', label: `different from the weak one`, test: (s: string, weak: string) => !s.toLowerCase().includes(weak.toLowerCase()) },
  ]
  if (round >= 5) rules.push({ id: 'sym', label: 'a symbol (!@#$…)', test: (s: string) => /[^A-Za-z0-9]/.test(s) })
  if (round >= 9) rules.push({ id: 'len16', label: '16+ characters', test: (s: string) => s.length >= 16 })
  return rules
}

function crackSeconds(round: number): number {
  if (round <= 4) return 25
  if (round <= 8) return 20
  return 15
}

export function TypingDrill({ topic, onComplete }: TypingDrillProps) {
  const pool = useMemo(() => {
    const arr = [...WEAK_PASSWORDS]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
    }
    return arr.slice(0, TOTAL_ROUNDS)
  }, [])

  const [round, setRound] = useState(0)
  const [cleared, setCleared] = useState(0)
  const [input, setInput] = useState('')
  const [crackLeft, setCrackLeft] = useState(crackSeconds(1))
  const [flash, setFlash] = useState<'none' | 'good' | 'cracked'>('none')
  const [done, setDone] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const current = pool[round]!
  const rules = rulesForRound(round + 1)
  const allMet = rules.every((r) => r.test(input, current.value))

  useEffect(() => {
    inputRef.current?.focus()
  }, [round])

  // crack bar countdown
  useEffect(() => {
    if (done || flash !== 'none') return
    if (crackLeft <= 0) {
      setFlash('cracked')
      const t = setTimeout(() => advance(false), 1200)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setCrackLeft((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [crackLeft, done, flash])

  const advance = (success: boolean) => {
    if (success) setCleared((c) => c + 1)
    if (round + 1 >= TOTAL_ROUNDS) {
      setDone(true)
    } else {
      setRound((r) => r + 1)
      setCrackLeft(crackSeconds(round + 2))
      setInput('')
      setFlash('none')
    }
  }

  const submit = () => {
    if (allMet) {
      setFlash('good')
      setTimeout(() => advance(true), 800)
    }
    // incomplete rules: no submission — the checklist shows what's missing
  }

  const finalPass = cleared >= Math.ceil(TOTAL_ROUNDS * PASS_FRACTION)
  const score = Math.round((cleared / TOTAL_ROUNDS) * 100)

  if (done) {
    return (
      <div className="absolute inset-0 z-[60] flex items-center justify-center bg-[#05070d] px-4">
        <div className={`w-full max-w-md rounded-2xl border p-6 text-center ${finalPass ? 'border-emerald-400/50 bg-[#05150f]' : 'border-rose-400/50 bg-[#160a0e]'}`}>
          <p className="text-4xl">{finalPass ? '🔐' : '🔓'}</p>
          <h2 className={`mt-3 font-mono text-xl font-black ${finalPass ? 'text-emerald-300' : 'text-rose-300'}`}>
            {finalPass ? 'DEFENDED' : 'BREACHED'}
          </h2>
          <p className="mt-1 font-mono text-sm text-slate-400">
            {cleared}/{TOTAL_ROUNDS} passwords hardened · score {score}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            {finalPass
              ? 'Long + mixed + unique beats every wordlist. That is the whole secret.'
              : 'Longer beats cleverer: length first, variety second, uniqueness always.'}
          </p>
          <button
            onClick={() => onComplete(finalPass, score)}
            className="mt-5 w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-mono text-sm font-black tracking-widest text-white"
          >
            {finalPass ? 'RETURN TO THE RUN →' : 'CONTINUE →'}
          </button>
        </div>
      </div>
    )
  }

  const crackPct = Math.round((crackLeft / crackSeconds(Math.min(round + 1, TOTAL_ROUNDS))) * 100)

  return (
    <div className="absolute inset-0 z-[60] overflow-y-auto bg-[#05070d] px-4 py-8" onClick={() => inputRef.current?.focus()}>
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-mono text-[10px] tracking-[0.3em] text-cyan-300/80 uppercase">
            🔑 Remediation · {topic === 'password' ? 'Passwords' : 'Authentication'}
          </p>
          <p className="font-mono text-[10px] text-slate-500">
            {round + 1}/{TOTAL_ROUNDS} · hardened {cleared}
          </p>
        </div>

        {/* weak password + reason */}
        <div className="rounded-xl border border-rose-400/40 bg-[#160a0e] p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-rose-300/70">crackable password</p>
          <p className="mt-1 font-mono text-2xl font-black tracking-wider text-rose-200">{current.value}</p>
          <p className="mt-1 font-mono text-[11px] text-slate-400">— {current.why} —</p>
        </div>

        {/* crack bar */}
        <div className="mt-4">
          <div className="mb-1 flex justify-between font-mono text-[9px] text-slate-500">
            <span>HASH CRACKING…</span>
            <span>{crackLeft}s</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${crackPct > 50 ? 'bg-amber-400' : 'bg-rose-500'}`}
              style={{ width: `${100 - crackPct}%` }}
            />
          </div>
        </div>

        {/* input */}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
          placeholder="type a stronger replacement…"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className="mt-5 w-full rounded-xl border border-cyan-400/40 bg-[#08131c] px-4 py-3 text-center font-mono text-lg tracking-wider text-cyan-100 outline-none placeholder:text-slate-600 focus:border-cyan-300"
        />

        {/* live checklist */}
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {rules.map((r) => {
            const met = r.test(input, current.value)
            return (
              <span
                key={r.id}
                className={`rounded-full border px-2.5 py-1 font-mono text-[10px] ${
                  met
                    ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300'
                    : 'border-white/10 bg-white/[0.03] text-slate-500'
                }`}
              >
                {met ? '✓' : '○'} {r.label}
              </span>
            )
          })}
        </div>

        <button
          onClick={submit}
          disabled={!allMet}
          className="mt-5 w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-mono text-sm font-black tracking-widest text-white transition enabled:hover:scale-[1.01] disabled:opacity-30"
        >
          {allMet ? 'HARDEN IT ⏎' : 'MEET ALL THE RULES'}
        </button>
        <p className="mt-2 text-center font-mono text-[9px] text-slate-600">
          Enter to submit · green = the rule is satisfied
        </p>
      </div>

      {/* flash overlays */}
      {flash === 'good' && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-emerald-500/15">
          <p className="font-mono text-3xl font-black text-emerald-300">HARDENED ✓</p>
        </div>
      )}
      {flash === 'cracked' && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-rose-600/20">
          <p className="font-mono text-3xl font-black text-rose-300">CRACKED ✗</p>
        </div>
      )}
    </div>
  )
}
