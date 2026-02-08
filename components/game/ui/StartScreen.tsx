import { LeaderboardPanel } from './LeaderboardPanel'

export interface StartScreenProps {
  onStart: () => void
  onShowTutorial: () => void
}

export function StartScreen({ onStart, onShowTutorial }: StartScreenProps) {
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-y-auto py-4" style={{ zIndex: 10 }}>
      <button
        onClick={onShowTutorial}
        className="absolute top-4 right-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-xl z-20 text-xl md:text-2xl"
        title="Show tutorial"
      >
        ?
      </button>

      <div className="text-center space-y-4 max-w-2xl px-4 my-auto">
        <img 
          src="/logo.png" 
          alt="Byte Runner Logo" 
          className="w-40 h-40 md:w-56 md:h-56 mx-auto mb-4 drop-shadow-[0_0_40px_rgba(0,255,255,0.8)] hover:scale-105 transition-transform duration-300"
        />
        
        <p className="text-red-500 text-lg md:text-xl font-bold drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]">
          The cyber storm is here - fortify or fall!
        </p>
        
        <div className="bg-black/80 border-2 border-cyan-600 rounded-lg p-4 md:p-6 text-white space-y-2 backdrop-blur-sm">
          <h3 className="text-cyan-400 font-bold text-lg md:text-xl mb-2">HOW TO PLAY:</h3>
          <div className="text-left space-y-1 text-sm md:text-base">
            <p><strong className="text-cyan-300">MOVE:</strong> WASD / Arrows / Touch</p>
            <p><strong className="text-orange-300">DODGE THREATS:</strong> Avoid enemies</p>
            <p><strong className="text-yellow-400">COLLECT KITS:</strong> Protection items</p>
            <p><strong className="text-red-400">NO KIT = GAME OVER:</strong> Stay stocked</p>
          </div>
        </div>

        <LeaderboardPanel className="max-w-md mx-auto" />
        
        <button
          onClick={onStart}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xl md:text-2xl font-bold py-4 md:py-5 px-12 md:px-14 rounded-xl transition-transform transform hover:scale-105 shadow-2xl animate-pulse mt-2 cursor-pointer relative"
          style={{ zIndex: 100 }}
        >
          🎮 START GAME
        </button>
      </div>

      <button
        onClick={() => {
          window.open('mailto:connect@knacksters.co?subject=Byte Runner Feedback&body=Hi! Here\'s my feedback about Byte Runner:%0D%0A%0D%0A', '_blank')
        }}
        className="absolute bottom-4 left-4 bg-purple-600 hover:bg-purple-700 text-white text-sm md:text-base font-semibold py-3 px-4 md:px-5 rounded-full md:rounded-lg transition-all shadow-xl hover:scale-105 flex items-center gap-2 z-20"
        title="Send feedback"
      >
        <span className="text-lg md:text-base">📝</span>
        <span className="hidden md:inline">Feedback</span>
      </button>

      <div className="absolute bottom-4 right-4 text-xs text-gray-400 flex gap-2 z-20">
        <a href="/privacy" className="hover:text-cyan-300 transition-colors">Privacy</a>
        <span className="text-gray-600">•</span>
        <a href="/terms" className="hover:text-cyan-300 transition-colors">Terms</a>
        <span className="text-gray-600">•</span>
        <a href="/faq" className="hover:text-cyan-300 transition-colors">FAQ</a>
      </div>
    </div>
  )
}
