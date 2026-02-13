'use client'

import { useState, useEffect } from 'react'
import { getRandomQuizQuestion, type QuizQuestion } from '@/lib/game/quizQuestions'

interface QuizModalProps {
  kitType: string
  level: number
  onPass: () => void
  onFail: () => void
}

export default function QuizModal({ kitType, level, onPass, onFail }: QuizModalProps) {
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

  const handleSubmit = (answerOverride: number | null = selectedAnswer) => {
    if (answerOverride === null && timeLeft > 0) return // Must select an answer while timer active

    const correct = answerOverride === question?.correctAnswer
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
    <div
      className="quiz-modal-scroll absolute inset-0 z-30 overflow-y-auto overflow-x-hidden"
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        touchAction: 'pan-y',
        scrollbarWidth: 'none',
      }}
    >
      <div className="relative min-h-full flex items-start justify-center bg-transparent px-2 sm:px-3 md:px-4 pb-[calc(24px+env(safe-area-inset-bottom))] pt-[72px] sm:pt-[82px]">
      {/* Match home/mockup background look while quiz is open */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/space-background-final.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.84,
            filter: 'saturate(0.72) brightness(0.9)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 38%, rgba(0, 0, 0, 0.08) 0%, rgba(2, 4, 10, 0.42) 72%)',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[680px]">
        {!showResult ? (
          <>
            {/* Top status strip */}
            <div className="mb-3 px-1">
              <div className="flex items-center justify-between text-cyan-100 font-mono text-sm sm:text-lg tracking-wider">
                <span className="font-semibold">L{level} • NEWBIE</span>
                <span className="text-xl leading-none text-cyan-300">🧍</span>
                <span className="font-semibold text-yellow-300">❤️ ×0 {timeLeft}s</span>
              </div>
              <div className="mt-2 w-full bg-[#111827]/80 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${timeLeft <= 10 ? 'bg-red-400' : 'bg-green-400'}`}
                  style={{ width: `${(timeLeft / 30) * 100}%` }}
                />
              </div>
            </div>

            {/* Quiz content block */}
            <div className="rounded-[22px] border-2 border-cyan-300/80 bg-[#050c1b]/86 p-3 sm:p-4 shadow-[0_0_26px_rgba(34,211,238,0.35)]">
              <h2 className="mb-2 flex items-center justify-center gap-3 text-base sm:text-[1.75rem] font-black text-cyan-300 font-mono tracking-[0.15em]">
                <span className="h-px w-10 sm:w-16 bg-cyan-300/60" />
                <span className="whitespace-nowrap">⚡ {getQuizHeader(kitType)}</span>
                <span className="h-px w-10 sm:w-16 bg-cyan-300/60" />
              </h2>
              <p className="text-center text-[11px] sm:text-sm text-gray-100/95 font-semibold font-mono mb-4">
                Answer correctly to keep your gear & level.
              </p>

              {/* Question */}
              <div className="rounded-2xl border-2 border-cyan-300/70 bg-[#050a18]/94 px-3 py-4 sm:px-4 sm:py-4 mb-3">
                <p className="text-white text-[2rem] sm:text-[2.1rem] font-semibold font-mono leading-relaxed text-center">
                  {question.question}
                </p>
              </div>

              <p className="text-center text-gray-300 text-xs sm:text-sm font-semibold font-mono mb-3">
                30s Quiz • Choose the correct answer
              </p>

              {/* Options - Single Column */}
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (selectedAnswer !== null) return
                      setSelectedAnswer(index)
                      setTimeout(() => handleSubmit(index), 150)
                    }}
                    className={`w-full text-left p-3 sm:p-4 md:p-5 rounded-2xl font-mono text-sm sm:text-base transition-all border relative ${
                      selectedAnswer === index
                        ? 'bg-cyan-400/15 border-cyan-300/90 text-white shadow-[0_0_20px_rgba(80,200,255,0.45)]'
                        : 'bg-[#040912]/92 border-cyan-300/45 text-white/95 hover:bg-[#071122]/95 hover:border-cyan-300/75'
                    }`}
                    disabled={selectedAnswer !== null}
                  >
                    <span className="mr-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/80 text-cyan-200 font-black text-2xl align-middle">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="break-words align-middle font-semibold">{option}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Result Screen */}
            <div className="text-center bg-[#050c1b]/95 border-2 border-cyan-400/70 rounded-3xl p-5 sm:p-6 md:p-8 shadow-[0_0_24px_rgba(34,211,238,0.2)]">
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
      <style jsx>{`
        .quiz-modal-scroll::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;
        }
      `}</style>
    </div>
  )
}
