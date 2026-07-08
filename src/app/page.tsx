import { prisma } from '@/lib/db'
import { EventsBrowser } from '@/components/EventsBrowser'

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
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold">Upcoming & live matches</h1>
                <p className="text-slate-600">
                    Football, cricket, and basketball — book your seat.
                </p>
            </div>
            <EventsBrowser sports={sports} events={eventCards} />
        </div>
    )
}
