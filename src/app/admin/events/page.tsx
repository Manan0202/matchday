import Link from 'next/link'
import { prisma } from '@/lib/db'
import { AdminEventsClient } from '@/components/admin/AdminEventsClient'

export default async function AdminEventsPage() {
    const events = await prisma.event.findMany({
        include: { sport: true, homeTeam: true, awayTeam: true, venue: true },
        orderBy: { startTime: 'asc' },
    })

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Events</h1>
                <Link
                    href="/admin/events/new"
                    className="rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400"
                >
                    New event
                </Link>
            </div>
            <AdminEventsClient
                events={events.map((e) => ({ ...e, startTime: e.startTime.toISOString() }))}
            />
        </div>
    )
}
