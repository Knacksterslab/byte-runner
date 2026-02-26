'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { PaymentMethodSelect, type PaymentMethod } from '@/components/payment/PaymentMethodSelect'
import { UsdtWalletStep, type UsdtNetwork } from '@/components/payment/UsdtWalletStep'

interface PrizeClaimModalProps {
  isOpen: boolean
  onClose: () => void
  prize: string
  rank: number
  userEmail: string
  onSubmit: (claimData: {
    paymentMethod: PaymentMethod
    email: string
    usdtWallet?: string
    usdtNetwork?: UsdtNetwork
  }) => Promise<void>
}

export function PrizeClaimModal({ isOpen, onClose, prize, rank, userEmail, onSubmit }: PrizeClaimModalProps) {
  const [step, setStep] = useState<'method' | 'usdt'>('method')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('app_store')
  const [email, setEmail] = useState(userEmail)
  const [usdtWallet, setUsdtWallet] = useState('')
  const [usdtNetwork, setUsdtNetwork] = useState<UsdtNetwork>('trc20')
  const [confirmedEmail, setConfirmedEmail] = useState(false)
  const [confirmedWallet, setConfirmedWallet] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const resetAndClose = () => {
    setStep('method')
    setPaymentMethod('app_store')
    setEmail(userEmail)
    setUsdtWallet('')
    setUsdtNetwork('trc20')
    setConfirmedEmail(false)
    setConfirmedWallet(false)
    setError('')
    onClose()
  }

  const handleMethodSubmit = () => {
    if (paymentMethod === 'usdt') { setStep('usdt') } else { handleFinalSubmit() }
  }

  const handleFinalSubmit = async () => {
    setError('')
    setSubmitting(true)
    try {
      const claimData: any = { paymentMethod, email }
      if (paymentMethod === 'usdt') {
        if (!usdtWallet.trim()) { setError('Please enter your USDT wallet address'); setSubmitting(false); return }
        claimData.usdtWallet = usdtWallet.trim()
        claimData.usdtNetwork = usdtNetwork
      }
      await onSubmit(claimData)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to submit claim')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-cyan-500/50 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,255,255,0.3)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-cyan-400">🎉 Claim Your Prize!</h2>
          <button onClick={resetAndClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-600/50 rounded-lg p-4 mb-6">
          <div className="text-yellow-300 text-sm mb-1">Rank #{rank}</div>
          <div className="text-white text-2xl font-bold">{prize}</div>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-500 text-red-200 rounded-lg p-3 mb-4 text-sm">{error}</div>
        )}

        {step === 'method' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-3 font-semibold">Choose how to receive your prize:</label>
              <PaymentMethodSelect value={paymentMethod} onChange={setPaymentMethod} accentColor="cyan" />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                {paymentMethod === 'usdt' ? 'Confirmation Email:' : 'Delivery Email:'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                placeholder="your@email.com"
              />
              <label className="flex items-center gap-2 mt-2 text-sm text-gray-300">
                <input type="checkbox" checked={confirmedEmail} onChange={(e) => setConfirmedEmail(e.target.checked)} className="w-4 h-4 text-cyan-500" />
                This email is correct
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={resetAndClose} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors">Cancel</button>
              <button
                onClick={handleMethodSubmit}
                disabled={!confirmedEmail || submitting}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
              >
                {submitting ? 'Submitting...' : 'Continue →'}
              </button>
            </div>
          </div>
        )}

        {step === 'usdt' && (
          <UsdtWalletStep
            wallet={usdtWallet}
            onWalletChange={setUsdtWallet}
            network={usdtNetwork}
            onNetworkChange={setUsdtNetwork}
            confirmed={confirmedWallet}
            onConfirmedChange={setConfirmedWallet}
            submitting={submitting}
            onBack={() => setStep('method')}
            onSubmit={handleFinalSubmit}
            accentColor="cyan"
            submitLabel="Claim Prize 🎉"
          />
        )}
      </div>
    </div>
  )
}
