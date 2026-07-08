'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ConfirmBookingButton({
    eventId,
    seatIds,
}: {
    eventId: string
    seatIds: string[]
}) {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const handleConfirm = async () => {
        setSubmitting(true)
        setError(null)
        try {
            const res = await fetch(`/api/events/${eventId}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seatIds }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error ?? 'Something went wrong')
                return
            }
            router.push(`/bookings?confirmed=${data.id}`)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col gap-3">
            {error && (
                <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700" data-testid="booking-error">
                    {error}
                </p>
            )}
            <button
                onClick={handleConfirm}
                disabled={submitting}
                data-testid="confirm-booking"
                className="rounded bg-emerald-500 px-5 py-2.5 font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
            >
                {submitting ? 'Confirming…' : 'Confirm booking'}
            </button>
        </div>
    )
}
