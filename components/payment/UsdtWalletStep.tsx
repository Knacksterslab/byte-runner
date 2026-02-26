export type UsdtNetwork = 'trc20' | 'erc20'

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
  network,
  onNetworkChange,
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
  const hoverBorder = accentColor === 'green' ? 'hover:border-green-500/50' : 'hover:border-cyan-500/50'
  const btnGradient = accentColor === 'green'
    ? 'from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'
    : 'from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-300 mb-2 font-semibold">USDT Wallet Address:</label>
        <input
          type="text"
          value={wallet}
          onChange={(e) => onWalletChange(e.target.value)}
          className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white ${focusBorder} focus:outline-none font-mono text-sm`}
          placeholder="TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-2 font-semibold">Network:</label>
        <div className="space-y-2">
          {([
            { value: 'trc20', label: 'Tron (TRC20)', sub: '✓ Recommended - Low fees (~$1)', subColor: 'text-green-400' },
            { value: 'erc20', label: 'Ethereum (ERC20)', sub: '⚠️ Higher fees ($5-50)', subColor: 'text-yellow-400' },
          ] as const).map((n) => (
            <label key={n.value} className={`flex items-center gap-3 p-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg cursor-pointer ${hoverBorder} transition-colors`}>
              <input
                type="radio"
                name="network"
                value={n.value}
                checked={network === n.value}
                onChange={() => onNetworkChange(n.value)}
                className={`w-4 h-4 ${radioColor}`}
              />
              <div className="flex-1">
                <div className="text-white font-medium">{n.label}</div>
                <div className={`text-xs ${n.subColor}`}>{n.sub}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-3">
        <div className="text-red-400 text-sm font-semibold mb-1">⚠️ Important:</div>
        <div className="text-gray-300 text-xs">Double-check your wallet address! We cannot recover funds sent to the wrong address.</div>
      </div>

      <label className="flex items-start gap-2 text-sm text-gray-300">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => onConfirmedChange(e.target.checked)}
          className={`w-4 h-4 ${radioColor} mt-1`}
        />
        <span>I have verified this wallet address is correct and matches the selected network</span>
      </label>

      <div className="flex gap-3 mt-6">
        <button onClick={onBack} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors">
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
