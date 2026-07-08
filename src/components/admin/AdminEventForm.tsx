'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'

type Sport = { id: string; name: string }
type Team = { id: string; name: string; sportId: string }
type Section = { id: string; name: string }
type Venue = { id: string; name: string; sections: Section[] }

export function AdminEventForm({
    sports,
    teams,
    venues,
}: {
    sports: Sport[]
    teams: Team[]
    venues: Venue[]
}) {
    const router = useRouter()
    const { showToast } = useToast()
    const [sportId, setSportId] = useState(sports[0]?.id ?? '')
    const [league, setLeague] = useState('')
    const [homeTeamId, setHomeTeamId] = useState('')
    const [awayTeamId, setAwayTeamId] = useState('')
    const [venueId, setVenueId] = useState(venues[0]?.id ?? '')
    const [startTime, setStartTime] = useState('')
    const [prices, setPrices] = useState<Record<string, string>>({})
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const teamsForSport = useMemo(
        () => teams.filter((t) => t.sportId === sportId),
        [teams, sportId]
    )
    const selectedVenue = venues.find((v) => v.id === venueId)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!homeTeamId || !awayTeamId || homeTeamId === awayTeamId) {
            setError('Pick two different teams')
            return
        }
        if (!selectedVenue) {
            setError('Pick a venue')
            return
        }
        const sectionPrices = selectedVenue.sections.map((s) => ({
            sectionId: s.id,
            price: Number(prices[s.id] ?? 0),
        }))
        if (sectionPrices.some((sp) => !sp.price || sp.price <= 0)) {
            setError('Set a price for every section')
            return
        }

        setSubmitting(true)
        try {
            const res = await fetch('/api/admin/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sportId,
                    league,
                    homeTeamId,
                    awayTeamId,
                    venueId,
                    startTime: new Date(startTime).toISOString(),
                    sectionPrices,
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error ?? 'Something went wrong')
                showToast(data.error ?? 'Something went wrong', 'error')
                return
            }
            showToast('Event created', 'success')
            router.push('/admin/events')
            router.refresh()
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex max-w-lg flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4"
        >
            <label className="flex flex-col gap-1 text-sm">
                Sport
                <select
                    value={sportId}
                    onChange={(e) => {
                        setSportId(e.target.value)
                        setHomeTeamId('')
                        setAwayTeamId('')
                    }}
                    className="rounded border border-slate-300 px-2 py-1.5"
                >
                    {sports.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
                League
                <input
                    required
                    value={league}
                    onChange={(e) => setLeague(e.target.value)}
                    className="rounded border border-slate-300 px-2 py-1.5"
                />
            </label>

            <div className="flex gap-3">
                <label className="flex flex-1 flex-col gap-1 text-sm">
                    Home team
                    <select
                        required
                        value={homeTeamId}
                        onChange={(e) => setHomeTeamId(e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1.5"
                    >
                        <option value="">Select…</option>
                        {teamsForSport.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="flex flex-1 flex-col gap-1 text-sm">
                    Away team
                    <select
                        required
                        value={awayTeamId}
                        onChange={(e) => setAwayTeamId(e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1.5"
                    >
                        <option value="">Select…</option>
                        {teamsForSport.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <label className="flex flex-col gap-1 text-sm">
                Venue
                <select
                    value={venueId}
                    onChange={(e) => setVenueId(e.target.value)}
                    className="rounded border border-slate-300 px-2 py-1.5"
                >
                    {venues.map((v) => (
                        <option key={v.id} value={v.id}>
                            {v.name}
                        </option>
                    ))}
                </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
                Start time
                <input
                    required
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="rounded border border-slate-300 px-2 py-1.5"
                />
            </label>

            {selectedVenue && (
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Section prices</p>
                    {selectedVenue.sections.map((section) => (
                        <label key={section.id} className="flex items-center gap-2 text-sm">
                            <span className="w-32">{section.name}</span>
                            <input
                                required
                                type="number"
                                min={1}
                                placeholder="Price"
                                value={prices[section.id] ?? ''}
                                onChange={(e) =>
                                    setPrices((prev) => ({ ...prev, [section.id]: e.target.value }))
                                }
                                className="w-24 rounded border border-slate-300 px-2 py-1"
                            />
                        </label>
                    ))}
                </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
                type="submit"
                disabled={submitting}
                className="w-fit rounded bg-emerald-500 px-4 py-2 font-medium text-slate-950 transition-transform duration-150 hover:bg-emerald-400 active:scale-95 disabled:opacity-50"
            >
                Create event
            </button>
        </form>
    )
}
