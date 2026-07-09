import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { sportStyleFor } from '@/lib/sportStyle'
import { EventStatusBadge } from '@/components/EventStatusBadge'
import { FollowButton } from '@/components/FollowButton'
import { getSession } from '@/lib/auth'

export default async function TeamDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const team = await prisma.team.findUnique({
        where: { id },
        include: { sport: true },
    })
    if (!team) notFound()

    const session = await getSession()
    const existingFavorite = session
        ? await prisma.favorite.findUnique({
              where: { userId_teamId: { userId: session.userId, teamId: id } },
          })
        : null

    const events = await prisma.event.findMany({
        where: { OR: [{ homeTeamId: id }, { awayTeamId: id }] },
        include: { homeTeam: true, awayTeam: true, venue: true, sport: true },
        orderBy: { startTime: 'asc' },
    })

    const upcoming = events.filter((e) => e.status === 'UPCOMING' || e.status === 'LIVE')
    const past = events
        .filter((e) => e.status === 'FINISHED' || e.status === 'CANCELLED')
        .reverse()

    const style = sportStyleFor(team.sport.slug)

    return (
        <div className="flex flex-col gap-8">
            <div
                className={`flex items-center gap-4 rounded-2xl bg-gradient-to-br ${style.gradient} p-6 text-white shadow-lg`}
            >
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl font-extrabold">
                    {team.shortName}
                </span>
                <div className="flex-1">
                    <p className="text-sm font-semibold tracking-wide uppercase opacity-90">
                        {style.icon} {team.sport.name}
                    </p>
                    <h1 className="text-2xl font-extrabold tracking-tight">{team.name}</h1>
                </div>
                <FollowButton
                    teamId={team.id}
                    initialFollowing={!!existingFavorite}
                    loggedIn={!!session}
                />
            </div>

            <FixtureList title="Upcoming & live" events={upcoming} emptyText="No upcoming fixtures." />
            <FixtureList title="Past results" events={past} emptyText="No past fixtures yet." />
        </div>
    )
}

type EventRow = {
    id: string
    league: string
    status: 'UPCOMING' | 'LIVE' | 'FINISHED' | 'CANCELLED'
    startTime: Date
    homeTeam: { shortName: string }
    awayTeam: { shortName: string }
    venue: { name: string; city: string }
}

function FixtureList({
    title,
    events,
    emptyText,
}: {
    title: string
    events: EventRow[]
    emptyText: string
}) {
    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">{title}</h2>
            {events.length === 0 && <p className="text-sm text-slate-600">{emptyText}</p>}
            {events.map((event) => (
                <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
                >
                    <div>
                        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                            {event.league}
                        </p>
                        <p className="font-semibold">
                            {event.homeTeam.shortName} vs {event.awayTeam.shortName}
                        </p>
                        <p className="text-sm text-slate-600">
                            {event.venue.name}, {event.venue.city} ·{' '}
                            {event.startTime.toLocaleString('en-US', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            })}
                        </p>
                    </div>
                    <EventStatusBadge
                        status={event.status}
                        startTime={event.startTime.toISOString()}
                    />
                </Link>
            ))}
        </div>
    )
}
