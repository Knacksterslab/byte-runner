'use client'

import { useEffect, useState } from 'react'
import { adminGetAllWithdrawals, adminUpdateWithdrawal } from '@/lib/api/admin'
import type { Withdrawal } from '@/lib/api/types'
import { CheckCircle, XCircle, Clock, DollarSign, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'

const METHOD_LABELS: Record<string, string> = {
  amazon_gift_card: '🛍 Amazon Gift Card',
  app_store: '🍎 App Store Gift Card',
  google_play: '▶ Google Play Gift Card',
  usdt: '🔷 USDT (TRC20)',
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'text-yellow-400 bg-yellow-900/30 border-yellow-700', icon: <Clock className="w-3 h-3" /> },
  approved: { label: 'Approved', color: 'text-blue-400 bg-blue-900/30 border-blue-700', icon: <CheckCircle className="w-3 h-3" /> },
  paid: { label: 'Paid', color: 'text-green-400 bg-green-900/30 border-green-700', icon: <CheckCircle className="w-3 h-3" /> },
  rejected: { label: 'Rejected', color: 'text-red-400 bg-red-900/30 border-red-700', icon: <XCircle className="w-3 h-3" /> },
  failed: { label: 'Failed', color: 'text-orange-400 bg-orange-900/30 border-orange-700', icon: <AlertCircle className="w-3 h-3" /> },
}

const FILTER_TABS = ['all', 'pending', 'approved', 'paid', 'rejected'] as const
type FilterTab = typeof FILTER_TABS[number]


