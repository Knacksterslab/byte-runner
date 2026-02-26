'use client'

import { Plus, Save, Trash2, X } from 'lucide-react'
import type { CreateContestData } from '@/lib/api/admin'
import { zonedDateTimeToIso, isoToDatetimeLocalInZone } from '@/lib/utils/timezone'

interface PrizeEntry {
  rank: string
  prize: string
}

interface ContestFormProps {
  formData: CreateContestData
  prizeEntries: PrizeEntry[]
  editingId: string | null
  supportedTimeZones: string[]
  onFormDataChange: (data: CreateContestData) => void
  onPrizeEntriesChange: (entries: PrizeEntry[]) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function ContestForm({
  formData,
  prizeEntries,
  editingId,
  supportedTimeZones,
  onFormDataChange,
  onPrizeEntriesChange,
  onSubmit,
  onCancel,
}: ContestFormProps) {
  const addPrizeEntry = () => onPrizeEntriesChange([...prizeEntries, { rank: '', prize: '' }])

  const removePrizeEntry = (index: number) =>
    onPrizeEntriesChange(prizeEntries.filter((_, i) => i !== index))

  const updatePrizeEntry = (index: number, field: 'rank' | 'prize', value: string) => {
    const updated = [...prizeEntries]
    updated[index][field] = value
    onPrizeEntriesChange(updated)
  }

  const tz = formData.contestTimezone || 'UTC'

  return (
    <div className="bg-gray-900 border-2 border-cyan-700 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-cyan-400">
          {editingId ? 'Edit Contest' : 'Create Contest'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-mono text-gray-300 mb-2">Contest Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => {
              const newName = e.target.value
              const autoSlug = newName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
              onFormDataChange({ ...formData, name: newName, slug: formData.slug || autoSlug })
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
            onChange={(e) => onFormDataChange({ ...formData, slug: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none font-mono text-sm"
            placeholder="launch-week-championship"
            pattern="[a-z0-9-]+"
            title="Only lowercase letters, numbers, and hyphens allowed"
          />
          {formData.slug && (
            <p className="text-xs text-cyan-400 mt-1 font-mono">URL: /contests/{formData.slug}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-mono text-gray-300 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
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
              value={isoToDatetimeLocalInZone(formData.startDate, tz)}
              onChange={(e) => onFormDataChange({ ...formData, startDate: zonedDateTimeToIso(e.target.value, tz) })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-mono text-gray-300 mb-2">End Date *</label>
            <input
              type="datetime-local"
              required
              value={isoToDatetimeLocalInZone(formData.endDate, tz)}
              onChange={(e) => onFormDataChange({ ...formData, endDate: zonedDateTimeToIso(e.target.value, tz) })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-mono text-gray-300 mb-2">Contest Timezone *</label>
          <select
            value={tz}
            onChange={(e) => onFormDataChange({ ...formData, contestTimezone: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
          >
            {supportedTimeZones.map((zone) => (
              <option key={zone} value={zone}>{zone}</option>
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
            onChange={(e) => onFormDataChange({ ...formData, status: e.target.value as any })}
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
            <label className="block text-sm font-mono text-gray-300">Prize Pool</label>
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
                  placeholder='e.g., $500, Badge + $100'
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
            Rank examples: &quot;1&quot; for first place, &quot;2-5&quot; for ranks 2 through 5
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
            onClick={onCancel}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
