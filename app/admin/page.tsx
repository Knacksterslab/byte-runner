'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAllContests, getCurrentUser, type Contest } from '@/lib/api/backend'
import { checkIsAdmin, createContest, updateContest, deleteContest, updateContestStatuses, type CreateContestData } from '@/lib/api/admin'
import { Shield, Plus, Edit, Trash2, Save, X, RefreshCw } from 'lucide-react'

const FALLBACK_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
]

const getSupportedTimeZones = (): string[] => {
  try {
    const supportedValuesOf = (Intl as any).supportedValuesOf
    if (typeof supportedValuesOf === 'function') {
      return supportedValuesOf('timeZone')
    }
  } catch {
    // Fallback below
  }
  return FALLBACK_TIMEZONES
}

const toPartsInTimeZone = (date: Date, timeZone: string) => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    hour12: false,
  })
  const parts = formatter.formatToParts(date)
  const pick = (type: string) => parts.find((part) => part.type === type)?.value || '00'
  return {
    year: Number(pick('year')),
    month: Number(pick('month')),
    day: Number(pick('day')),
    hour: Number(pick('hour')),
    minute: Number(pick('minute')),
    second: Number(pick('second')),
  }
}

const zonedDateTimeToIso = (datetimeLocal: string, timeZone: string): string => {
  if (!datetimeLocal) return ''
  const [datePart, timePart = '00:00'] = datetimeLocal.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)
  const targetUtcMillis = Date.UTC(year, month - 1, day, hour, minute, 0)

  let guessUtcMillis = targetUtcMillis
  for (let i = 0; i < 4; i += 1) {
    const guessParts = toPartsInTimeZone(new Date(guessUtcMillis), timeZone)
    const guessAsUtcMillis = Date.UTC(
      guessParts.year,
      guessParts.month - 1,
      guessParts.day,
      guessParts.hour,
      guessParts.minute,
      guessParts.second,
    )
    guessUtcMillis += targetUtcMillis - guessAsUtcMillis
  }

  return new Date(guessUtcMillis).toISOString()
}

const isoToDatetimeLocalInZone = (isoString: string, timeZone: string): string => {
  if (!isoString) return ''
  const parts = toPartsInTimeZone(new Date(isoString), timeZone)
  return `${parts.year.toString().padStart(4, '0')}-${parts.month.toString().padStart(2, '0')}-${parts.day.toString().padStart(2, '0')}T${parts.hour.toString().padStart(2, '0')}:${parts.minute.toString().padStart(2, '0')}`
}

const formatDateInTimeZone = (isoString: string, timeZone: string): string => {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(isoString))
}

