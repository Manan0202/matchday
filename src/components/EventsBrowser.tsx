'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { EventStatusBadge } from '@/components/EventStatusBadge'

type Sport = { id: string; name: string; slug: string }
type EventCard = {
    id: string
    league: string
    status: 'UPCOMING' | 'LIVE' | 'FINISHED' | 'CANCELLED'
    startTime: string
    sport: { name: string; slug: string }
    homeTeam: { shortName: string }
    awayTeam: { shortName: string }
    venue: { name: string; city: string }
    availableSeats: number
}

export function EventsBrowser({
    sports,
    events,
}: {
    sports: Sport[]
    events: EventCard[]
}) {
    const [sportSlug, setSportSlug] = useState<string | null>(null)
    const [league, setLeague] = useState<string | null>(null)

    const sportFiltered = useMemo(
        () => (sportSlug ? events.filter((e) => e.sport.slug === sportSlug) : events),
        [events, sportSlug]
    )
    const leagues = useMemo(
        () => Array.from(new Set(sportFiltered.map((e) => e.league))).sort(),
        [sportFiltered]
    )
    const visibleEvents = useMemo(
        () => (league ? sportFiltered.filter((e) => e.league === league) : sportFiltered),
        [sportFiltered, league]
    )

    const selectSport = (slug: string | null) => {
        setSportSlug(slug)
        setLeague(null)
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
                <FilterButton label="All sports" active={!sportSlug} onClick={() => selectSport(null)} />
                {sports.map((s) => (
                    <FilterButton
                        key={s.id}
                        label={s.name}
                        active={sportSlug === s.slug}
                        onClick={() => selectSport(s.slug)}
                    />
                ))}
            </div>

            {leagues.length > 0 && (
                <div className="flex flex-wrap gap-2 text-sm">
                    <FilterButton
                        label="All leagues"
                        active={!league}
                        onClick={() => setLeague(null)}
                        subtle
                    />
                    {leagues.map((l) => (
                        <FilterButton
                            key={l}
                            label={l}
                            active={league === l}
                            onClick={() => setLeague(l)}
                            subtle
                        />
                    ))}
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                {visibleEvents.map((event, index) => (
                    <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                        className="animate-fade-in-up flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                {event.sport.name} · {event.league}
                            </span>
                            <EventStatusBadge status={event.status} startTime={event.startTime} />
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
                            {event.availableSeats === 0 ? (
                                <span className="text-red-600">Sold out — join waitlist</span>
                            ) : (
                                <span className="text-emerald-600">
                                    {event.availableSeats} seats available
                                </span>
                            )}
                        </div>
                    </Link>
                ))}
                {visibleEvents.length === 0 && (
                    <p className="text-slate-600">No events match these filters.</p>
                )}
            </div>
        </div>
    )
}

function FilterButton({
    label,
    active,
    onClick,
    subtle,
}: {
    label: string
    active: boolean
    onClick: () => void
    subtle?: boolean
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-full border px-3 py-1 transition-all duration-150 active:scale-95 ${subtle ? 'text-xs' : 'text-sm font-medium'} ${
                active
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-400 hover:shadow-sm'
            }`}
        >
            {label}
        </button>
    )
}
