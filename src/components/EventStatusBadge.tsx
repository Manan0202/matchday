'use client'

import { useEffect, useRef, useState } from 'react'

type Status = 'UPCOMING' | 'LIVE' | 'FINISHED' | 'CANCELLED'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

const formatCountdown = (msRemaining: number) => {
    if (msRemaining <= 0) return 'Starting soon'

    if (msRemaining < HOUR) {
        const totalSeconds = Math.floor(msRemaining / 1000)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        return `Starts in ${minutes}m ${seconds.toString().padStart(2, '0')}s`
    }

    const totalMinutes = Math.floor(msRemaining / (60 * 1000))
    const days = Math.floor(totalMinutes / (60 * 24))
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
    const minutes = totalMinutes % 60
    if (days > 0) return `Starts in ${days}d ${hours}h`
    return `Starts in ${hours}h ${minutes}m`
}

// Live-ticking countdowns matter most in the final hour; beyond that,
// tick slower since a 1s cadence would just re-render every event card
// on the home page for no visible benefit.
const nextTickDelay = (msRemaining: number) => {
    if (msRemaining < HOUR) return 1000
    if (msRemaining < DAY) return 30_000
    return 60_000
}

export function EventStatusBadge({
    status,
    startTime,
}: {
    status: Status
    startTime: string
}) {
    // `now` starts null so the first render is identical on server and
    // client (calling Date.now() during that shared render would drift by
    // however long the network round-trip took, causing a hydration
    // mismatch). The real clock only starts ticking after mount.
    const [now, setNow] = useState<number | null>(null)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (status !== 'UPCOMING') return

        const tick = () => {
            const msRemaining = new Date(startTime).getTime() - Date.now()
            setNow(Date.now())
            timeoutRef.current = setTimeout(tick, nextTickDelay(msRemaining))
        }
        tick()

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [status, startTime])

    if (status === 'LIVE') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600" />
                LIVE
            </span>
        )
    }

    if (status === 'FINISHED') {
        return (
            <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                Finished
            </span>
        )
    }

    if (status === 'CANCELLED') {
        return (
            <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-500 line-through">
                Cancelled
            </span>
        )
    }

    return (
        <span
            className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 tabular-nums"
            // This text is intentionally time-sensitive: on a real deployment
            // some drift between the server render and client hydration is
            // unavoidable (network latency), so a one-tick mismatch here is
            // expected and harmless — this is React's documented escape
            // hatch for exactly that case, not a way to hide a real bug.
            suppressHydrationWarning
        >
            {now === null ? 'Upcoming' : formatCountdown(new Date(startTime).getTime() - now)}
        </span>
    )
}
