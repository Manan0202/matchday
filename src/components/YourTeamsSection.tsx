import Link from 'next/link'
import { EventStatusBadge } from '@/components/EventStatusBadge'
import { sportStyleFor } from '@/lib/sportStyle'

type TeamEvent = {
    id: string
    league: string
    status: 'UPCOMING' | 'LIVE' | 'FINISHED' | 'CANCELLED'
    startTime: string
    sport: { slug: string }
    homeTeam: { shortName: string }
    awayTeam: { shortName: string }
    followedTeamName: string
}

export function YourTeamsSection({ events }: { events: TeamEvent[] }) {
    if (events.length === 0) return null

    return (
        <div className="flex flex-col gap-3">
            <h2 className="flex items-center gap-1.5 text-lg font-bold">⭐ Your teams</h2>
            <div className="grid gap-3 sm:grid-cols-2">
                {events.map((event) => {
                    const style = sportStyleFor(event.sport.slug)
                    return (
                        <Link
                            key={event.id}
                            href={`/events/${event.id}`}
                            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{style.icon}</span>
                                <div>
                                    <p className="text-xs font-medium text-slate-500">
                                        Following {event.followedTeamName} · {event.league}
                                    </p>
                                    <p className="font-semibold">
                                        {event.homeTeam.shortName} vs {event.awayTeam.shortName}
                                    </p>
                                </div>
                            </div>
                            <EventStatusBadge status={event.status} startTime={event.startTime} />
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
