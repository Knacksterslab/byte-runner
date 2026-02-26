'use client'

import { Edit, Trash2 } from 'lucide-react'
import { formatDateInTimeZone } from '@/lib/utils/timezone'
import type { Contest } from '@/lib/api/backend'

interface ContestListProps {
  contests: Contest[]
  onEdit: (contest: Contest) => void
  onDelete: (contestId: string) => void
}

const STATUS_COLORS: Record<Contest['status'], string> = {
  active: 'bg-green-600',
  upcoming: 'bg-blue-600',
  ended: 'bg-gray-600',
  cancelled: 'bg-red-600',
}

export function ContestList({ contests, onEdit, onDelete }: ContestListProps) {
  if (contests.length === 0) {
    return <p className="text-gray-400 text-center py-8">No contests yet. Create one!</p>
  }

  return (
    <div className="space-y-4">
      {contests.map((contest) => (
        <div
          key={contest.id}
          className="bg-gray-800/60 border border-gray-700 rounded-lg p-4 hover:border-cyan-700 transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-white">{contest.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-bold ${STATUS_COLORS[contest.status]}`}>
                  {contest.status.toUpperCase()}
                </span>
              </div>
              <p className="text-cyan-400 text-xs font-mono mb-2">/contests/{contest.slug}</p>
              <p className="text-gray-400 text-sm mb-2">{contest.description}</p>
              <div className="text-sm text-gray-500 font-mono">
                <span>{new Date(contest.start_date).toLocaleString()}</span>
                <span className="mx-2">→</span>
                <span>{new Date(contest.end_date).toLocaleString()}</span>
              </div>
              <div className="text-xs text-cyan-300/90 font-mono mt-1">
                Official ({contest.contest_timezone || 'UTC'}): {formatDateInTimeZone(contest.start_date, contest.contest_timezone || 'UTC')} → {formatDateInTimeZone(contest.end_date, contest.contest_timezone || 'UTC')}
              </div>
              {contest.prize_pool && (
                <div className="mt-2 text-xs text-yellow-400">
                  Prizes: {Object.keys(contest.prize_pool).length} ranks
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(contest)}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-all"
                title="Edit"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(contest.id)}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-all"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
