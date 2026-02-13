'use client'

import { useEffect, useState } from 'react'
import { getAllContests, type Contest } from '@/lib/api/backend'
import { Trophy, Calendar, Clock, Award } from 'lucide-react'
import Link from 'next/link'

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'ended'>('all')

  useEffect(() => {
    loadContests()
  }, [filter])

  const loadContests = async () => {
    setLoading(true)
    try {
      const status = filter === 'all' ? undefined : filter
      const data = await getAllContests(status)
      setContests(data)
    } catch (error) {
      console.error('Failed to load contests:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: Contest['status']) => {
    const badges = {
      upcoming: { color: 'bg-blue-600/80 border-blue-400', text: 'Upcoming' },
      active: { color: 'bg-green-600/80 border-green-400', text: 'Active Now!' },
      ended: { color: 'bg-gray-600/80 border-gray-400', text: 'Ended' },
      cancelled: { color: 'bg-red-600/80 border-red-400', text: 'Cancelled' },
    }
    const badge = badges[status]
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  const getTimeRemaining = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diff = end.getTime() - now.getTime()
    
    if (diff < 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h remaining`
    return `${hours}h remaining`
  }

  const formatInTimeZone = (iso: string, timeZone: string) =>
    new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone,
    }).format(new Date(iso))

  return (
    <div
      className="contests-scroll-wrapper relative min-h-[100dvh] text-white overflow-y-auto overflow-x-hidden space-background"
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        touchAction: 'pan-y',
        scrollbarWidth: 'none',
      }}
    >
      <div className="absolute inset-0 vignette pointer-events-none" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-4 mb-6">
            <img
              src="/logo.png"
              alt="Byte Runner"
              className="h-24 sm:h-32 w-auto drop-shadow-[0_0_38px_rgba(0,255,255,0.85)]"
            />
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-cyan-400 to-blue-400">
                Contests
              </h1>
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <p className="text-gray-400 text-base sm:text-lg">
            Compete for prizes and glory!
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {(['all', 'active', 'upcoming', 'ended'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                filter === filterOption
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent"></div>
            <p className="text-gray-400 mt-4 font-mono">Loading contests...</p>
          </div>
        ) : contests.length === 0 ? (
          <div className="text-center py-20 bg-black/40 border-2 border-cyan-700/50 rounded-lg backdrop-blur-sm">
            <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-mono">No contests found</p>
            <p className="text-gray-500 text-sm mt-2">Check back soon for upcoming contests!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contests.map((contest) => (
              <Link
                key={contest.id}
                href={`/contests/${contest.id}`}
                className="block bg-gradient-to-br from-gray-900/60 to-gray-800/40 border-2 border-cyan-700/50 hover:border-cyan-500/80 rounded-lg p-6 backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,255,255,0.3)]"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-cyan-300">
                    {contest.name}
                  </h2>
                  {getStatusBadge(contest.status)}
                </div>

                {/* Description */}
                {contest.description && (
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {contest.description}
                  </p>
                )}

                {/* Dates */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(contest.start_date).toLocaleDateString()} - {new Date(contest.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs text-cyan-200/80 font-mono">
                    Official ({contest.contest_timezone || 'UTC'}): {formatInTimeZone(contest.start_date, contest.contest_timezone || 'UTC')} → {formatInTimeZone(contest.end_date, contest.contest_timezone || 'UTC')}
                  </div>
                  {contest.status === 'active' && (
                    <div className="flex items-center gap-2 text-sm text-green-400 font-bold">
                      <Clock className="w-4 h-4" />
                      <span>{getTimeRemaining(contest.end_date)}</span>
                    </div>
                  )}
                </div>

                {/* Prize pool preview */}
                {contest.prize_pool && (
                  <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
                    <p className="text-yellow-400 font-bold text-sm mb-1">Prize Pool:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(contest.prize_pool).slice(0, 3).map(([rank, prize]) => (
                        <span key={rank} className="text-xs text-yellow-200">
                          #{rank}: {prize}
                        </span>
                      ))}
                      {Object.keys(contest.prize_pool).length > 3 && (
                        <span className="text-xs text-yellow-300">+ more...</span>
                      )}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="mt-4 text-cyan-400 font-mono text-sm flex items-center gap-2">
                  <span>View Details</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Back to home */}
        <div className="mt-12 text-center">
          <a 
            href="/"
            className="text-cyan-400 hover:text-cyan-300 underline text-base sm:text-lg transition-colors font-mono"
          >
            ← Back to Game
          </a>
        </div>
      </div>

      <style jsx>{`
        .contests-scroll-wrapper::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        .space-background {
          background-image: url('/space-background.png');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          background-color: #05070d;
        }
        
        .vignette {
          background: radial-gradient(circle at 50% 40%, transparent 0%, rgba(2, 4, 10, 0.85) 70%);
        }
      `}</style>
    </div>
  )
}
