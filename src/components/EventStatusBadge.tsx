'use client'

import { useEffect, useState } from 'react'

type Status = 'UPCOMING' | 'LIVE' | 'FINISHED' | 'CANCELLED'

const formatCountdown = (msRemaining: number) => {
    if (msRemaining <= 0) return 'Starting soon'
    const totalMinutes = Math.floor(msRemaining / (60 * 1000))
    const days = Math.floor(totalMinutes / (60 * 24))
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
    const minutes = totalMinutes % 60
    if (days > 0) return `Starts in ${days}d ${hours}h`
    if (hours > 0) return `Starts in ${hours}h ${minutes}m`
    return `Starts in ${minutes}m`
}

export function EventStatusBadge({
    status,
    startTime,
}: {
    status: Status
    startTime: string
}) {
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        if (status !== 'UPCOMING') return
        const interval = setInterval(() => setNow(Date.now()), 30_000)
        return () => clearInterval(interval)
    }, [status])

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

    const msRemaining = new Date(startTime).getTime() - now

    return (
        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            {formatCountdown(msRemaining)}
        </span>
    )
}
