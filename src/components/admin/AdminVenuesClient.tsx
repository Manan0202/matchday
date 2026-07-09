'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'

type Section = { id: string; name: string; rows: number; seatsPerRow: number }
type Venue = { id: string; name: string; city: string; capacity: number; sections: Section[] }

type DraftSection = { name: string; rows: string; seatsPerRow: string }

export function AdminVenuesClient({ venues }: { venues: Venue[] }) {
    const router = useRouter()
    const { showToast } = useToast()
    const [name, setName] = useState('')
    const [city, setCity] = useState('')
    const [capacity, setCapacity] = useState('')
    const [sections, setSections] = useState<DraftSection[]>([
        { name: '', rows: '4', seatsPerRow: '8' },
    ])
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const updateSection = (index: number, patch: Partial<DraftSection>) => {
        setSections((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))
    }

    const addSection = () =>
        setSections((prev) => [...prev, { name: '', rows: '4', seatsPerRow: '8' }])

    const removeSection = (index: number) =>
        setSections((prev) => prev.filter((_, i) => i !== index))

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSubmitting(true)
        try {
            const res = await fetch('/api/admin/venues', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    city,
                    capacity: Number(capacity),
                    sections: sections.map((s) => ({
                        name: s.name,
                        rows: Number(s.rows),
                        seatsPerRow: Number(s.seatsPerRow),
                    })),
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error ?? 'Something went wrong')
                showToast(data.error ?? 'Something went wrong', 'error')
                return
            }
            showToast(`Added ${name}`, 'success')
            setName('')
            setCity('')
            setCapacity('')
            setSections([{ name: '', rows: '4', seatsPerRow: '8' }])
            router.refresh()
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string, venueName: string) => {
        await fetch(`/api/admin/venues/${id}`, { method: 'DELETE' })
        showToast(`Deleted ${venueName}`, 'info')
        router.refresh()
    }

    return (
        <div className="flex flex-col gap-6">
            <form
                onSubmit={handleCreate}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4"
            >
                <div className="flex flex-wrap gap-3">
                    <label className="flex flex-col gap-1 text-sm">
                        Name
                        <input
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="rounded border border-slate-300 px-2 py-1.5"
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                        City
                        <input
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="rounded border border-slate-300 px-2 py-1.5"
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                        Capacity
                        <input
                            required
                            type="number"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            className="w-28 rounded border border-slate-300 px-2 py-1.5"
                        />
                    </label>
                </div>

                <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Sections</p>
                    {sections.map((section, i) => (
                        <div key={i} className="flex items-end gap-2">
                            <label className="flex flex-col gap-1 text-xs">
                                Name
                                <input
                                    required
                                    value={section.name}
                                    onChange={(e) => updateSection(i, { name: e.target.value })}
                                    className="rounded border border-slate-300 px-2 py-1"
                                />
                            </label>
                            <label className="flex flex-col gap-1 text-xs">
                                Rows
                                <input
                                    required
                                    type="number"
                                    min={1}
                                    value={section.rows}
                                    onChange={(e) => updateSection(i, { rows: e.target.value })}
                                    className="w-16 rounded border border-slate-300 px-2 py-1"
                                />
                            </label>
                            <label className="flex flex-col gap-1 text-xs">
                                Seats/row
                                <input
                                    required
                                    type="number"
                                    min={1}
                                    value={section.seatsPerRow}
                                    onChange={(e) => updateSection(i, { seatsPerRow: e.target.value })}
                                    className="w-20 rounded border border-slate-300 px-2 py-1"
                                />
                            </label>
                            {sections.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeSection(i)}
                                    className="mb-1.5 text-xs text-red-600 hover:underline"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addSection}
                        className="w-fit text-xs text-rose-700 hover:underline"
                    >
                        + Add section
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-fit rounded bg-rose-600 px-4 py-1.5 font-medium text-white transition-transform duration-150 hover:bg-rose-500 active:scale-95 disabled:opacity-50"
                >
                    Add venue
                </button>
                {error && <p className="text-sm text-red-600">{error}</p>}
            </form>

            <div className="flex flex-col gap-3">
                {venues.map((venue) => (
                    <div
                        key={venue.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
                    >
                        <div>
                            <p className="font-semibold">
                                {venue.name} — {venue.city}
                            </p>
                            <p className="text-sm text-slate-600">
                                Capacity {venue.capacity} ·{' '}
                                {venue.sections.map((s) => s.name).join(', ')}
                            </p>
                        </div>
                        <button
                            onClick={() => handleDelete(venue.id, venue.name)}
                            className="text-sm text-red-600 hover:underline"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
