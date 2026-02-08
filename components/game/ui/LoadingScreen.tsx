export interface LoadingScreenProps {
  progress: number
}

export function LoadingScreen({ progress }: LoadingScreenProps) {
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden" style={{ zIndex: 10 }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative z-10 text-center space-y-6 px-4">
        <div className="relative">
          <img 
            src="/logo.png" 
            alt="Byte Runner Logo" 
            className="w-48 h-48 md:w-64 md:h-64 mx-auto drop-shadow-[0_0_40px_rgba(0,255,255,0.8)] animate-pulse"
            style={{ 
              filter: 'drop-shadow(0 0 30px rgba(0, 255, 255, 0.6))'
            }}
          />
        </div>

        <div className="inline-block bg-black/70 border border-cyan-800 rounded-lg px-4 py-3">
          <h2 className="text-2xl md:text-4xl font-bold text-cyan-300 font-mono drop-shadow-[0_0_10px_rgba(0,255,255,0.6)]">
            INITIALIZING CYBERSPACE...
          </h2>
        </div>

        <div className="w-72 md:w-96 mx-auto">
          <div className="h-4 md:h-3 bg-gray-900 rounded-full overflow-hidden border-2 border-cyan-700 shadow-[0_0_20px_rgba(0,255,255,0.3)]">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,255,0.8)]"
              style={{ 
                width: `${progress}%`,
                animation: 'shimmer 2s infinite'
              }}
            />
          </div>
          <p className="text-cyan-200 text-base md:text-base font-mono mt-2 drop-shadow-[0_0_6px_rgba(0,255,255,0.5)]">
            {Math.round(progress)}% • Loading assets...
          </p>
        </div>

        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 md:w-3 md:h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 md:w-3 md:h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  )
}
