import { prisma } from '@/lib/db'
import { RevenueChart } from '@/components/admin/RevenueChart'
import { SeatsChart } from '@/components/admin/SeatsChart'

export default async function AdminDashboard() {
    const [eventCount, venueCount, teamCount, bookings, events] = await Promise.all([
        prisma.event.count(),
        prisma.venue.count(),
        prisma.team.count(),
        prisma.booking.findMany({
            include: {
                seats: {
                    include: {
                        seat: {
                            include: { eventSection: { include: { event: { include: { sport: true } } } } },
                        },
                    },
                },
            },
        }),
        prisma.event.findMany({
            where: { status: { in: ['UPCOMING', 'LIVE'] } },
            include: {
                homeTeam: true,
                awayTeam: true,
                sections: { include: { seats: true } },
            },
            orderBy: { startTime: 'asc' },
            take: 8,
        }),
    ])

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0)

    const revenueBySport = new Map<string, number>()
    for (const booking of bookings) {
        const sportName = booking.seats[0]?.seat.eventSection.event.sport.name
        if (!sportName) continue
        revenueBySport.set(sportName, (revenueBySport.get(sportName) ?? 0) + booking.totalPrice)
    }
    const revenueData = ['Football', 'Cricket', 'Basketball'].map((label) => ({
        label,
        value: revenueBySport.get(label) ?? 0,
    }))

    const seatsData = events.map((event) => {
        const allSeats = event.sections.flatMap((s) => s.seats)
        return {
            label: `${event.homeTeam.shortName} vs ${event.awayTeam.shortName}`,
            sold: allSeats.filter((s) => s.status === 'SOLD').length,
            available: allSeats.filter((s) => s.status === 'AVAILABLE').length,
        }
    })

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Admin dashboard</h1>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                <Stat label="Events" value={eventCount} />
                <Stat label="Venues" value={venueCount} />
                <Stat label="Teams" value={teamCount} />
                <Stat label="Bookings" value={bookings.length} />
                <Stat label="Revenue" value={`$${totalRevenue.toLocaleString()}`} />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
                <SeatsChart data={seatsData} />
                <RevenueChart data={revenueData} />
            </div>
        </div>
    )
}

function Stat({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-slate-600">{label}</p>
        </div>
    )
}
