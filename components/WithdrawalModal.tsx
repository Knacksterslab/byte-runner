'use client'

import { useState } from 'react'
import { X, DollarSign } from 'lucide-react'
import { submitWithdrawal } from '@/lib/api/backend'
import { PaymentMethodSelect, type PaymentMethod } from '@/components/payment/PaymentMethodSelect'
import { UsdtWalletStep } from '@/components/payment/UsdtWalletStep'

interface WithdrawalModalProps {
  currentBalance: number
  onClose: () => void
  onSuccess: () => void
}

const GIFT_CARD_METHODS: PaymentMethod[] = ['amazon_gift_card', 'app_store', 'google_play']

const STORE_REGIONS: { value: string; label: string }[] = [
  { value: 'US', label: '🇺🇸 United States' },
  { value: 'GB', label: '🇬🇧 United Kingdom' },
  { value: 'CA', label: '🇨🇦 Canada' },
  { value: 'AU', label: '🇦🇺 Australia' },
  { value: 'DE', label: '🇩🇪 Germany' },
  { value: 'FR', label: '🇫🇷 France' },
  { value: 'NG', label: '🇳🇬 Nigeria' },
  { value: 'IN', label: '🇮🇳 India' },
  { value: 'BR', label: '🇧🇷 Brazil' },
  { value: 'MX', label: '🇲🇽 Mexico' },
  { value: 'JP', label: '🇯🇵 Japan' },
  { value: 'SG', label: '🇸🇬 Singapore' },
  { value: 'AE', label: '🇦🇪 UAE' },
  { value: 'ZA', label: '🇿🇦 South Africa' },
]

export default function WithdrawalModal({ currentBalance, onClose, onSuccess }: WithdrawalModalProps) {
  const [step, setStep] = useState<'method' | 'usdt'>('method')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('amazon_gift_card')
  const [storeRegion, setStoreRegion] = useState('US')
  const [email, setEmail] = useState('')
  const [withdrawalAmount, setWithdrawalAmount] = useState('')
  const [usdtWallet, setUsdtWallet] = useState('')
  const [confirmedEmail, setConfirmedEmail] = useState(false)
  const [confirmedWallet, setConfirmedWallet] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isGiftCard = GIFT_CARD_METHODS.includes(paymentMethod)
  const balanceDollars = currentBalance / 100
  const withdrawalAmountCents = Math.round(parseFloat(withdrawalAmount || '0') * 100)

  const resetAndClose = () => {
    setStep('method')
    setPaymentMethod('amazon_gift_card')
    setStoreRegion('US')
    setEmail('')
    setWithdrawalAmount('')
    setUsdtWallet('')
    setConfirmedEmail(false)
    setConfirmedWallet(false)
    setError('')
    onClose()
  }

  const handleMethodSubmit = () => {
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
    if (paymentMethod === 'usdt') { setStep('usdt') } else { handleFinalSubmit() }
  }

  const handleFinalSubmit = async () => {
    setError('')
    setSubmitting(true)
    try {
      const contactInfo: any = { email: email.trim() }
      if (paymentMethod === 'usdt') {
        if (!usdtWallet.trim()) { setError('Please enter your USDT wallet address'); setSubmitting(false); return }
        contactInfo.tron_address = usdtWallet.trim()
        contactInfo.network = 'trc20'
      } else {
        contactInfo.store_region = storeRegion
      }
      await submitWithdrawal(withdrawalAmountCents, paymentMethod, contactInfo)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to submit withdrawal')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-green-500/50 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,255,0,0.3)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
            <DollarSign className="w-6 h-6" /> Withdraw Funds
          </h2>
          <button onClick={resetAndClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-600/50 rounded-lg p-4 mb-6">
          <div className="text-green-300 text-sm mb-1">Available Balance</div>
          <div className="text-white text-3xl font-bold">${balanceDollars.toFixed(2)}</div>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-500 text-red-200 rounded-lg p-3 mb-4 text-sm">{error}</div>
        )}

        {step === 'method' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2 font-semibold">Withdrawal Amount (USD):</label>
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
              <button onClick={() => setWithdrawalAmount(balanceDollars.toFixed(2))} className="text-xs text-cyan-400 hover:text-cyan-300 underline mt-1">
                Withdraw full balance
              </button>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-3 font-semibold">Choose how to receive your payment:</label>
              <PaymentMethodSelect
                value={paymentMethod}
                onChange={(m) => { setPaymentMethod(m); setStoreRegion('US') }}
                accentColor="green"
              />
            </div>

            {/* Country/region selector — only for gift card methods */}
            {isGiftCard && (
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-semibold">
                  Store Region / Country:
                </label>
                <select
                  value={storeRegion}
                  onChange={(e) => setStoreRegion(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-green-500 focus:outline-none appearance-none cursor-pointer"
                >
                  {STORE_REGIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <p className="text-xs text-yellow-400/80 mt-1.5">
                  ⚠️ Gift cards are region-locked. Make sure this matches your account country.
                </p>
              </div>
            )}

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
                <input type="checkbox" checked={confirmedEmail} onChange={(e) => setConfirmedEmail(e.target.checked)} className="w-4 h-4 text-green-500" />
                This email is correct
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={resetAndClose} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors">Cancel</button>
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

        {step === 'usdt' && (
          <>
            <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-3 mb-4">
              <div className="text-green-300 text-sm">Withdrawal Amount:</div>
              <div className="text-white text-2xl font-bold">${parseFloat(withdrawalAmount).toFixed(2)}</div>
            </div>
            <UsdtWalletStep
              wallet={usdtWallet}
              onWalletChange={setUsdtWallet}
              network="trc20"
              onNetworkChange={() => {}}
              confirmed={confirmedWallet}
              onConfirmedChange={setConfirmedWallet}
              submitting={submitting}
              onBack={() => setStep('method')}
              onSubmit={handleFinalSubmit}
              accentColor="green"
              submitLabel="Submit Withdrawal"
            />
          </>
        )}
      </div>
    </div>
  )
}
