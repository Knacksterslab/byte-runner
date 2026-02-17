'use client'

import { useState } from 'react'
import { X, Gift, Wallet, DollarSign } from 'lucide-react'
import { submitWithdrawal } from '@/lib/api/backend'

interface WithdrawalModalProps {
  currentBalance: number // in cents
  onClose: () => void
  onSuccess: () => void
}

export default function WithdrawalModal({
  currentBalance,
  onClose,
  onSuccess
}: WithdrawalModalProps) {
  const [step, setStep] = useState<'method' | 'usdt'>('method')
  const [paymentMethod, setPaymentMethod] = useState<'app_store' | 'google_play' | 'usdt'>('app_store')
  const [email, setEmail] = useState('')
  const [withdrawalAmount, setWithdrawalAmount] = useState('')
  const [usdtWallet, setUsdtWallet] = useState('')
  const [usdtNetwork, setUsdtNetwork] = useState<'trc20' | 'erc20'>('trc20')
  const [confirmedEmail, setConfirmedEmail] = useState(false)
  const [confirmedWallet, setConfirmedWallet] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const balanceDollars = currentBalance / 100
  const withdrawalAmountCents = Math.round(parseFloat(withdrawalAmount || '0') * 100)

  const handleMethodSubmit = () => {
    // Validate amount
    if (!withdrawalAmount || parseFloat(withdrawalAmount) < 10) {
      setError('Minimum withdrawal is $10.00')
      return
    }

    if (withdrawalAmountCents > currentBalance) {
      setError(`Insufficient balance. You have $${balanceDollars.toFixed(2)}`)
      return
    }

    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    setError('')

    if (paymentMethod === 'usdt') {
      setStep('usdt')
    } else {
      handleFinalSubmit()
    }
  }

  const handleFinalSubmit = async () => {
    setError('')
    setSubmitting(true)

    try {
      const contactInfo: any = {
        email: email.trim()
      }

      if (paymentMethod === 'usdt') {
        if (!usdtWallet.trim()) {
          setError('Please enter your USDT wallet address')
          setSubmitting(false)
          return
        }
        contactInfo.usdtWallet = usdtWallet.trim()
        contactInfo.usdtNetwork = usdtNetwork
      }

      await submitWithdrawal(withdrawalAmountCents, paymentMethod, contactInfo)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to submit withdrawal')
    } finally {
      setSubmitting(false)
    }
  }

  const resetAndClose = () => {
    setStep('method')
    setPaymentMethod('app_store')
    setEmail('')
    setWithdrawalAmount('')
    setUsdtWallet('')
    setUsdtNetwork('trc20')
    setConfirmedEmail(false)
    setConfirmedWallet(false)
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-green-500/50 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,255,0,0.3)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Withdraw Funds
          </h2>
          <button
            onClick={resetAndClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Balance Info */}
        <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-600/50 rounded-lg p-4 mb-6">
          <div className="text-green-300 text-sm mb-1">Available Balance</div>
          <div className="text-white text-3xl font-bold">${balanceDollars.toFixed(2)}</div>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-500 text-red-200 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Amount and Method Selection */}
        {step === 'method' && (
          <div className="space-y-4">
            {/* Withdrawal Amount */}
            <div>
              <label className="block text-sm text-gray-300 mb-2 font-semibold">
                Withdrawal Amount (USD):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="10"
                  max={balanceDollars}
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-4 py-3 text-white text-lg focus:border-green-500 focus:outline-none"
                  placeholder="10.00"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Minimum: $10.00</span>
                <span>Maximum: ${balanceDollars.toFixed(2)}</span>
              </div>
              <button
                onClick={() => setWithdrawalAmount(balanceDollars.toFixed(2))}
                className="text-xs text-cyan-400 hover:text-cyan-300 underline mt-1"
              >
                Withdraw full balance
              </button>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm text-gray-300 mb-3 font-semibold">
                Choose how to receive your payment:
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg cursor-pointer hover:border-green-500/50 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="app_store"
                    checked={paymentMethod === 'app_store'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-4 h-4 text-green-500"
                  />
                  <Gift className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-white font-medium">App Store Gift Card</div>
                    <div className="text-gray-400 text-xs">Email delivery</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg cursor-pointer hover:border-green-500/50 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="google_play"
                    checked={paymentMethod === 'google_play'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-4 h-4 text-green-500"
                  />
                  <Gift className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-white font-medium">Google Play Gift Card</div>
                    <div className="text-gray-400 text-xs">Email delivery</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg cursor-pointer hover:border-green-500/50 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="usdt"
                    checked={paymentMethod === 'usdt'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-4 h-4 text-green-500"
                  />
                  <Wallet className="w-5 h-5 text-green-400" />
                  <div className="flex-1">
                    <div className="text-white font-medium">USDT (Crypto)</div>
                    <div className="text-gray-400 text-xs">Wallet transfer</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                {paymentMethod === 'usdt' ? 'Confirmation Email:' : 'Delivery Email:'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none"
                placeholder="your@email.com"
              />
              <label className="flex items-center gap-2 mt-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={confirmedEmail}
                  onChange={(e) => setConfirmedEmail(e.target.checked)}
                  className="w-4 h-4 text-green-500"
                />
                This email is correct
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={resetAndClose}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMethodSubmit}
                disabled={!confirmedEmail || submitting}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
              >
                {submitting ? 'Processing...' : 'Continue →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: USDT Wallet Details */}
        {step === 'usdt' && (
          <div className="space-y-4">
            <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-3 mb-4">
              <div className="text-green-300 text-sm">Withdrawal Amount:</div>
              <div className="text-white text-2xl font-bold">${parseFloat(withdrawalAmount).toFixed(2)}</div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2 font-semibold">
                USDT Wallet Address:
              </label>
              <input
                type="text"
                value={usdtWallet}
                onChange={(e) => setUsdtWallet(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none font-mono text-sm"
                placeholder="TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2 font-semibold">
                Network:
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg cursor-pointer hover:border-green-500/50 transition-colors">
                  <input
                    type="radio"
                    name="network"
                    value="trc20"
                    checked={usdtNetwork === 'trc20'}
                    onChange={(e) => setUsdtNetwork(e.target.value as any)}
                    className="w-4 h-4 text-green-500"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium">Tron (TRC20)</div>
                    <div className="text-green-400 text-xs">✓ Recommended - Low fees (~$1)</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg cursor-pointer hover:border-green-500/50 transition-colors">
                  <input
                    type="radio"
                    name="network"
                    value="erc20"
                    checked={usdtNetwork === 'erc20'}
                    onChange={(e) => setUsdtNetwork(e.target.value as any)}
                    className="w-4 h-4 text-green-500"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium">Ethereum (ERC20)</div>
                    <div className="text-yellow-400 text-xs">⚠️ Higher fees ($5-50)</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-3">
              <div className="text-red-400 text-sm font-semibold mb-1">⚠️ Important:</div>
              <div className="text-gray-300 text-xs">
                Double-check your wallet address! We cannot recover funds sent to the wrong address.
              </div>
            </div>

            {/* Confirmation */}
            <label className="flex items-start gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={confirmedWallet}
                onChange={(e) => setConfirmedWallet(e.target.checked)}
                className="w-4 h-4 text-green-500 mt-1"
              />
              <span>I have verified this wallet address is correct and matches the selected network</span>
            </label>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('method')}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={!confirmedWallet || !usdtWallet.trim() || submitting}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
              >
                {submitting ? 'Processing...' : 'Submit Withdrawal'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
