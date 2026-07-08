import { prisma } from '@/lib/db'

export default async function AdminDashboard() {
    const [eventCount, venueCount, teamCount, bookingCount] = await Promise.all([
        prisma.event.count(),
        prisma.venue.count(),
        prisma.team.count(),
        prisma.booking.count(),
    ])

    return (
        <div>
            <h1 className="mb-4 text-2xl font-bold">Admin dashboard</h1>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Stat label="Events" value={eventCount} />
                <Stat label="Venues" value={venueCount} />
                <Stat label="Teams" value={teamCount} />
                <Stat label="Bookings" value={bookingCount} />
            </div>
        </div>
    )
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-slate-600">{label}</p>
        </div>
    )
}
