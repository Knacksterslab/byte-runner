import Link from 'next/link'
import { Gamepad2, Shield, Trophy, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-black flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-12 text-center">
        {/* Logo and Title */}
        <div className="space-y-4">
          <Gamepad2 className="w-24 h-24 text-cyan-400 mx-auto animate-pulse" />
          <h1 className="text-7xl font-bold text-neon-cyan mb-4 font-mono">
            BYTE RUNNER
          </h1>
          <p className="text-cyan-300 text-2xl max-w-2xl mx-auto">
            The endless runner that teaches cybersecurity through interactive puzzles
          </p>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-800 rounded-2xl p-6 hover:border-cyan-600 transition-colors">
            <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Endless Running</h3>
            <p className="text-gray-300 text-sm">Fast-paced action that keeps you on your toes</p>
          </div>
          
          <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-800 rounded-2xl p-6 hover:border-cyan-600 transition-colors">
            <Shield className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Learn Security</h3>
            <p className="text-gray-300 text-sm">Solve real-world security puzzles as you play</p>
          </div>
          
          <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-800 rounded-2xl p-6 hover:border-cyan-600 transition-colors">
            <Trophy className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Compete</h3>
            <p className="text-gray-300 text-sm">Beat your high score and share with friends</p>
          </div>
          
          <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-800 rounded-2xl p-6 hover:border-cyan-600 transition-colors">
            <Gamepad2 className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Play Anywhere</h3>
            <p className="text-gray-300 text-sm">Works on desktop and mobile browsers</p>
          </div>
        </div>
        
        {/* CTA */}
        <div className="space-y-6">
          <Link
            href="/game"
            className="inline-block bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-3xl font-bold py-6 px-16 rounded-xl transition-all transform hover:scale-105 font-mono shadow-2xl"
          >
            START GAME
          </Link>
          
          <div className="text-gray-400 text-sm">
            <p>Free to play • No downloads • No signup required</p>
          </div>
        </div>
        
        {/* Info */}
        <div className="bg-gray-900/30 border border-gray-700 rounded-2xl p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4 font-mono">How to Play</h2>
          <div className="text-left space-y-3 text-gray-300">
            <p>🏃 <strong>Move:</strong> Swipe left/right to switch lanes</p>
            <p>⬆️ <strong>Jump:</strong> Swipe up or tap anywhere to jump</p>
            <p>📦 <strong>Collect:</strong> Grab data packets for points</p>
            <p>🚧 <strong>Avoid:</strong> Dodge obstacles or face the consequences</p>
            <p>🧩 <strong>Learn:</strong> Every 1000m, solve a security puzzle</p>
          </div>
        </div>
        
        <div className="text-gray-500 text-sm">
          <p>Made with ❤️ for cybersecurity education</p>
        </div>
      </div>
    </div>
  )
}
