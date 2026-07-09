import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { EventsBrowser } from '@/components/EventsBrowser'
import { TrendingStrip } from '@/components/TrendingStrip'
import { YourTeamsSection } from '@/components/YourTeamsSection'
import { HowItWorks } from '@/components/HowItWorks'

// Events change from admin actions and live seat bookings — must be
// fetched fresh per request, not statically cached at build time.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
    // This route is force-dynamic (see above) specifically so "trending"
    // can be computed per-request against the real current time.
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now()
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

    // Trending = live right now, or starting soon — the fixtures worth
    // surfacing before someone scrolls the full grid.
    const TWO_DAYS_MS = 48 * 60 * 60 * 1000
    const trending = eventCards
        .filter(
            (e) =>
                e.status === 'LIVE' ||
                (e.status === 'UPCOMING' &&
                    new Date(e.startTime).getTime() - now < TWO_DAYS_MS)
        )
        .sort((a, b) => (a.status === 'LIVE' ? -1 : 1) - (b.status === 'LIVE' ? -1 : 1))
        .slice(0, 6)

    const session = await getSession()
    let yourTeamsEvents: Array<{
        id: string
        league: string
        status: 'UPCOMING' | 'LIVE' | 'FINISHED' | 'CANCELLED'
        startTime: string
        sport: { slug: string }
        homeTeam: { shortName: string }
        awayTeam: { shortName: string }
        followedTeamName: string
    }> = []
    if (session) {
        const favorites = await prisma.favorite.findMany({
            where: { userId: session.userId },
            include: { team: true },
        })
        const favTeamNameById = new Map(favorites.map((f) => [f.teamId, f.team.name]))
        yourTeamsEvents = events
            .filter(
                (e) =>
                    (e.status === 'UPCOMING' || e.status === 'LIVE') &&
                    (favTeamNameById.has(e.homeTeamId) || favTeamNameById.has(e.awayTeamId))
            )
            .map((e) => ({
                id: e.id,
                league: e.league,
                status: e.status,
                startTime: e.startTime.toISOString(),
                sport: { slug: e.sport.slug },
                homeTeam: { shortName: e.homeTeam.shortName },
                awayTeam: { shortName: e.awayTeam.shortName },
                followedTeamName:
                    favTeamNameById.get(e.homeTeamId) ?? favTeamNameById.get(e.awayTeamId)!,
            }))
            .slice(0, 4)
    }

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
            <YourTeamsSection events={yourTeamsEvents} />
            <TrendingStrip events={trending} />
            <EventsBrowser sports={sports} events={eventCards} />
            <HowItWorks />
        </div>
    )
}
