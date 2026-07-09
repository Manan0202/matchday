import Link from 'next/link'
import { EventStatusBadge } from '@/components/EventStatusBadge'
import { sportStyleFor } from '@/lib/sportStyle'

type TrendingEvent = {
    id: string
    league: string
    status: 'UPCOMING' | 'LIVE' | 'FINISHED' | 'CANCELLED'
    startTime: string
    sport: { slug: string }
    homeTeam: { shortName: string }
    awayTeam: { shortName: string }
}

export function TrendingStrip({ events }: { events: TrendingEvent[] }) {
    if (events.length === 0) return null

    return (
        <div className="flex flex-col gap-3">
            <h2 className="flex items-center gap-1.5 text-lg font-bold">🔥 Trending this week</h2>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
                {events.map((event) => {
                    const style = sportStyleFor(event.sport.slug)
                    return (
                        <Link
                            key={event.id}
                            href={`/events/${event.id}`}
                            className={`flex w-52 shrink-0 flex-col gap-2 rounded-lg bg-gradient-to-br ${style.gradient} p-4 text-white shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-lg">{style.icon}</span>
                                <EventStatusBadge status={event.status} startTime={event.startTime} />
                            </div>
                            <p className="text-sm font-bold">
                                {event.homeTeam.shortName} vs {event.awayTeam.shortName}
                            </p>
                            <p className="text-xs opacity-90">{event.league}</p>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
