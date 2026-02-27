interface GuestSavePromptProps {
  onSignInAndSave: () => void
  onLater: () => void
}

export function GuestSavePrompt({ onSignInAndSave, onLater }: GuestSavePromptProps) {
  return (
    <div className="fixed top-[calc(12px+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-50 w-[min(92vw,560px)]">
      <div className="rounded-2xl border border-cyan-300/70 bg-[#061225]/92 px-3 py-3 shadow-[0_0_24px_rgba(34,211,238,0.35)]">
        <p className="text-cyan-100 font-mono font-bold text-sm sm:text-base">
          Secure this run before losing progress.
        </p>
        <p className="mt-1 text-cyan-200/90 font-mono text-xs sm:text-sm">
          Sign in now and save your current score without ending the run.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={onSignInAndSave}
            className="flex-1 rounded-full border border-cyan-100/60 bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 px-3 py-2 text-white font-black font-mono text-xs tracking-wider"
          >
            SIGN IN & SAVE
          </button>
          <button
            onClick={onLater}
            className="rounded-full border border-cyan-300/40 bg-[#07101f]/78 px-4 py-2 text-cyan-100 font-mono text-xs"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  )
}
