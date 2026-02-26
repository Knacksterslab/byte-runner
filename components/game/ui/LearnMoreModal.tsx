'use client'

import { getProtectionKitForThreat } from '@/lib/game/protectionKits'
import { getThreatName } from '@/lib/game/threatData'
import { trackDeepDiveViewed } from '@/lib/analytics'

interface LearnMoreModalProps {
  lastThreatType: string
  onClose: (awardKit?: boolean) => void
}

export function LearnMoreModal({ lastThreatType, onClose }: LearnMoreModalProps) {
  const protectionKit = getProtectionKitForThreat(lastThreatType)
  if (!protectionKit) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30 overflow-y-auto p-3 md:p-4 pb-[calc(12px+env(safe-area-inset-bottom))]">
      <div className="bg-[#0b1020]/65 border-2 border-cyan-400/40 rounded-2xl p-4 sm:p-5 max-w-2xl w-full mx-auto my-auto max-h-[90svh] overflow-y-auto relative [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cyan-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-gray-800 hover:[&::-webkit-scrollbar-thumb]:bg-cyan-400 shadow-[0_0_30px_rgba(0,200,255,0.2)]">
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <h2 className="text-cyan-200 text-base sm:text-lg md:text-xl font-bold font-mono tracking-wide">WHY DID I DIE?</h2>
          </div>
          <button
            onClick={() => onClose(true)}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-cyan-400/40 text-cyan-200 hover:text-white hover:border-cyan-300 transition-colors"
            aria-label="Close details"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs sm:text-sm font-mono">
          <div className="border-b border-cyan-500/20 pb-2">
            <p className="text-red-300 flex items-center gap-2">
              <span>⚠️</span>
              <span className="uppercase tracking-wide">Cause</span>
            </p>
            <p className="text-yellow-200 mt-1">{getThreatName(lastThreatType)}</p>
          </div>

          <div className="border-b border-cyan-500/20 pb-2">
            <p className="text-cyan-300 flex items-center gap-2">
              <span>🛡️</span>
              <span className="uppercase tracking-wide">Missing protection</span>
            </p>
            <p className="text-cyan-100 mt-1">{protectionKit.name}</p>
          </div>

          <div className="border-b border-cyan-500/20 pb-2">
            <p className="text-gray-300 uppercase tracking-wide">Summary</p>
            <p className="text-gray-200 mt-1">{protectionKit.whyItMatters}</p>
            <button
              onClick={() => trackDeepDiveViewed(protectionKit.id)}
              className="text-cyan-300 mt-2 hover:text-cyan-200 transition-colors"
            >
              More details →
            </button>
          </div>

          <div className="border-b border-cyan-500/20 pb-2">
            <p className="text-gray-300 uppercase tracking-wide">What happened</p>
            <p className="text-gray-200 mt-1">{protectionKit.whatItIs}</p>
            <p className="text-gray-200 mt-2">{protectionKit.howItWorks}</p>
          </div>

          <div className="border-b border-cyan-500/20 pb-2">
            <p className="text-gray-300 uppercase tracking-wide">Real-world example</p>
            <p className="text-gray-200 mt-1">{protectionKit.realWorldExample.title}</p>
            <p className="text-gray-200 mt-1">{protectionKit.realWorldExample.description}</p>
          </div>

          <div>
            <p className="text-gray-300 uppercase tracking-wide">How this is prevented</p>
            <ul className="text-gray-200 mt-1 space-y-1 list-disc list-inside">
              {protectionKit.learningPoints.slice(0, 3).map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
