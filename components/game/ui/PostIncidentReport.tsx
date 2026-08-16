'use client'

import { useMemo, useState } from 'react'
import { getThreatById } from '@/lib/game/threatData'
import { getProtectionKitForThreat } from '@/lib/game/protectionKits'
import { CATEGORY_VISUALS } from '@/lib/game/visuals'

const WEAKNESS_KEY = 'byterunner:weakness'

const CATEGORY_LABELS: Record<string, string> = {
  password: 'Passwords',
  phishing: 'Phishing',
  updates: 'Patching',
  privacy: 'Privacy',
  wifi: 'WiFi',
  authentication: 'Authentication',
  'data-loss': 'Data Loss',
  'social-engineering': 'Social Engineering',
  'physical-security': 'Physical Security',
  'secure-disposal': 'Secure Disposal',
  policy: 'Policy',
  'incident-reporting': 'Incident Reporting',
  compliance: 'Compliance',
  'remote-work': 'Remote Work',
  'meeting-security': 'Meetings',
  'travel-security': 'Travel',
  'data-protection': 'Data Protection',
  'supply-chain': 'Supply Chain',
  'insider-threats': 'Insider Threats',
  'email-security': 'Email Security',
  'data-classification': 'Data Classification',
  'social-media': 'Social Media',
  'removable-media': 'Removable Media',
}

function readWeakness(): { category: string; count: number; pct: number }[] {
  try {
    const raw: Record<string, number> = JSON.parse(localStorage.getItem(WEAKNESS_KEY) || '{}')
    const total = Object.values(raw).reduce((a, b) => a + b, 0)
    if (total < 3) return []
    return Object.entries(raw)
      .map(([category, count]) => ({ category, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
  } catch {
    return []
  }
}

/**
 * Post-Incident Report: what killed you, what stops it, and your weak spots.
 * Rendered inside the game-over screen.
 */
export function PostIncidentReport({ lastThreatId }: { lastThreatId: string | null }) {
  const [copied, setCopied] = useState(false)
  const weaknesses = useMemo(readWeakness, [])

  const threat = lastThreatId ? getThreatById(lastThreatId) : undefined
  const kit = lastThreatId ? getProtectionKitForThreat(lastThreatId) : undefined

  const shareText = [
    '🛡️ BYTE RUNNER — INCIDENT REPORT',
    threat ? `Terminated by: ${threat.name}` : 'Terminated by: unknown threat',
    kit ? `Countermeasure: ${kit.name} kit` : null,
    weaknesses[0] ? `Weakest sector: ${CATEGORY_LABELS[weaknesses[0].category] ?? weaknesses[0].category} (${weaknesses[0].pct}% of hits)` : null,
    'Can you survive longer? → byterunner.co',
  ]
    .filter(Boolean)
    .join('\n')

  const onShare = async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'Byte Runner Incident Report', text: shareText })
      else await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // user dismissed share sheet
    }
  }

  return (
    <div className="mt-4 w-full rounded-xl border border-cyan-400/30 bg-[#05070d]/90 p-4 text-left">
      <p className="font-mono text-[10px] tracking-[0.25em] text-cyan-300/80 uppercase">
        📋 Post-Incident Report
      </p>

      {threat ? (
        <div className="mt-2 space-y-1.5">
          <p className="text-sm text-white">
            <span className="text-rose-400 font-semibold">{threat.name}</span> terminated this run.
          </p>
          <p className="text-xs leading-relaxed text-slate-300">
            {threat.educationalContent?.[0] ?? threat.description}
          </p>
          {kit && (
            <p className="text-xs text-emerald-300/90">
              Countermeasure: <span className="font-semibold">{kit.name}</span> kit
            </p>
          )}
        </div>
      ) : (
        <p className="mt-2 text-xs text-slate-400">No incident data recorded for this run.</p>
      )}

      {weaknesses.length > 0 && (
        <div className="mt-3 border-t border-white/10 pt-3">
          <p className="font-mono text-[10px] tracking-widest text-amber-300/80 uppercase">
            🧠 Knowledge gaps (quiz misses &amp; incidents)
          </p>
          <div className="mt-2 space-y-1.5">
            {weaknesses.map((w) => {
              const spec = CATEGORY_VISUALS[w.category as keyof typeof CATEGORY_VISUALS]
              return (
                <div key={w.category} className="flex items-center gap-2">
                  <span className="w-28 shrink-0 truncate text-[11px] text-slate-300">
                    {CATEGORY_LABELS[w.category] ?? w.category}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${w.pct}%`, background: spec ? '#22d3ee' : '#f59e0b' }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-[10px] text-slate-400">{w.pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onShare}
        className="mt-3 w-full rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 font-mono text-[11px] tracking-wide text-cyan-200 transition hover:bg-cyan-400/20"
      >
        {copied ? '✓ Copied to clipboard' : 'Share incident report'}
      </button>
    </div>
  )
}
