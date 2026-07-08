import Link from 'next/link'
import { prisma } from '@/lib/db'
import { EventStatusBadge } from '@/components/EventStatusBadge'

export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<{ sport?: string; league?: string }>
}) {
    const { sport, league } = await searchParams

    const [sports, events] = await Promise.all([
        prisma.sport.findMany({ orderBy: { name: 'asc' } }),
        prisma.event.findMany({
            where: {
                ...(sport ? { sport: { slug: sport } } : {}),
                ...(league ? { league } : {}),
            },
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

    const leagues = Array.from(new Set(events.map((event) => event.league))).sort()

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold">Upcoming & live matches</h1>
                <p className="text-slate-600">
                    Football, cricket, and basketball — book your seat.
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                <FilterLink href="/" label="All sports" active={!sport} />
                {sports.map((s) => (
                    <FilterLink
                        key={s.id}
                        href={`/?sport=${s.slug}${league ? `&league=${league}` : ''}`}
                        label={s.name}
                        active={sport === s.slug}
                    />
                ))}
            </div>

            {leagues.length > 0 && (
                <div className="flex flex-wrap gap-2 text-sm">
                    <FilterLink
                        href={sport ? `/?sport=${sport}` : '/'}
                        label="All leagues"
                        active={!league}
                        subtle
                    />
                    {leagues.map((l) => (
                        <FilterLink
                            key={l}
                            href={`/?${sport ? `sport=${sport}&` : ''}league=${l}`}
                            label={l}
                            active={league === l}
                            subtle
                        />
                    ))}
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                {events.map((event) => {
                    const availableSeats = event.sections.reduce(
                        (sum, section) =>
                            sum +
                            section.seats.filter((seat) => seat.status === 'AVAILABLE').length,
                        0
                    )
                    return (
                        <Link
                            key={event.id}
                            href={`/events/${event.id}`}
                            className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                    {event.sport.name} · {event.league}
                                </span>
                                <EventStatusBadge
                                    status={event.status}
                                    startTime={event.startTime.toISOString()}
                                />
                            </div>
                            <div className="text-lg font-semibold">
                                {event.homeTeam.shortName} vs {event.awayTeam.shortName}
                            </div>
                            <div className="text-sm text-slate-600">
                                {event.venue.name}, {event.venue.city}
                            </div>
                            <div className="text-sm text-slate-600">
                                {new Date(event.startTime).toLocaleString('en-US', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                })}
                            </div>
                            <div className="mt-auto text-sm font-medium">
                                {availableSeats === 0 ? (
                                    <span className="text-red-600">Sold out — join waitlist</span>
                                ) : (
                                    <span className="text-emerald-600">
                                        {availableSeats} seats available
                                    </span>
                                )}
                            </div>
                        </Link>
                    )
                })}
                {events.length === 0 && (
                    <p className="text-slate-600">No events match these filters.</p>
                )}
            </div>
        </div>
    )
}

function FilterLink({
    href,
    label,
    active,
    subtle,
}: {
    href: string
    label: string
    active: boolean
    subtle?: boolean
}) {
    return (
        <Link
            href={href}
            className={`rounded-full border px-3 py-1 ${subtle ? 'text-xs' : 'text-sm font-medium'} ${
                active
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-400'
            }`}
        >
            {label}
        </Link>
    )
}