export function WithdrawalsTab() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<FilterTab>('pending')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionState, setActionState] = useState<Record<string, { loading: boolean; error: string }>>({})

  // Modal state for "Mark as Paid"
  const [paidModal, setPaidModal] = useState<{ withdrawalId: string; amount: number; method: string } | null>(null)
  const [paymentDetails, setPaymentDetails] = useState('')
  const [paidNotes, setPaidNotes] = useState('')

  // Modal state for "Reject"
  const [rejectModal, setRejectModal] = useState<{ withdrawalId: string; amount: number } | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const statusParam = filter === 'all' ? undefined : filter
      const res = await adminGetAllWithdrawals(statusParam)
      setWithdrawals(res.withdrawals)
    } catch (err: any) {
      setError(err.message || 'Failed to load withdrawals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const setAction = (id: string, loading: boolean, err = '') =>
    setActionState((prev) => ({ ...prev, [id]: { loading, error: err } }))

  const handleApprove = async (w: Withdrawal) => {
    if (!confirm(`Approve $${(w.amountCents / 100).toFixed(2)} withdrawal?`)) return
    setAction(w.id, true)
    try {
      await adminUpdateWithdrawal(w.id, { status: 'approved' })
      await load()
    } catch (err: any) {
      setAction(w.id, false, err.message)
    }
    setAction(w.id, false)
  }

  const handleMarkPaid = async () => {
    if (!paidModal) return
    if (!paymentDetails.trim()) { alert('Please enter payment details (e.g. gift card code or TX link)'); return }
    setAction(paidModal.withdrawalId, true)
    try {
      await adminUpdateWithdrawal(paidModal.withdrawalId, {
        status: 'paid',
        paymentDetails: paymentDetails.trim(),
        notes: paidNotes.trim() || undefined,
      })
      setPaidModal(null)
      setPaymentDetails('')
      setPaidNotes('')
      await load()
    } catch (err: any) {
      setAction(paidModal.withdrawalId, false, err.message)
    }
    setAction(paidModal.withdrawalId, false)
  }

  const handleReject = async () => {
    if (!rejectModal) return
    if (!rejectReason.trim()) { alert('Please provide a reason for rejection'); return }
    setAction(rejectModal.withdrawalId, true)
    try {
      await adminUpdateWithdrawal(rejectModal.withdrawalId, {
        status: 'rejected',
        notes: rejectReason.trim(),
      })
      setRejectModal(null)
      setRejectReason('')
      await load()
    } catch (err: any) {
      setAction(rejectModal.withdrawalId, false, err.message)
    }
    setAction(rejectModal.withdrawalId, false)
  }

  const counts = FILTER_TABS.reduce((acc, tab) => {
    acc[tab] = tab === 'all' ? withdrawals.length : withdrawals.filter((w) => w.status === tab).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
          <DollarSign className="w-6 h-6" /> Withdrawal Requests
        </h2>
        <button
          onClick={load}
          className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg px-3 py-1.5 transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap border-b border-gray-700 pb-0">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm font-semibold capitalize border-b-2 transition-all ${
              filter === tab
                ? 'text-green-400 border-green-400'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            {tab} {filter !== tab && counts[tab] > 0 && (
              <span className="ml-1 text-xs bg-gray-700 text-gray-300 rounded-full px-1.5 py-0.5">{counts[tab]}</span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg p-3 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading withdrawals...</div>
      ) : withdrawals.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No {filter === 'all' ? '' : filter} withdrawals.</div>
      ) : (
        <div className="space-y-3">
          {withdrawals.map((w) => {
            const cfg = STATUS_CONFIG[w.status] ?? STATUS_CONFIG.pending
            const expanded = expandedId === w.id
            const act = actionState[w.id]
            const amount = (w.amountCents / 100).toFixed(2)
            const method = METHOD_LABELS[w.paymentMethod] ?? w.paymentMethod
            const ci = w.contactInfo ?? {}

            return (
              <div key={w.id} className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
                {/* Row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
                  onClick={() => setExpandedId(expanded ? null : w.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-white font-bold text-lg">${amount}</span>
                      <span className="text-gray-400 text-sm">{method}</span>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-semibold ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      {ci.email && <span className="mr-3">{ci.email}</span>}
                      {new Date(w.submittedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-gray-600">
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded detail panel */}
                {expanded && (
                  <div className="border-t border-gray-700 p-4 space-y-4 bg-gray-950/50">
                    {/* Contact info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {ci.email && (
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Delivery Email</div>
                          <div className="text-white font-mono">{ci.email}</div>
                        </div>
                      )}
                      {ci.tron_address && (
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Tron Address (TRC20)</div>
                          <div className="text-white font-mono text-xs break-all">{ci.tron_address}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Withdrawal ID</div>
                        <div className="text-gray-400 font-mono text-xs">{w.id}</div>
                      </div>
                      {w.reviewedBy && (
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Reviewed By</div>
                          <div className="text-gray-400 text-xs">{w.reviewedBy} · {w.reviewedAt ? new Date(w.reviewedAt).toLocaleString() : ''}</div>
                        </div>
                      )}
                    </div>

                    {/* Notes / payment details */}
                    {w.notes && (
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="text-gray-500 text-xs mb-1">Admin Notes</div>
                        <div className="text-gray-300 text-sm">{w.notes}</div>
                      </div>
                    )}
                    {w.paymentDetails && (
                      <div className="bg-green-900/20 border border-green-800 rounded-lg p-3">
                        <div className="text-green-400 text-xs font-semibold mb-1">Payment Details (sent to user)</div>
                        <div className="text-white text-sm font-mono break-all">{w.paymentDetails}</div>
                      </div>
                    )}
                    {w.transactionId && (
                      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3">
                        <div className="text-blue-400 text-xs font-semibold mb-1">Transaction ID</div>
                        <div className="text-white text-sm font-mono break-all">{w.transactionId}</div>
                      </div>
                    )}

                    {act?.error && (
                      <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg p-3">{act.error}</div>
                    )}

                    {/* Action buttons */}
                    {w.status === 'pending' && (
                      <div className="flex gap-3 flex-wrap">
                        <button
                          onClick={() => handleApprove(w)}
                          disabled={act?.loading}
                          className="bg-blue-700 hover:bg-blue-600 disabled:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          {act?.loading ? 'Processing...' : '✓ Approve'}
                        </button>
                        <button
                          onClick={() => { setRejectModal({ withdrawalId: w.id, amount: w.amountCents }); setRejectReason('') }}
                          disabled={act?.loading}
                          className="bg-red-900 hover:bg-red-700 disabled:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                    {w.status === 'approved' && (
                      <div className="flex gap-3 flex-wrap">
                        <button
                          onClick={() => {
                            setPaidModal({ withdrawalId: w.id, amount: w.amountCents, method: w.paymentMethod })
                            setPaymentDetails('')
                            setPaidNotes('')
                          }}
                          disabled={act?.loading}
                          className="bg-green-700 hover:bg-green-600 disabled:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          {act?.loading ? 'Processing...' : '💸 Mark as Paid'}
                        </button>
                        <button
                          onClick={() => { setRejectModal({ withdrawalId: w.id, amount: w.amountCents }); setRejectReason('') }}
                          disabled={act?.loading}
                          className="bg-red-900 hover:bg-red-700 disabled:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Mark as Paid modal */}
      {paidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-gray-900 border-2 border-green-600/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-green-400 mb-1">Mark as Paid</h3>
            <p className="text-gray-400 text-sm mb-4">
              ${(paidModal.amount / 100).toFixed(2)} via {METHOD_LABELS[paidModal.method] ?? paidModal.method}
            </p>

            <label className="block text-sm text-gray-300 mb-1 font-semibold">
              Payment Details <span className="text-red-400">*</span>
            </label>
            <textarea
              value={paymentDetails}
              onChange={(e) => setPaymentDetails(e.target.value)}
              rows={3}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm font-mono focus:border-green-500 focus:outline-none mb-1 resize-none"
              placeholder={
                paidModal.method === 'usdt'
                  ? 'https://tronscan.org/#/transaction/...'
                  : 'Gift card code: XXXX-XXXX-XXXX-XXXX'
              }
            />
            <p className="text-gray-500 text-xs mb-4">This will be included in the email sent to the user.</p>

            <label className="block text-sm text-gray-300 mb-1 font-semibold">Internal Notes (optional)</label>
            <input
              type="text"
              value={paidNotes}
              onChange={(e) => setPaidNotes(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-green-500 focus:outline-none mb-6"
              placeholder="e.g. Amazon order #123"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setPaidModal(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkPaid}
                className="flex-1 bg-green-700 hover:bg-green-600 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
              >
                Confirm Paid & Notify User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-gray-900 border-2 border-red-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-red-400 mb-1">Reject Withdrawal</h3>
            <p className="text-gray-400 text-sm mb-4">
              ${(rejectModal.amount / 100).toFixed(2)} — The user's balance will be restored.
            </p>

            <label className="block text-sm text-gray-300 mb-1 font-semibold">
              Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-red-500 focus:outline-none mb-6 resize-none"
              placeholder="e.g. Invalid wallet address, suspected fraud..."
            />

            <div className="flex gap-3">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 bg-red-800 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
              >
                Reject & Notify User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
