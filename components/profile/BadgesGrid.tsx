'use client'

import { Award, Star } from 'lucide-react'
import type { Badge, UserBadge } from '@/lib/api/backend'

interface BadgesGridProps {
  allBadges: Badge[]
  myBadges: UserBadge[]
  featuredBadgeId: string | null
  onSetFeatured: (badgeId: string) => void
}

export function BadgesGrid({ allBadges, myBadges, featuredBadgeId, onSetFeatured }: BadgesGridProps) {
  return (
    <div className="bg-gray-900/30 border-2 border-gray-700 rounded-lg p-6 mb-8 backdrop-blur-sm">
      <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
        <Award className="w-5 h-5" />
        Badges ({myBadges.length}/{allBadges.length})
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {allBadges.map((badge) => {
          const earned = myBadges.find((ub) => ub.badge_id === badge.id)
          const isFeatured = featuredBadgeId === badge.id

          return (
            <button
              key={badge.id}
              onClick={() => earned && onSetFeatured(badge.id)}
              disabled={!earned}
              className={`
                relative p-4 rounded-lg border-2 transition-all
                ${earned
                  ? 'bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-600/50 hover:scale-105 cursor-pointer'
                  : 'bg-gray-800/40 border-gray-700/50 opacity-40 cursor-not-allowed'
                }
                ${isFeatured ? 'ring-2 ring-cyan-400' : ''}
              `}
              title={earned ? 'Click to set as featured badge' : 'Not earned yet'}
            >
              {isFeatured && (
                <div className="absolute -top-2 -right-2 bg-cyan-500 rounded-full p-1">
                  <Star className="w-4 h-4 text-white" fill="currentColor" />
                </div>
              )}
              <div className="text-4xl mb-2">{badge.emoji}</div>
              <p className={`text-xs font-bold ${earned ? 'text-yellow-300' : 'text-gray-500'}`}>
                {badge.name}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">{badge.description}</p>
              {earned && (
                <p className="text-[9px] text-gray-500 mt-1">
                  {new Date(earned.earned_at).toLocaleDateString()}
                </p>
              )}
            </button>
          )
        })}
      </div>
      {myBadges.length === 0 && (
        <p className="text-center text-gray-400 mt-4 text-sm">Play and share to earn badges!</p>
      )}
    </div>
  )
}
