'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAllContests, getCurrentUser, type Contest } from '@/lib/api/backend'
import { checkIsAdmin, createContest, updateContest, deleteContest, updateContestStatuses, type CreateContestData } from '@/lib/api/admin'
import { getSupportedTimeZones } from '@/lib/utils/timezone'
import { ContestForm } from '@/components/admin/ContestForm'
import { ContestList } from '@/components/admin/ContestList'
import { WithdrawalsTab } from '@/components/admin/WithdrawalsTab'
import { HourlyChallengeTab } from '@/components/admin/HourlyChallengeTab'
import { SponsorsTab } from '@/components/admin/SponsorsTab'
import { Shield, Plus, RefreshCw } from 'lucide-react'
import { PageWrapper } from '@/components/PageWrapper'
import Link from 'next/link'

const DEFAULT_FORM: CreateContestData = {
  name: '',
  description: '',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  contestTimezone: 'UTC',
  status: 'upcoming',
  prizePool: {},
  maxEntriesPerUser: 999,
}

const DEFAULT_PRIZE_ENTRIES = [
  { rank: '1', prize: '' },
  { rank: '2', prize: '' },
  { rank: '3', prize: '' },
]

export default function AdminPage() {
  const router = useRouter()
  const supportedTimeZones = useMemo(() => getSupportedTimeZones(), [])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'contests' | 'withdrawals' | 'hourly' | 'sponsors'>('contests')
  const [contests, setContests] = useState<Contest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateContestData>(DEFAULT_FORM)
  const [prizeEntries, setPrizeEntries] = useState(DEFAULT_PRIZE_ENTRIES)

  useEffect(() => { checkAdmin() }, [])

  const loadContests = async () => {
    try {
      setContests(await getAllContests())
    } catch { /* silently fail */ }
  }

  const checkAdmin = async () => {
    setLoading(true)
    try {
      const user = await getCurrentUser()
      if (!user) { router.push('/'); return }
      const adminCheck = await checkIsAdmin()
      if (!adminCheck) { alert('Access denied. Admin privileges required.'); router.push('/'); return }
      setIsAdmin(true)
      await loadContests()
    } catch {
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData(DEFAULT_FORM)
    setPrizeEntries(DEFAULT_PRIZE_ENTRIES)
  }

  const convertPrizeEntriesToObject = () => {
    const pool: Record<string, string> = {}
    prizeEntries.forEach(({ rank, prize }) => {
      if (rank.trim() && prize.trim()) pool[rank.trim()] = prize.trim()
    })
    return pool
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = { ...formData, prizePool: convertPrizeEntriesToObject() }
      if (editingId) { await updateContest(editingId, data) } else { await createContest(data) }
      alert(editingId ? 'Contest updated!' : 'Contest created!')
      setShowForm(false)
      setEditingId(null)
      resetForm()
      await loadContests()
    } catch (error: any) {
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
      maxEntriesPerUser: contest.max_entries_per_user,
    })
    const entries = contest.prize_pool && Object.keys(contest.prize_pool).length > 0
      ? Object.entries(contest.prize_pool).map(([rank, prize]) => ({ rank, prize: prize as string }))
      : DEFAULT_PRIZE_ENTRIES
    setPrizeEntries(entries)
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

  const handleUpdateStatuses = async () => {
    if (!confirm('This will start upcoming contests and finish expired contests. Continue?')) return
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
      <PageWrapper className="bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent" />
          <p className="text-gray-400 mt-4 font-mono">Checking admin access...</p>
        </div>
      </PageWrapper>
    )
  }

  if (!isAdmin) return null

  return (
    <PageWrapper className="bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <div className="text-center mb-6">
          <Link href="/">
            <img src="/logo.png" alt="Byte Runner" className="h-16 sm:h-20 w-auto mx-auto drop-shadow-[0_0_30px_rgba(0,255,255,0.85)] cursor-pointer hover:scale-105 transition-transform" />
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-cyan-400" />
          <h1 className="text-4xl font-bold text-cyan-400">Admin Panel</h1>
        </div>

        <div className="flex gap-2 mb-8 border-b border-gray-700">
          {(['contests', 'withdrawals', 'hourly', 'sponsors'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-bold transition-all border-b-2 capitalize ${
                activeTab === tab ? 'text-cyan-400 border-cyan-400' : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
            >
              {tab === 'hourly' ? 'Hourly Challenges' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'contests' && (
          <>
            {!showForm && (
              <div className="mb-6 flex gap-3">
                <button onClick={() => { setShowForm(true); setEditingId(null); resetForm() }} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Create New Contest
                </button>
                <button onClick={handleUpdateStatuses} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2" title="Start upcoming contests and finish expired contests">
                  <RefreshCw className="w-5 h-5" /> Update Contest Statuses
                </button>
              </div>
            )}

            {showForm && (
              <ContestForm
                formData={formData}
                prizeEntries={prizeEntries}
                editingId={editingId}
                supportedTimeZones={supportedTimeZones}
                onFormDataChange={setFormData}
                onPrizeEntriesChange={setPrizeEntries}
                onSubmit={handleSubmit}
                onCancel={() => { setShowForm(false); setEditingId(null); resetForm() }}
              />
            )}

            <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">All Contests ({contests.length})</h2>
              <ContestList contests={contests} onEdit={handleEdit} onDelete={handleDelete} />
            </div>

            <div className="mt-8 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
              <h3 className="text-blue-400 font-bold mb-2">💡 Quick Tips:</h3>
              <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
                <li>Set status to "active" for contests to appear in-game</li>
                <li>Prize pool uses JSON format: {`{"1": "$500", "2-5": "$50 each"}`}</li>
                <li>Users auto-enter when they save runs during active contests</li>
                <li>Visit contest page to see leaderboard: /contests/[id]</li>
              </ul>
            </div>
          </>
        )}

        {activeTab === 'withdrawals' && <WithdrawalsTab />}
        {activeTab === 'hourly' && <HourlyChallengeTab />}
        {activeTab === 'sponsors' && <SponsorsTab />}
      </div>
    </PageWrapper>
  )
}
