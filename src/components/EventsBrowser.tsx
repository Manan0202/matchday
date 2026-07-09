'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { EventStatusBadge } from '@/components/EventStatusBadge'
import { sportStyleFor } from '@/lib/sportStyle'

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
                        label={`${sportStyleFor(s.slug).icon} ${s.name}`}
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

            <div className="grid gap-5 sm:grid-cols-2">
                {visibleEvents.map((event, index) => {
                    const style = sportStyleFor(event.sport.slug)
                    return (
                        <Link
                            key={event.id}
                            href={`/events/${event.id}`}
                            style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                            className="animate-fade-in-up group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-150 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:shadow-md"
                        >
                            <div
                                className={`relative flex items-center justify-between bg-gradient-to-br ${style.gradient} px-4 py-3 text-white`}
                            >
                                <span className="text-xs font-semibold tracking-wide uppercase opacity-90">
                                    {event.sport.name} · {event.league}
                                </span>
                                <span className="text-2xl drop-shadow-sm">{style.icon}</span>
                            </div>
                            <div className="flex flex-1 flex-col gap-2 p-4">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="text-lg font-bold">
                                        {event.homeTeam.shortName}{' '}
                                        <span className="font-normal text-slate-400">vs</span>{' '}
                                        {event.awayTeam.shortName}
                                    </div>
                                    <EventStatusBadge status={event.status} startTime={event.startTime} />
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
                                <div className="mt-auto flex items-center justify-between pt-2">
                                    {event.availableSeats === 0 ? (
                                        <span className="text-sm font-semibold text-red-600">
                                            Sold out — join waitlist
                                        </span>
                                    ) : (
                                        <span className="text-sm font-semibold text-emerald-600">
                                            {event.availableSeats} seats available
                                        </span>
                                    )}
                                    <span className="text-sm font-semibold text-rose-600 opacity-0 transition-opacity group-hover:opacity-100">
                                        Book now →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    )
                })}
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
                    ? 'border-rose-600 bg-rose-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-rose-400 hover:shadow-sm'
            }`}
        >
            {label}
        </button>
    )
}
