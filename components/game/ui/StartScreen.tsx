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
            <p><strong className="text-yellow-400">COLLECT KITS:</strong> Grab protection kits (🔐 🛡️ 🦠)</p>
            <p><strong className="text-green-400">SURVIVE:</strong> Use kits when hit by threats</p>
            <p><strong className="text-red-400">NO KIT = GAME OVER:</strong> Stay stocked!</p>
          </div>
          
          <div className="border-t-2 border-cyan-800 pt-2 mt-2">
            <h4 className="text-cyan-400 font-bold mb-1">CONTROLS:</h4>
            <div className="grid grid-cols-2 gap-1 text-left text-xs">
              <p>💻 <strong>WASD/Arrows</strong></p>
              <p>📱 <strong>Touch & Drag</strong></p>
            </div>
          </div>
          
          <div className="border-t-2 border-cyan-800 pt-2 mt-2">
            <h4 className="text-green-400 font-bold mb-1 text-sm">23 KITS • 5 ZONES • 60 THREATS</h4>
            <p className="text-yellow-400 text-xs">💡 Learn real cybersecurity while playing!</p>
            <p className="text-green-400 text-xs">💾 Backup Kit = Extra Life!</p>
          </div>
        </div>
        
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
    </div>
  )
}
