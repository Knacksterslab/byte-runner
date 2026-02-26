interface TimeRemaining {
  days: number
  hours: number
  minutes: number
}

interface ContestCountdownProps {
  status: string
  timeRemaining: TimeRemaining | null
}

export function ContestCountdown({ status, timeRemaining }: ContestCountdownProps) {
  if (status === 'active' && timeRemaining) {
    return (
      <div className="bg-green-900/40 border-2 border-green-500/50 rounded-lg px-6 py-4 backdrop-blur-sm">
        <p className="text-green-400 font-bold text-sm mb-2">⏰ Time Remaining:</p>
        <div className="flex gap-4 font-mono text-2xl">
          {[['Days', timeRemaining.days], ['Hours', timeRemaining.hours], ['Mins', timeRemaining.minutes]].map(
            ([label, value], i, arr) => (
              <div key={label as string} className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-white font-bold">{value}</div>
                  <div className="text-xs text-gray-400">{label}</div>
                </div>
                {i < arr.length - 1 && <div className="text-white">:</div>}
              </div>
            )
          )}
        </div>
      </div>
    )
  }

  if (status === 'active' && !timeRemaining) {
    return (
      <div className="bg-blue-900/40 border-2 border-blue-500/50 rounded-lg px-6 py-4 backdrop-blur-sm animate-pulse">
        <p className="text-blue-300 font-bold text-sm mb-1">⏳ Contest Ended!</p>
        <p className="text-gray-300 text-xs">Finalizing results and creating prize claims...</p>
      </div>
    )
  }

  if (status === 'ended') {
    return (
      <div className="bg-red-900/40 border-2 border-red-500/50 rounded-lg px-6 py-4 backdrop-blur-sm">
        <p className="text-red-300 font-bold text-sm">🏁 Contest Ended</p>
      </div>
    )
  }

  return null
}