export default function AdminPage() {
  const router = useRouter()
  const supportedTimeZones = useMemo(() => getSupportedTimeZones(), [])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [contests, setContests] = useState<Contest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateContestData>({
    name: '',
    description: '',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    contestTimezone: 'UTC',
    status: 'upcoming',
    prizePool: {},
    maxEntriesPerUser: 999
  })
  const [prizeEntries, setPrizeEntries] = useState<Array<{ rank: string; prize: string }>>([
    { rank: '1', prize: '' },
    { rank: '2', prize: '' },
    { rank: '3', prize: '' }
  ])

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    setLoading(true)
    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/')
        return
      }

      const adminCheck = await checkIsAdmin()
      if (!adminCheck) {
        alert('Access denied. Admin privileges required.')
        router.push('/')
        return
      }

      setIsAdmin(true)
      await loadContests()
    } catch (error) {
      console.error('Admin check failed:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const loadContests = async () => {
    try {
      const data = await getAllContests()
      setContests(data)
    } catch (error) {
      console.error('Failed to load contests:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const dataToSubmit = {
        ...formData,
        prizePool: convertPrizeEntriesToObject()
      }
      
      console.log('📤 Submitting contest data:', dataToSubmit)
      
      if (editingId) {
        await updateContest(editingId, dataToSubmit)
      } else {
        await createContest(dataToSubmit)
      }
      
      alert(editingId ? 'Contest updated!' : 'Contest created!')
      setShowForm(false)
      setEditingId(null)
      resetForm()
      await loadContests()
    } catch (error: any) {
      console.error('❌ Contest submit error:', error)
      alert(error.message || error.toString() || 'Failed to save contest')
    }
  }

  const handleEdit = (contest: Contest) => {
    setEditingId(contest.id)
    setFormData({
      name: contest.name,
      slug: contest.slug,
      description: contest.description || '',
      startDate: contest.start_date,
      endDate: contest.end_date,
      contestTimezone: contest.contest_timezone || 'UTC',
      status: contest.status,
      prizePool: contest.prize_pool || {},
      rules: contest.rules || {},
      maxEntriesPerUser: contest.max_entries_per_user
    })
    
    // Convert prize pool object to array format
    if (contest.prize_pool && Object.keys(contest.prize_pool).length > 0) {
      const entries = Object.entries(contest.prize_pool).map(([rank, prize]) => ({
        rank,
        prize: prize as string
      }))
      setPrizeEntries(entries)
    } else {
      setPrizeEntries([{ rank: '1', prize: '' }, { rank: '2', prize: '' }, { rank: '3', prize: '' }])
    }
    
    setShowForm(true)
  }

  const handleDelete = async (contestId: string) => {
    if (!confirm('Delete this contest? This cannot be undone!')) return
    
    try {
      await deleteContest(contestId)
      alert('Contest deleted!')
      await loadContests()
    } catch (error: any) {
      alert(error.message || 'Failed to delete contest')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      contestTimezone: 'UTC',
      status: 'upcoming',
      prizePool: {},
      maxEntriesPerUser: 999
    })
    setPrizeEntries([
      { rank: '1', prize: '' },
      { rank: '2', prize: '' },
      { rank: '3', prize: '' }
    ])
  }

  const convertPrizeEntriesToObject = () => {
    const prizePool: Record<string, string> = {}
    prizeEntries.forEach(entry => {
      if (entry.rank.trim() && entry.prize.trim()) {
        prizePool[entry.rank.trim()] = entry.prize.trim()
      }
    })
    return prizePool
  }

  const addPrizeEntry = () => {
    setPrizeEntries([...prizeEntries, { rank: '', prize: '' }])
  }

  const removePrizeEntry = (index: number) => {
    setPrizeEntries(prizeEntries.filter((_, i) => i !== index))
  }

  const updatePrizeEntry = (index: number, field: 'rank' | 'prize', value: string) => {
    const updated = [...prizeEntries]
    updated[index][field] = value
    setPrizeEntries(updated)
  }

  const handleUpdateStatuses = async () => {
    if (!confirm('This will start upcoming contests and finish expired contests. Continue?')) {
      return
    }
    
    try {
      await updateContestStatuses()
      alert('Contest statuses updated! Check the logs.')
      await loadContests()
    } catch (error: any) {
      alert(error.message || 'Failed to update contest statuses')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent"></div>
          <p className="text-gray-400 mt-4 font-mono">Checking admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-cyan-400" />
          <h1 className="text-4xl font-bold text-cyan-400">Admin Panel</h1>
        </div>

        {/* Action Buttons */}
        {!showForm && (
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => {
                setShowForm(true)
                setEditingId(null)
                resetForm()
              }}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Contest
            </button>
            <button
              onClick={handleUpdateStatuses}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
              title="Start upcoming contests and finish expired contests"
            >
              <RefreshCw className="w-5 h-5" />
              Update Contest Statuses
            </button>
          </div>
        )}

        {/* Contest Form */}
        {showForm && (
          <div className="bg-gray-900 border-2 border-cyan-700 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-cyan-400">
                {editingId ? 'Edit Contest' : 'Create Contest'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  resetForm()
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">Contest Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const newName = e.target.value
                    const autoSlug = newName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
                    setFormData({ ...formData, name: newName, slug: formData.slug || autoSlug })
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="Launch Week Championship"
                />
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">
                  URL Slug (leave empty to auto-generate)
                </label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none font-mono text-sm"
                  placeholder="launch-week-championship"
                  pattern="[a-z0-9-]+"
                  title="Only lowercase letters, numbers, and hyphens allowed"
                />
                {formData.slug && (
                  <p className="text-xs text-cyan-400 mt-1 font-mono">
                    URL: /contests/{formData.slug}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  rows={3}
                  placeholder="Compete for prizes..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-mono text-gray-300 mb-2">Start Date *</label>
                  <input
                    type="datetime-local"
                    required
                    value={isoToDatetimeLocalInZone(formData.startDate, formData.contestTimezone || 'UTC')}
                    onChange={(e) => setFormData({ ...formData, startDate: zonedDateTimeToIso(e.target.value, formData.contestTimezone || 'UTC') })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-gray-300 mb-2">End Date *</label>
                  <input
                    type="datetime-local"
                    required
                    value={isoToDatetimeLocalInZone(formData.endDate, formData.contestTimezone || 'UTC')}
                    onChange={(e) => setFormData({ ...formData, endDate: zonedDateTimeToIso(e.target.value, formData.contestTimezone || 'UTC') })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">Contest Timezone *</label>
                <select
                  value={formData.contestTimezone || 'UTC'}
                  onChange={(e) => setFormData({ ...formData, contestTimezone: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                >
                  {supportedTimeZones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Start/end inputs are interpreted in this timezone and stored in UTC.
                </p>
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="ended">Ended</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-mono text-gray-300">
                    Prize Pool
                  </label>
                  <button
                    type="button"
                    onClick={addPrizeEntry}
                    className="text-sm bg-gray-700 hover:bg-gray-600 text-cyan-300 px-3 py-1 rounded transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Prize
                  </button>
                </div>
                <div className="space-y-2">
                  {prizeEntries.map((entry, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={entry.rank}
                        onChange={(e) => updatePrizeEntry(index, 'rank', e.target.value)}
                        className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none text-sm"
                        placeholder="1 or 1-3"
                      />
                      <input
                        type="text"
                        value={entry.prize}
                        onChange={(e) => updatePrizeEntry(index, 'prize', e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none text-sm"
                        placeholder="e.g., $500, Badge + $100"
                      />
                      <button
                        type="button"
                        onClick={() => removePrizeEntry(index)}
                        className="text-red-400 hover:text-red-300 p-2 transition-colors"
                        disabled={prizeEntries.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Rank examples: "1" for first place, "2-5" for ranks 2 through 5, "6-10" for 6th to 10th
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingId ? 'Update Contest' : 'Create Contest'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    resetForm()
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Contests List */}
        <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">All Contests ({contests.length})</h2>
          
          {contests.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No contests yet. Create one!</p>
          ) : (
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
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          contest.status === 'active' ? 'bg-green-600' :
                          contest.status === 'upcoming' ? 'bg-blue-600' :
                          contest.status === 'ended' ? 'bg-gray-600' :
                          'bg-red-600'
                        }`}>
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
                        onClick={() => handleEdit(contest)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-all"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(contest.id)}
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
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
          <h3 className="text-blue-400 font-bold mb-2">💡 Quick Tips:</h3>
          <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
            <li>Set status to "active" for contests to appear in-game</li>
            <li>Prize pool uses JSON format: {`{"1": "$500", "2-5": "$50 each"}`}</li>
            <li>Users auto-enter when they save runs during active contests</li>
            <li>Visit contest page to see leaderboard: /contests/[id]</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
