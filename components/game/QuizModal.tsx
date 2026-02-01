'use client'

import { useState, useEffect } from 'react'
import { getRandomQuizQuestion, type QuizQuestion } from '@/lib/game/quizQuestions'

interface QuizModalProps {
  kitType: string
  onPass: () => void
  onFail: () => void
  onClose: () => void
}

export default function QuizModal({ kitType, onPass, onFail, onClose }: QuizModalProps) {
  const [question, setQuestion] = useState<QuizQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  // Get dynamic header based on kit type
  const getQuizHeader = (kit: string): string => {
    const headers: Record<string, string> = {
      'password-manager': 'CHECK PASSWORDS',
      'link-analyzer': 'ANALYZE LINKS',
      'patch-manager': 'UPDATE SECURITY',
      'privacy-optimizer': 'PROTECT PRIVACY',
      'vpn-shield': 'NETWORK SAFETY',
      'mfa-authenticator': 'VERIFY IDENTITY',
      'backup-system': 'BACKUP DATA',
      'social-engineering-defense': 'DETECT SCAMS'
    }
    return headers[kit] || 'KNOWLEDGE CHECK'
  }

  // Load question on mount
  useEffect(() => {
    const q = getRandomQuizQuestion(kitType)
    setQuestion(q)
  }, [kitType])

  // Timer countdown
  useEffect(() => {
    if (timeLeft === 0 && !showResult) {
      // Time's up! Auto-fail
      handleSubmit()
      return
    }

    if (showResult) return // Don't countdown during result screen

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, showResult])

  const handleSubmit = () => {
    if (selectedAnswer === null && timeLeft > 0) return // Must select an answer

    const correct = selectedAnswer === question?.correctAnswer
    setIsCorrect(correct)
    setShowResult(true)

    // After 3 seconds, trigger pass/fail
    setTimeout(() => {
      if (correct) {
        onPass()
      } else {
        onFail()
      }
    }, 3000)
  }

  if (!question) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-30">
        <div className="text-white text-2xl font-mono">Loading question...</div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-30 p-4">
      <div 
        className="bg-[#0f1629] rounded-3xl p-6 md:p-8 max-w-2xl w-full mx-auto relative"
        style={{
          border: '4px solid',
          borderImage: 'linear-gradient(135deg, #00ffff, #0088ff, #aa44ff, #ff00ff) 1'
        }}
      >
        {!showResult ? (
          <>
            {/* Header with Timer */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl md:text-2xl font-black text-cyan-400 font-mono tracking-widest">{getQuizHeader(kitType)}</h2>
                <div className={`text-3xl md:text-4xl font-bold font-mono ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                  {timeLeft}s
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-800/50 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full transition-all ${timeLeft <= 10 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${(timeLeft / 30) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="bg-black/30 border-2 border-cyan-500/40 rounded-2xl p-5 md:p-6 mb-5">
              <p className="text-white text-base md:text-lg font-mono leading-relaxed">
                {question.question}
              </p>
            </div>

            {/* Options - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`text-left p-4 md:p-5 rounded-2xl font-mono text-sm md:text-base transition-all border-2 relative ${
                    selectedAnswer === index
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-black/30 border-gray-700/50 text-gray-300 hover:bg-gray-800/50 hover:border-cyan-600/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className={`font-extrabold mr-2 ${selectedAnswer === index ? 'text-cyan-400' : 'text-gray-500'}`}>
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="break-words">{option}</span>
                    </div>
                    {selectedAnswer === index && (
                      <span className="text-green-400 text-xl font-bold flex-shrink-0">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Bottom Info */}
            <p className="text-center text-gray-400 text-sm font-mono mb-6">
              30s • Multiple choice
            </p>

            {/* Submit Button (Hidden, auto-submit on selection in mockup style) */}
            {selectedAnswer !== null && (
              <button
                onClick={handleSubmit}
                className="w-full text-lg md:text-xl font-black py-4 px-8 rounded-2xl transition-all font-mono bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white transform hover:scale-[1.02] tracking-wide shadow-xl"
              >
                ✓ SUBMIT ANSWER
              </button>
            )}
          </>
        ) : (
          <>
            {/* Result Screen */}
            <div className="text-center">
              {isCorrect ? (
                <>
                  <div className="text-8xl mb-6 animate-bounce">✅</div>
                  <h2 className="text-4xl md:text-5xl font-black text-green-400 font-mono mb-4 animate-pulse tracking-widest">CORRECT!</h2>
                  <p className="text-xl md:text-2xl text-white mb-6 font-mono">Continuing from your checkpoint...</p>
                </>
              ) : (
                <>
                  <div className="text-8xl mb-6 animate-pulse">❌</div>
                  <h2 className="text-4xl md:text-5xl font-black text-red-500 font-mono mb-4 tracking-widest">INCORRECT</h2>
                  <p className="text-lg md:text-xl text-gray-300 mb-4 font-mono font-bold">
                    {timeLeft === 0 ? "Time's up!" : 'Wrong answer'}
                  </p>
                </>
              )}

              {/* Show correct answer and explanation */}
              <div className="bg-black/30 border-2 border-yellow-500/60 rounded-2xl p-5 md:p-6 mt-6 text-left">
                <p className="text-yellow-400 font-extrabold mb-3 font-mono tracking-wide">💡 CORRECT ANSWER:</p>
                <p className="text-white text-base md:text-lg mb-4 font-mono">
                  <span className="font-extrabold text-cyan-400">{String.fromCharCode(65 + question.correctAnswer)}.</span> {question.options[question.correctAnswer]}
                </p>
                
                <p className="text-gray-300 font-mono leading-relaxed text-sm md:text-base">
                  {question.explanation}
                </p>
              </div>

              {!isCorrect && (
                <p className="text-red-400 text-base md:text-lg mt-6 font-mono font-bold">
                  Restarting with partial kit retention...
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
