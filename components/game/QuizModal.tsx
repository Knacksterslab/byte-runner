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
      <div className="absolute inset-0 flex items-center justify-center bg-black/95 z-30">
        <div className="text-white text-2xl font-mono">Loading question...</div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/95 z-30 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-blue-900 border-4 border-cyan-500 rounded-2xl p-8 max-w-3xl w-full mx-auto">
        {!showResult ? (
          <>
            {/* Timer */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-cyan-400 font-mono">KNOWLEDGE CHECK</h2>
                <div className={`text-3xl font-bold font-mono ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                  ⏱️ {timeLeft}s
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${timeLeft <= 10 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${(timeLeft / 30) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="bg-black/50 border-2 border-cyan-600 rounded-lg p-6 mb-6">
              <p className="text-white text-xl font-mono leading-relaxed">
                {question.question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`w-full text-left p-4 rounded-lg font-mono text-lg transition-all border-2 ${
                    selectedAnswer === index
                      ? 'bg-cyan-600 border-cyan-400 text-white scale-105'
                      : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-cyan-600'
                  }`}
                >
                  <span className="font-bold text-cyan-400 mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className={`w-full text-2xl font-bold py-4 px-8 rounded-lg transition-all font-mono ${
                selectedAnswer === null
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white transform hover:scale-105'
              }`}
            >
              {selectedAnswer === null ? 'SELECT AN ANSWER' : '✓ SUBMIT ANSWER'}
            </button>

            {/* Hint */}
            <p className="text-center text-gray-400 text-sm mt-4 font-mono">
              Time runs out = automatic failure
            </p>
          </>
        ) : (
          <>
            {/* Result Screen */}
            <div className="text-center">
              {isCorrect ? (
                <>
                  <div className="text-8xl mb-4 animate-bounce">✅</div>
                  <h2 className="text-5xl font-bold text-green-400 font-mono mb-4 animate-pulse">CORRECT!</h2>
                  <p className="text-2xl text-white mb-6 font-mono">Continuing from your checkpoint...</p>
                </>
              ) : (
                <>
                  <div className="text-8xl mb-4 animate-pulse">❌</div>
                  <h2 className="text-5xl font-bold text-red-500 font-mono mb-4">INCORRECT</h2>
                  <p className="text-xl text-gray-300 mb-4 font-mono">
                    {timeLeft === 0 ? "Time's up!" : 'Wrong answer'}
                  </p>
                </>
              )}

              {/* Show correct answer and explanation */}
              <div className="bg-black/50 border-2 border-yellow-600 rounded-lg p-6 mt-6 text-left">
                <p className="text-yellow-400 font-bold mb-2 font-mono">💡 CORRECT ANSWER:</p>
                <p className="text-white text-lg mb-4 font-mono">
                  <span className="font-bold text-cyan-400">{String.fromCharCode(65 + question.correctAnswer)}.</span> {question.options[question.correctAnswer]}
                </p>
                
                <p className="text-gray-400 font-mono leading-relaxed">
                  {question.explanation}
                </p>
              </div>

              {!isCorrect && (
                <p className="text-red-400 text-lg mt-6 font-mono">
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
