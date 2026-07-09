import { prisma } from '@/lib/db'
import { EventsBrowser } from '@/components/EventsBrowser'

// Events change from admin actions and live seat bookings — must be
// fetched fresh per request, not statically cached at build time.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
    const [sports, events] = await Promise.all([
        prisma.sport.findMany({ orderBy: { name: 'asc' } }),
        prisma.event.findMany({
            include: {
                sport: true,
                homeTeam: true,
                awayTeam: true,
                venue: true,
                sections: { include: { seats: true } },
            },
            orderBy: { startTime: 'asc' },
        }),
    ])

    const eventCards = events.map((event) => {
        const availableSeats = event.sections.reduce(
            (sum, section) =>
                sum + section.seats.filter((seat) => seat.status === 'AVAILABLE').length,
            0
        )
        return {
            id: event.id,
            league: event.league,
            status: event.status,
            startTime: event.startTime.toISOString(),
            sport: { name: event.sport.name, slug: event.sport.slug },
            homeTeam: { shortName: event.homeTeam.shortName },
            awayTeam: { shortName: event.awayTeam.shortName },
            venue: { name: event.venue.name, city: event.venue.city },
            availableSeats,
        }
    })

    return (
        <div className="flex flex-col gap-8">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 via-rose-700 to-indigo-900 px-6 py-10 text-white shadow-lg sm:px-10 sm:py-14">
                <p className="text-sm font-semibold tracking-wide text-rose-200 uppercase">
                    Football · Cricket · Basketball
                </p>
                <h1 className="mt-2 max-w-lg text-3xl font-extrabold tracking-tight sm:text-4xl">
                    Never miss a match day.
                </h1>
                <p className="mt-3 max-w-md text-rose-100">
                    Book your seat for the biggest fixtures across the world&apos;s top leagues —
                    live status, real seat maps, instant confirmation.
                </p>
            </div>
            <EventsBrowser sports={sports} events={eventCards} />
        </div>
    )
}
