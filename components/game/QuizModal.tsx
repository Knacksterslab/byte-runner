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
      'social-engineering-defense': 'DETECT SCAMS',
      'badge-tap': 'PHYSICAL ACCESS',
      'secure-shred': 'SECURE DISPOSAL',
      'policy-knowledge': 'POLICY CHECK',
      'ethics-reporting': 'REPORT INCIDENT',
      'compliance-kit': 'COMPLIANCE BASICS',
      'remote-work-guard': 'REMOTE WORK',
      'waiting-room': 'MEETING SECURITY',
      'travel-vpn': 'TRAVEL SAFETY',
      'encryption-kit': 'DATA ENCRYPTION',
      'sbom-toolkit': 'SUPPLY CHAIN',
      'insider-monitor': 'INSIDER RISK',
      'email-gateway': 'EMAIL SECURITY',
      'classification-labeler': 'DATA LABELS',
      'privacy-check': 'SOCIAL PRIVACY',
      'device-control': 'USB SAFETY'
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
    <div className="absolute inset-0 flex items-center justify-center bg-transparent z-30 p-3 md:p-4 pb-[calc(12px+env(safe-area-inset-bottom))]">
      <div 
        className="bg-[#0b1020]/45 rounded-3xl p-4 sm:p-6 md:p-8 max-w-2xl w-full mx-auto relative backdrop-blur-[2px] shadow-[0_0_30px_rgba(64,200,255,0.2)]"
        style={{
          border: '2px solid',
          borderColor: 'rgba(120, 200, 255, 0.5)'
        }}
      >
        {!showResult ? (
          <>
            {/* Header with Timer */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base sm:text-xl md:text-2xl font-black text-cyan-300 font-mono tracking-widest flex items-center gap-2">
                  ⚡ {getQuizHeader(kitType)}
                </h2>
                <div className={`text-2xl sm:text-3xl md:text-4xl font-bold font-mono ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-cyan-200'}`}>
                  {timeLeft}s
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-white/10 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full transition-all ${timeLeft <= 10 ? 'bg-red-400' : 'bg-green-400'}`}
                  style={{ width: `${(timeLeft / 30) * 100}%` }}
                />
              </div>
              <p className="text-[11px] sm:text-xs text-gray-300/90 font-mono mt-2">
                Correct answers keep gear & level
              </p>
            </div>

            {/* Question */}
            <div className="bg-black/30 border border-cyan-400/40 rounded-2xl p-3 sm:p-4 md:p-5 mb-3">
              <p className="text-white text-sm sm:text-base md:text-lg font-mono leading-relaxed text-center">
                {question.question}
              </p>
            </div>

            <p className="text-center text-gray-400 text-xs sm:text-sm font-mono mb-4">
              30s Quiz • Choose the correct answer
            </p>

            {/* Options - Single Column */}
            <div className="space-y-3 mb-5">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`text-left p-3 sm:p-4 md:p-5 rounded-2xl font-mono text-xs sm:text-sm md:text-base transition-all border relative ${
                    selectedAnswer === index
                      ? 'bg-cyan-400/20 border-cyan-300 text-white shadow-[0_0_20px_rgba(80,200,255,0.45)]'
                      : 'bg-black/20 border-white/15 text-gray-300 hover:bg-white/5 hover:border-cyan-400/40'
                  }`}
                >
                  <span className={`font-extrabold mr-2 ${selectedAnswer === index ? 'text-cyan-300' : 'text-gray-500'}`}>
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="break-words">{option}</span>
                </button>
              ))}
            </div>

            {/* Bottom Info */}
            <p className="text-center text-gray-300/90 text-xs sm:text-sm font-mono mb-6">
              + Correct answers keep your level & all kits
            </p>

            {/* Submit Button (Hidden, auto-submit on selection in mockup style) */}
            {selectedAnswer !== null && (
              <button
                onClick={handleSubmit}
                className="w-full text-base sm:text-lg md:text-xl font-black py-3 sm:py-4 px-6 sm:px-8 rounded-2xl transition-all font-mono bg-gradient-to-r from-green-500/90 to-cyan-500/90 hover:from-green-400 hover:to-cyan-400 text-white transform hover:scale-[1.02] tracking-wide shadow-[0_0_24px_rgba(80,200,255,0.4)]"
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
