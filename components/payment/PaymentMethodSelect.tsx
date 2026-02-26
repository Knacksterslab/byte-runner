import { Gift, Wallet } from 'lucide-react'

export type PaymentMethod = 'app_store' | 'google_play' | 'usdt'

interface PaymentMethodSelectProps {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
  accentColor?: 'green' | 'cyan'
}

const METHODS: { value: PaymentMethod; label: string; sub: string; icon: 'gift' | 'wallet' }[] = [
  { value: 'app_store', label: 'App Store Gift Card', sub: 'Email delivery', icon: 'gift' },
  { value: 'google_play', label: 'Google Play Gift Card', sub: 'Email delivery', icon: 'gift' },
  { value: 'usdt', label: 'USDT (Crypto)', sub: 'Wallet transfer', icon: 'wallet' },
]

export function PaymentMethodSelect({ value, onChange, accentColor = 'green' }: PaymentMethodSelectProps) {
  const hoverBorder = accentColor === 'green' ? 'hover:border-green-500/50' : 'hover:border-cyan-500/50'
  const radioColor = accentColor === 'green' ? 'text-green-500' : 'text-cyan-500'

  return (
    <div className="space-y-2">
      {METHODS.map((method) => (
        <label
          key={method.value}
          className={`flex items-center gap-3 p-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg cursor-pointer ${hoverBorder} transition-colors`}
        >
          <input
            type="radio"
            name="payment"
            value={method.value}
            checked={value === method.value}
            onChange={() => onChange(method.value)}
            className={`w-4 h-4 ${radioColor}`}
          />
          {method.icon === 'wallet' ? (
            <Wallet className="w-5 h-5 text-green-400" />
          ) : (
            <Gift className="w-5 h-5 text-gray-400" />
          )}
          <div className="flex-1">
            <div className="text-white font-medium">{method.label}</div>
            <div className="text-gray-400 text-xs">{method.sub}</div>
          </div>
        </label>
      ))}
    </div>
  )
}
