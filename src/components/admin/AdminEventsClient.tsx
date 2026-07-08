'use client'

import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'

type EventRow = {
    id: string
    league: string
    status: string
    startTime: string
    sport: { name: string }
    homeTeam: { shortName: string }
    awayTeam: { shortName: string }
    venue: { name: string }
}

const STATUSES = ['UPCOMING', 'LIVE', 'FINISHED', 'CANCELLED']

export function AdminEventsClient({ events }: { events: EventRow[] }) {
    const router = useRouter()
    const { showToast } = useToast()

    const handleStatusChange = async (id: string, status: string) => {
        await fetch(`/api/admin/events/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        })
        showToast(`Status changed to ${status}`, 'success')
        router.refresh()
    }

    const handleDelete = async (id: string, matchLabel: string) => {
        await fetch(`/api/admin/events/${id}`, { method: 'DELETE' })
        showToast(`Deleted ${matchLabel}`, 'info')
        router.refresh()
    }

    return (
        <table className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                    <th className="px-4 py-2">Match</th>
                    <th className="px-4 py-2">Sport / League</th>
                    <th className="px-4 py-2">Venue</th>
                    <th className="px-4 py-2">Start</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2" />
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {events.map((event) => (
                    <tr key={event.id} className="transition-colors hover:bg-slate-50">
                        <td className="px-4 py-2 font-medium">
                            {event.homeTeam.shortName} vs {event.awayTeam.shortName}
                        </td>
                        <td className="px-4 py-2">
                            {event.sport.name} · {event.league}
                        </td>
                        <td className="px-4 py-2">{event.venue.name}</td>
                        <td className="px-4 py-2">
                            {new Date(event.startTime).toLocaleString('en-US', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            })}
                        </td>
                        <td className="px-4 py-2">
                            <select
                                value={event.status}
                                onChange={(e) => handleStatusChange(event.id, e.target.value)}
                                className="rounded border border-slate-300 px-2 py-1 text-xs"
                            >
                                {STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </td>
                        <td className="px-4 py-2 text-right">
                            <button
                                onClick={() =>
                                    handleDelete(
                                        event.id,
                                        `${event.homeTeam.shortName} vs ${event.awayTeam.shortName}`
                                    )
                                }
                                className="text-red-600 hover:underline"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
