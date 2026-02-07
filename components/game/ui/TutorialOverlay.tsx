export interface TutorialOverlayProps {
  showing: boolean
  onClose: () => void
}

export function TutorialOverlay({ showing, onClose }: TutorialOverlayProps) {
  if (!showing) return null

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center bg-black z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-gray-900 to-blue-900 border-2 border-cyan-500 rounded-lg p-3 md:p-4 max-w-2xl w-full max-h-[75vh] overflow-y-auto relative animate-in fade-in slide-in-from-top-2 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-1 right-1 text-gray-400 hover:text-white text-lg font-bold transition-colors z-10"
          aria-label="Close tutorial"
        >
          ✕
        </button>

        <div className="text-center mb-2">
          <h2 className="text-xl md:text-2xl font-bold text-cyan-400 mb-1">
            🎮 HOW TO PLAY
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-white text-xs">
          <div className="bg-black/50 border-2 border-cyan-600 rounded-lg p-2">
            <h3 className="text-cyan-400 font-bold text-sm mb-1">🎯 Objective</h3>
            <p className="text-gray-300 text-xs leading-tight">
              Collect <strong className="text-green-400">kits</strong>, survive threats. 
              Hit without kit = <strong className="text-red-400">game over!</strong>
            </p>
          </div>

          <div className="bg-black/50 border-2 border-purple-600 rounded-lg p-2">
            <h3 className="text-purple-400 font-bold text-sm mb-1">🕹️ Controls</h3>
            <div className="text-xs text-gray-300 space-y-1">
              <p>💻 <kbd className="bg-gray-800 px-1 py-0.5 rounded text-xs">WASD</kbd> or arrows</p>
              <p>📱 Touch & drag</p>
            </div>
          </div>

          <div className="bg-black/50 border-2 border-yellow-600 rounded-lg p-2 md:col-span-2">
            <h3 className="text-yellow-400 font-bold text-sm mb-1">⚡ Key Mechanics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-1 text-xs text-gray-300">
              <div>🔐 23 Kits</div>
              <div>🦠 60 Threats</div>
              <div>📈 5 Zones</div>
              <div>🧠 Quiz</div>
              <div>💾 Backup = Life</div>
              <div>📚 Real Tools</div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 italic mt-2 pt-2 border-t border-gray-700">
          Learn real cybersecurity. Each death teaches defense tools.
        </div>

        <div className="flex justify-center gap-2 mt-2 text-xs flex-wrap">
          <a 
            href="/privacy" 
            target="_blank"
            className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
          >
            Privacy
          </a>
          <span className="text-gray-600">•</span>
          <a 
            href="/terms" 
            target="_blank"
            className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
          >
            Terms
          </a>
          <span className="text-gray-600">•</span>
          <a 
            href="/faq" 
            target="_blank"
            className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
          >
            FAQ
          </a>
        </div>

        <p className="text-center text-xs text-gray-500 mt-2 italic">
          Click outside or X to close
        </p>
      </div>
    </div>
  )
}
