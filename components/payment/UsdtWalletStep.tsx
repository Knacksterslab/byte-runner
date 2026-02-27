export type UsdtNetwork = 'trc20'

interface UsdtWalletStepProps {
  wallet: string
  onWalletChange: (v: string) => void
  network: UsdtNetwork
  onNetworkChange: (v: UsdtNetwork) => void
  confirmed: boolean
  onConfirmedChange: (v: boolean) => void
  submitting: boolean
  onBack: () => void
  onSubmit: () => void
  accentColor?: 'green' | 'cyan'
  submitLabel?: string
}

export function UsdtWalletStep({
  wallet,
  onWalletChange,
  confirmed,
  onConfirmedChange,
  submitting,
  onBack,
  onSubmit,
  accentColor = 'green',
  submitLabel = 'Submit',
}: UsdtWalletStepProps) {
  const focusBorder = accentColor === 'green' ? 'focus:border-green-500' : 'focus:border-cyan-500'
  const radioColor = accentColor === 'green' ? 'text-green-500' : 'text-cyan-500'
  const btnGradient =
    accentColor === 'green'
      ? 'from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'
      : 'from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-300 mb-2 font-semibold">USDT Wallet Address (TRC20 / Tron):</label>
        <input
          type="text"
          value={wallet}
          onChange={(e) => onWalletChange(e.target.value)}
          className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white ${focusBorder} focus:outline-none font-mono text-sm`}
          placeholder="TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        />
      </div>

      <div className="bg-blue-900/20 border border-blue-600/40 rounded-lg p-3">
        <div className="text-blue-300 text-sm font-semibold mb-1">ℹ️ Network: Tron (TRC20)</div>
        <div className="text-gray-400 text-xs">
          We only support USDT on the Tron network (TRC20). Make sure your wallet supports TRC20.
          Your address should start with <span className="font-mono text-blue-300">T</span>.
        </div>
      </div>

      <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-3">
        <div className="text-red-400 text-sm font-semibold mb-1">⚠️ Important:</div>
        <div className="text-gray-300 text-xs">
          Double-check your wallet address! We cannot recover funds sent to the wrong address.
        </div>
      </div>

      <label className={`flex items-start gap-2 text-sm text-gray-300`}>
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => onConfirmedChange(e.target.checked)}
          className={`w-4 h-4 ${radioColor} mt-1`}
        />
        <span>I have verified this is a TRC20 Tron wallet address and it is correct</span>
      </label>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!confirmed || !wallet.trim() || submitting}
          className={`flex-1 bg-gradient-to-r ${btnGradient} disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all`}
        >
          {submitting ? 'Processing...' : submitLabel}
        </button>
      </div>
    </div>
  )
}
