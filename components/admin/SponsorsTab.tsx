'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  adminCreateCampaign,
  adminCreateCreative,
  adminCreateSponsor,
  adminGetCampaigns,
  adminGetSponsors,
  adminSetCampaignLifecycle,
  adminSimulateSponsor,
  adminUpsertCampaignTargeting,
  type AdminCampaign,
  type AdminSponsor,
} from '@/lib/api/admin'
import { threatTypes } from '@/lib/game/threatData'
import { protectionKits } from '@/lib/game/protectionKits'

const CAMPAIGN_STATUSES = ['draft', 'active', 'paused', 'archived'] as const
const SPONSOR_STATUSES = ['active', 'paused', 'archived'] as const
const DEFAULT_END_OFFSET_MS = 30 * 24 * 60 * 60 * 1000

export function SponsorsTab() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [sponsors, setSponsors] = useState<AdminSponsor[]>([])
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([])
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('')
  const [simulateThreatId, setSimulateThreatId] = useState('')
  const [simulateKitType, setSimulateKitType] = useState('')
  const [simulateResult, setSimulateResult] = useState<any>(null)
  const [campaignFormError, setCampaignFormError] = useState('')
  const [targetingHint, setTargetingHint] = useState('')
  const [targetingError, setTargetingError] = useState('')

  const [sponsorForm, setSponsorForm] = useState({
    slug: '',
    name: '',
    legalName: '',
    status: 'active' as 'active' | 'paused' | 'archived',
    allowedDomains: '',
  })

  const defaultStart = new Date().toISOString().slice(0, 16)
  const defaultEnd = new Date(Date.now() + DEFAULT_END_OFFSET_MS).toISOString().slice(0, 16)
  const [campaignForm, setCampaignForm] = useState({
    sponsorId: '',
    name: '',
    status: 'draft' as 'draft' | 'active' | 'paused' | 'archived',
    startsAt: defaultStart,
    hasEndAt: true,
    endsAt: defaultEnd,
    priority: '10',
    dailyImpressionCap: '',
    totalImpressionCap: '',
    frequencyCapPerUserPerDay: '20',
  })

  const [creativeForm, setCreativeForm] = useState({
    title: '',
    description: '',
    ctaLabel: 'LEARN MORE',
    ctaUrl: '',
    tag: 'SPONSORED',
    logo: 'AD',
  })

  const [targetingForm, setTargetingForm] = useState({
    threatIds: [] as string[],
    kitTypes: [] as string[],
    customThreatIds: '',
    customKitTypes: '',
    countries: '',
    platforms: '',
    allowCustomValues: false,
  })

  const threatOptions = useMemo(
    () =>
      [...threatTypes]
        .map((threat) => ({ id: threat.id, label: threat.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [],
  )
  const kitOptions = useMemo(
    () =>
      [...protectionKits]
        .map((kit) => ({ id: kit.id, label: kit.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [],
  )
  const threatIdSet = useMemo(() => new Set(threatOptions.map((item) => item.id)), [threatOptions])
  const kitIdSet = useMemo(() => new Set(kitOptions.map((item) => item.id)), [kitOptions])

  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.id === selectedCampaignId) ?? null,
    [campaigns, selectedCampaignId],
  )

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [nextSponsors, nextCampaigns] = await Promise.all([adminGetSponsors(), adminGetCampaigns()])
      setSponsors(nextSponsors)
      setCampaigns(nextCampaigns)
      if (!selectedCampaignId && nextCampaigns.length > 0) setSelectedCampaignId(nextCampaigns[0].id)
      if (!campaignForm.sponsorId && nextSponsors.length > 0) {
        setCampaignForm((prev) => ({ ...prev, sponsorId: nextSponsors[0].id }))
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load sponsors dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const csvToList = (value: string) => value.split(',').map((part) => part.trim()).filter(Boolean)
  const dedupe = (values: string[]) => Array.from(new Set(values))
  const parseNonNegativeInt = (value: string): number | undefined => {
    if (!value.trim()) return undefined
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed < 0 || !Number.isInteger(parsed)) return undefined
    return parsed
  }

  const setSuccess = (text: string) => setNotice({ type: 'success', text })
  const setFailure = (text: string) => setNotice({ type: 'error', text })

  const parseMultiSelect = (event: React.ChangeEvent<HTMLSelectElement>): string[] =>
    Array.from(event.target.selectedOptions).map((option) => option.value)

  useEffect(() => {
    if (!selectedCampaign) {
      setTargetingForm((prev) => ({
        ...prev,
        threatIds: [],
        kitTypes: [],
        customThreatIds: '',
        customKitTypes: '',
        countries: '',
        platforms: '',
      }))
      return
    }
    setTargetingHint('')
    const targetingRaw = Array.isArray(selectedCampaign.campaign_targeting)
      ? selectedCampaign.campaign_targeting[0]
      : selectedCampaign.campaign_targeting
    const threatIds = Array.isArray(targetingRaw?.threat_ids)
      ? targetingRaw.threat_ids.filter((id: unknown): id is string => typeof id === 'string')
      : []
    const kitTypes = Array.isArray(targetingRaw?.kit_types)
      ? targetingRaw.kit_types.filter((id: unknown): id is string => typeof id === 'string')
      : []
    const countries = Array.isArray(targetingRaw?.countries)
      ? targetingRaw.countries.filter((id: unknown): id is string => typeof id === 'string').join(', ')
      : ''
    const platforms = Array.isArray(targetingRaw?.platforms)
      ? targetingRaw.platforms.filter((id: unknown): id is string => typeof id === 'string').join(', ')
      : ''
    const knownThreatIds = threatIds.filter((id: string) => threatIdSet.has(id))
    const knownKitTypes = kitTypes.filter((id: string) => kitIdSet.has(id))
    const unknownThreatIds = threatIds.filter((id: string) => !threatIdSet.has(id))
    const unknownKitTypes = kitTypes.filter((id: string) => !kitIdSet.has(id))

    setTargetingForm((prev) => ({
      ...prev,
      threatIds: knownThreatIds,
      kitTypes: knownKitTypes,
      customThreatIds: unknownThreatIds.join(', '),
      customKitTypes: unknownKitTypes.join(', '),
      countries,
      platforms,
    }))
    setTargetingError('')
  }, [selectedCampaign, threatIdSet, kitIdSet])

  const onCreateSponsor = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await adminCreateSponsor({
        slug: sponsorForm.slug,
        name: sponsorForm.name,
        legalName: sponsorForm.legalName || undefined,
        status: sponsorForm.status,
        allowedDomains: csvToList(sponsorForm.allowedDomains),
      })
      setSponsorForm({ slug: '', name: '', legalName: '', status: 'active', allowedDomains: '' })
      await load()
      setSuccess('Sponsor created successfully.')
    } catch (err: any) {
      setFailure(err?.message || 'Failed to create sponsor')
    }
  }

  const onCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    setCampaignFormError('')
    setNotice(null)
    if (!campaignForm.sponsorId) {
      setCampaignFormError('Please select a sponsor.')
      return
    }
    if (!campaignForm.name.trim()) {
      setCampaignFormError('Campaign name is required.')
      return
    }
    if (!campaignForm.startsAt) {
      setCampaignFormError('Start date and time are required.')
      return
    }
    if (campaignForm.hasEndAt && !campaignForm.endsAt) {
      setCampaignFormError('End date/time is required when end scheduling is enabled.')
      return
    }
    const startDate = new Date(campaignForm.startsAt)
    if (Number.isNaN(startDate.getTime())) {
      setCampaignFormError('Start date/time is invalid.')
      return
    }
    let endDate: Date | undefined
    if (campaignForm.hasEndAt) {
      endDate = new Date(campaignForm.endsAt)
      if (Number.isNaN(endDate.getTime())) {
        setCampaignFormError('End date/time is invalid.')
        return
      }
      if (endDate.getTime() <= startDate.getTime()) {
        setCampaignFormError('End date/time must be later than start date/time.')
        return
      }
    }
    const priority = parseNonNegativeInt(campaignForm.priority)
    const dailyImpressionCap = parseNonNegativeInt(campaignForm.dailyImpressionCap)
    const totalImpressionCap = parseNonNegativeInt(campaignForm.totalImpressionCap)
    const frequencyCapPerUserPerDay = parseNonNegativeInt(campaignForm.frequencyCapPerUserPerDay)
    if (priority === undefined) {
      setCampaignFormError('Priority must be a non-negative integer.')
      return
    }
    if (campaignForm.dailyImpressionCap.trim() && dailyImpressionCap === undefined) {
      setCampaignFormError('Daily impression cap must be a non-negative integer.')
      return
    }
    if (campaignForm.totalImpressionCap.trim() && totalImpressionCap === undefined) {
      setCampaignFormError('Total impression cap must be a non-negative integer.')
      return
    }
    if (frequencyCapPerUserPerDay === undefined) {
      setCampaignFormError('Frequency cap per user/day must be a non-negative integer.')
      return
    }
    try {
      const created = await adminCreateCampaign({
        sponsorId: campaignForm.sponsorId,
        name: campaignForm.name.trim(),
        status: campaignForm.status,
        startsAt: startDate.toISOString(),
        endsAt: endDate?.toISOString(),
        priority,
        dailyImpressionCap,
        totalImpressionCap,
        frequencyCapPerUserPerDay,
      })
      setCampaignForm((prev) => ({
        ...prev,
        name: '',
        hasEndAt: true,
        startsAt: new Date().toISOString().slice(0, 16),
        endsAt: new Date(Date.now() + DEFAULT_END_OFFSET_MS).toISOString().slice(0, 16),
      }))
      setSelectedCampaignId(created.id)
      await load()
      setTargetingHint(`Campaign "${created.name}" created. Next: set targeting and add at least one creative.`)
      setSuccess('Campaign created successfully.')
    } catch (err: any) {
      setFailure(err?.message || 'Failed to create campaign')
    }
  }

  const onSetLifecycle = async (campaignId: string, status: (typeof CAMPAIGN_STATUSES)[number]) => {
    try {
      await adminSetCampaignLifecycle(campaignId, status)
      await load()
      setSuccess(`Campaign moved to ${status}.`)
    } catch (err: any) {
      setFailure(err?.message || 'Failed to update lifecycle')
    }
  }

  const onSaveTargeting = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCampaignId) return
    setTargetingError('')
    const customThreatIds = csvToList(targetingForm.customThreatIds)
    const customKitTypes = csvToList(targetingForm.customKitTypes)
    if (!targetingForm.allowCustomValues && (customThreatIds.length > 0 || customKitTypes.length > 0)) {
      setTargetingError('Custom IDs are present. Enable advanced mode or remove custom IDs.')
      return
    }

    const invalidThreatIds = customThreatIds.filter((id) => !/^[a-z0-9-]+$/i.test(id))
    const invalidKitTypes = customKitTypes.filter((id) => !/^[a-z0-9-]+$/i.test(id))
    if (invalidThreatIds.length > 0 || invalidKitTypes.length > 0) {
      setTargetingError('Custom IDs must use letters, numbers, and hyphens only.')
      return
    }

    const mergedThreatIds = dedupe([...targetingForm.threatIds, ...customThreatIds])
    const mergedKitTypes = dedupe([...targetingForm.kitTypes, ...customKitTypes])
    try {
      await adminUpsertCampaignTargeting(selectedCampaignId, {
        threatIds: mergedThreatIds,
        kitTypes: mergedKitTypes,
        countries: csvToList(targetingForm.countries),
        platforms: csvToList(targetingForm.platforms),
      })
      const isCatchAll =
        mergedThreatIds.length === 0 &&
        mergedKitTypes.length === 0 &&
        csvToList(targetingForm.countries).length === 0 &&
        csvToList(targetingForm.platforms).length === 0
      setTargetingHint(
        isCatchAll
          ? 'Targeting saved as catch-all: campaign can serve for any threat/kit.'
          : `Targeting saved. ${mergedThreatIds.length} threat IDs and ${mergedKitTypes.length} kit IDs configured.`,
      )
      setSuccess('Targeting updated.')
      await load()
    } catch (err: any) {
      setFailure(err?.message || 'Failed to save targeting')
    }
  }

  const onCreateCreative = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCampaignId) return
    try {
      await adminCreateCreative(selectedCampaignId, {
        title: creativeForm.title,
        description: creativeForm.description,
        ctaLabel: creativeForm.ctaLabel,
        ctaUrl: creativeForm.ctaUrl,
        tag: creativeForm.tag,
        logo: creativeForm.logo,
      })
      setCreativeForm((prev) => ({ ...prev, title: '', description: '', ctaUrl: '' }))
      await load()
      setSuccess('Creative created successfully.')
    } catch (err: any) {
      setFailure(err?.message || 'Failed to create creative')
    }
  }

  const onSimulate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await adminSimulateSponsor({
        threatId: simulateThreatId || undefined,
        kitType: simulateKitType || undefined,
      })
      setSimulateResult(result)
      setSuccess(result?.sponsor ? 'Simulation found an eligible sponsor.' : 'Simulation returned no fill.')
    } catch (err: any) {
      setFailure(err?.message || 'Failed to run simulation')
    }
  }

  if (loading) return <div className="text-gray-400 py-8">Loading sponsors dashboard...</div>

  return (
    <div className="space-y-8">
      {error && <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg p-3 text-sm">{error}</div>}
      {notice && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            notice.type === 'success'
              ? 'bg-emerald-900/25 border-emerald-700 text-emerald-200'
              : 'bg-red-900/30 border-red-700 text-red-300'
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <form onSubmit={onCreateSponsor} className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
          <h3 className="text-lg font-bold text-cyan-400">Create Sponsor</h3>
          <label className="block text-xs text-gray-300 font-semibold">
            Sponsor slug
            <input className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" placeholder="purevpn" value={sponsorForm.slug} onChange={(e) => setSponsorForm((prev) => ({ ...prev, slug: e.target.value }))} required />
          </label>
          <label className="block text-xs text-gray-300 font-semibold">
            Sponsor name
            <input className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" placeholder="PureVPN" value={sponsorForm.name} onChange={(e) => setSponsorForm((prev) => ({ ...prev, name: e.target.value }))} required />
          </label>
          <label className="block text-xs text-gray-300 font-semibold">
            Legal name (optional)
            <input className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" placeholder="PureVPN LLC" value={sponsorForm.legalName} onChange={(e) => setSponsorForm((prev) => ({ ...prev, legalName: e.target.value }))} />
          </label>
          <label className="block text-xs text-gray-300 font-semibold">
            Status
            <select className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={sponsorForm.status} onChange={(e) => setSponsorForm((prev) => ({ ...prev, status: e.target.value as (typeof SPONSOR_STATUSES)[number] }))}>
              {SPONSOR_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-gray-300 font-semibold">
            Allowed destination domains (comma-separated)
            <input className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" placeholder="purevpn.com,promo.purevpn.com" value={sponsorForm.allowedDomains} onChange={(e) => setSponsorForm((prev) => ({ ...prev, allowedDomains: e.target.value }))} />
          </label>
          <p className="text-[11px] text-gray-400">
            Restricts CTA links to approved hostnames for this sponsor.
          </p>
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded">Create Sponsor</button>
        </form>

        <form onSubmit={onCreateCampaign} className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
          <h3 className="text-lg font-bold text-green-400">Create Campaign</h3>
          <label className="block text-xs text-gray-300 font-semibold">
            Sponsor
            <select className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={campaignForm.sponsorId} onChange={(e) => setCampaignForm((prev) => ({ ...prev, sponsorId: e.target.value }))} required>
              <option value="">Select sponsor</option>
              {sponsors.map((sponsor) => <option key={sponsor.id} value={sponsor.id}>{sponsor.name}</option>)}
            </select>
          </label>
          <label className="block text-xs text-gray-300 font-semibold">
            Campaign name
            <input className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" placeholder="Spring security push" value={campaignForm.name} onChange={(e) => setCampaignForm((prev) => ({ ...prev, name: e.target.value }))} required />
          </label>
          <label className="block text-xs text-gray-300 font-semibold">
            Lifecycle status
            <select className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={campaignForm.status} onChange={(e) => setCampaignForm((prev) => ({ ...prev, status: e.target.value as (typeof CAMPAIGN_STATUSES)[number] }))}>
              {CAMPAIGN_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-gray-300 font-semibold">
              Start date/time
              <input type="datetime-local" className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={campaignForm.startsAt} onChange={(e) => setCampaignForm((prev) => ({ ...prev, startsAt: e.target.value }))} required />
            </label>
            <label className="block text-xs text-gray-300 font-semibold">
              End date/time {campaignForm.hasEndAt ? '(optional override enabled)' : '(disabled)'}
              <input
                type="datetime-local"
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white disabled:opacity-60"
                value={campaignForm.endsAt}
                onChange={(e) => setCampaignForm((prev) => ({ ...prev, endsAt: e.target.value }))}
                disabled={!campaignForm.hasEndAt}
              />
            </label>
          </div>
          <label className="inline-flex items-center gap-2 text-xs text-gray-300">
            <input
              type="checkbox"
              checked={campaignForm.hasEndAt}
              onChange={(e) => setCampaignForm((prev) => ({
                ...prev,
                hasEndAt: e.target.checked,
                endsAt: e.target.checked ? (prev.endsAt || new Date(Date.now() + DEFAULT_END_OFFSET_MS).toISOString().slice(0, 16)) : '',
              }))}
            />
            Set campaign end date/time
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-gray-300 font-semibold">
              Priority (non-negative integer)
              <input type="number" min={0} step={1} className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={campaignForm.priority} onChange={(e) => setCampaignForm((prev) => ({ ...prev, priority: e.target.value }))} />
            </label>
            <label className="block text-xs text-gray-300 font-semibold">
              Frequency cap per user/day
              <input type="number" min={0} step={1} className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={campaignForm.frequencyCapPerUserPerDay} onChange={(e) => setCampaignForm((prev) => ({ ...prev, frequencyCapPerUserPerDay: e.target.value }))} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-gray-300 font-semibold">
              Daily impression cap (blank = unlimited)
              <input type="number" min={0} step={1} className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={campaignForm.dailyImpressionCap} onChange={(e) => setCampaignForm((prev) => ({ ...prev, dailyImpressionCap: e.target.value }))} />
            </label>
            <label className="block text-xs text-gray-300 font-semibold">
              Total impression cap (blank = unlimited)
              <input type="number" min={0} step={1} className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={campaignForm.totalImpressionCap} onChange={(e) => setCampaignForm((prev) => ({ ...prev, totalImpressionCap: e.target.value }))} />
            </label>
          </div>
          <p className="text-[11px] text-gray-400">
            End date/time must be later than start. Use draft status if the campaign is not ready to serve.
          </p>
          {campaignFormError && (
            <p className="text-sm text-red-300 bg-red-900/20 border border-red-700 rounded px-3 py-2">{campaignFormError}</p>
          )}
          <button className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">Create Campaign</button>
        </form>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-bold text-cyan-400 mb-3">Campaigns</h3>
        {campaigns.length === 0 ? (
          <div className="rounded border border-gray-700 bg-gray-800/40 p-4 text-sm text-gray-300">
            No campaigns yet. Create a campaign, then select it to unlock targeting and creative setup.
          </div>
        ) : (
          <div className="space-y-2">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className={`border rounded p-3 ${selectedCampaignId === campaign.id ? 'border-cyan-500 bg-gray-800/70' : 'border-gray-700 bg-gray-800/30'}`}>
                <div className="flex items-center justify-between gap-3">
                  <button className="text-left flex-1" onClick={() => setSelectedCampaignId(campaign.id)}>
                    <div className="text-white font-semibold">{campaign.name}</div>
                    <div className="text-xs text-gray-400">{campaign.id}</div>
                  </button>
                  <select
                    value={campaign.status}
                    onChange={(e) => onSetLifecycle(campaign.id, e.target.value as (typeof CAMPAIGN_STATUSES)[number])}
                    className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                  >
                    {CAMPAIGN_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCampaign && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <form onSubmit={onSaveTargeting} className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
            <h3 className="text-lg font-bold text-yellow-300">Targeting ({selectedCampaign.name})</h3>
            <p className="text-xs text-gray-400">
              Select IDs from known game data. Use advanced mode only for deliberate custom IDs.
            </p>
            <label className="block text-xs text-gray-300 font-semibold">
              Threat IDs (known)
              <select
                multiple
                size={8}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                value={targetingForm.threatIds}
                onChange={(e) => setTargetingForm((prev) => ({ ...prev, threatIds: parseMultiSelect(e) }))}
              >
                {threatOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label} ({option.id})
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-gray-300 font-semibold">
              Kit type IDs (known)
              <select
                multiple
                size={8}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                value={targetingForm.kitTypes}
                onChange={(e) => setTargetingForm((prev) => ({ ...prev, kitTypes: parseMultiSelect(e) }))}
              >
                {kitOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label} ({option.id})
                  </option>
                ))}
              </select>
            </label>
            <label className="inline-flex items-center gap-2 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={targetingForm.allowCustomValues}
                onChange={(e) => setTargetingForm((prev) => ({ ...prev, allowCustomValues: e.target.checked }))}
              />
              Allow custom IDs (advanced)
            </label>
            <label className="block text-xs text-gray-300 font-semibold">
              Custom threat IDs (comma-separated)
              <input
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white disabled:opacity-60"
                placeholder="only if not listed above"
                value={targetingForm.customThreatIds}
                onChange={(e) => setTargetingForm((prev) => ({ ...prev, customThreatIds: e.target.value }))}
                disabled={!targetingForm.allowCustomValues}
              />
            </label>
            <label className="block text-xs text-gray-300 font-semibold">
              Custom kit type IDs (comma-separated)
              <input
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white disabled:opacity-60"
                placeholder="only if not listed above"
                value={targetingForm.customKitTypes}
                onChange={(e) => setTargetingForm((prev) => ({ ...prev, customKitTypes: e.target.value }))}
                disabled={!targetingForm.allowCustomValues}
              />
            </label>
            <label className="block text-xs text-gray-300 font-semibold">
              Countries (comma-separated, optional)
              <input className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" placeholder="us,ca,gb" value={targetingForm.countries} onChange={(e) => setTargetingForm((prev) => ({ ...prev, countries: e.target.value }))} />
            </label>
            <label className="block text-xs text-gray-300 font-semibold">
              Platforms (comma-separated, optional)
              <input className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" placeholder="web,ios,android" value={targetingForm.platforms} onChange={(e) => setTargetingForm((prev) => ({ ...prev, platforms: e.target.value }))} />
            </label>
            <div className="flex flex-wrap gap-2">
              <button className="bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">Save Targeting</button>
              <button
                type="button"
                onClick={() => {
                  setTargetingForm((prev) => ({
                    ...prev,
                    threatIds: [],
                    kitTypes: [],
                    customThreatIds: '',
                    customKitTypes: '',
                    countries: '',
                    platforms: '',
                    allowCustomValues: false,
                  }))
                  setTargetingError('')
                  setTargetingHint('Catch-all targeting applied in form. Click "Save Targeting" to persist.')
                }}
                className="bg-sky-700 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded"
              >
                Apply Catch-all
              </button>
            </div>
            {targetingError && (
              <p className="text-sm text-red-300 bg-red-900/20 border border-red-700 rounded px-3 py-2">{targetingError}</p>
            )}
            {targetingHint && (
              <p className="text-xs text-gray-300">{targetingHint}</p>
            )}
          </form>

          <form onSubmit={onCreateCreative} className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
            <h3 className="text-lg font-bold text-purple-300">Create Creative ({selectedCampaign.name})</h3>
            <input className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" placeholder="title" value={creativeForm.title} onChange={(e) => setCreativeForm((prev) => ({ ...prev, title: e.target.value }))} required />
            <textarea className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" placeholder="description" value={creativeForm.description} onChange={(e) => setCreativeForm((prev) => ({ ...prev, description: e.target.value }))} required />
            <input className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" placeholder="CTA label" value={creativeForm.ctaLabel} onChange={(e) => setCreativeForm((prev) => ({ ...prev, ctaLabel: e.target.value }))} />
            <input className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" placeholder="CTA URL" value={creativeForm.ctaUrl} onChange={(e) => setCreativeForm((prev) => ({ ...prev, ctaUrl: e.target.value }))} required />
            <input className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" placeholder="Tag (e.g. SPONSORED)" value={creativeForm.tag} onChange={(e) => setCreativeForm((prev) => ({ ...prev, tag: e.target.value }))} />
            <input className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" placeholder="Logo text (e.g. VPN)" value={creativeForm.logo} onChange={(e) => setCreativeForm((prev) => ({ ...prev, logo: e.target.value }))} />
            <button className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded">Create Creative</button>
          </form>
        </div>
      )}

      <form onSubmit={onSimulate} className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
        <h3 className="text-lg font-bold text-green-300">Selection Simulator</h3>
        <p className="text-xs text-gray-400">
          Use exact runtime IDs to verify if a sponsor will be selected for a recovery event.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" placeholder="threat id" value={simulateThreatId} onChange={(e) => setSimulateThreatId(e.target.value)} />
          <input className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" placeholder="kit type" value={simulateKitType} onChange={(e) => setSimulateKitType(e.target.value)} />
        </div>
        <button className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">Run Simulation</button>
        {simulateResult && (
          <pre className="bg-gray-950 border border-gray-700 rounded-lg p-3 text-xs text-gray-200 overflow-auto">
            {JSON.stringify(simulateResult, null, 2)}
          </pre>
        )}
      </form>
    </div>
  )
}
