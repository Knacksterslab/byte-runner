'use client'

import { DollarSign, TrendingUp, TrendingDown, Clock } from 'lucide-react'
import type { BalanceInfo } from '@/lib/api/backend'

interface EarningsDashboardProps {
  balance: BalanceInfo
  onRequestWithdrawal: () => void
}

export function EarningsDashboard({ balance, onRequestWithdrawal }: EarningsDashboardProps) {
  const pct = Math.min(100, (balance.balanceCents / 1000) * 100)

  return (
    <div className="bg-gray-900/30 border-2 border-green-600 rounded-lg p-6 mb-8 backdrop-blur-sm">
      <h2 className="text-xl font-bold text-green-400 mb-6 flex items-center gap-2">
        <DollarSign className="w-5 h-5" />
        Earnings Dashboard
      </h2>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-600/50 rounded-lg p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-green-300 font-mono mb-1">CURRENT BALANCE</p>
            <p className="text-4xl font-bold text-white">${(balance.balanceCents / 100).toFixed(2)}</p>
          </div>
          <DollarSign className="w-12 h-12 text-green-400 opacity-50" />
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Progress to Withdrawal</span>
            <span>{Math.floor(pct)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {balance.balanceCents >= 1000
              ? '✓ Minimum reached! You can withdraw.'
              : `Need $${((1000 - balance.balanceCents) / 100).toFixed(2)} more (Minimum: $10.00)`}
          </p>
        </div>

        <button
          onClick={onRequestWithdrawal}
          disabled={balance.balanceCents < 1000}
          className={`w-full py-3 rounded-lg font-bold transition-all ${
            balance.balanceCents >= 1000
              ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {balance.balanceCents >= 1000 ? 'Withdraw Funds' : 'Withdrawal Unavailable'}
        </button>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Earned', value: balance.totalEarnedCents, color: 'text-green-400' },
          { label: 'Pending Withdrawals', value: balance.pendingWithdrawalsCents, color: 'text-yellow-400' },
          { label: 'Available', value: balance.balanceCents, color: 'text-white' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>${(value / 100).toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      {balance.recentTransactions.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Transactions
          </h3>
          <div className="space-y-2">
            {balance.recentTransactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between bg-gray-800/30 border border-gray-700 rounded p-3"
              >
                <div className="flex items-center gap-3">
                  {tx.amountCents > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <div>
                    <p className="text-sm text-white font-mono">{tx.description}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className={`font-bold ${tx.amountCents > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.amountCents > 0 ? '+' : ''}${(tx.amountCents / 100).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
        <p className="text-sm text-blue-300">
          <span className="font-bold">Coming Soon:</span> Partner deals - Sign up for premium services and earn more!
        </p>
      </div>
    </div>
  )
}
