'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'

export function WaitlistButton({ eventId }: { eventId: string }) {
    const router = useRouter()
    const { showToast } = useToast()
    const [state, setState] = useState<'idle' | 'joined' | 'error'>('idle')
    const [submitting, setSubmitting] = useState(false)

    const handleJoin = async () => {
        setSubmitting(true)
        try {
            const res = await fetch(`/api/events/${eventId}/waitlist`, { method: 'POST' })
            if (res.status === 401) {
                router.push(`/login?redirectTo=${encodeURIComponent(`/events/${eventId}`)}`)
                return
            }
            setState(res.ok ? 'joined' : 'error')
            showToast(
                res.ok ? "You're on the waitlist!" : 'Something went wrong. Try again.',
                res.ok ? 'success' : 'error'
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (state === 'joined') {
        return (
            <div
                className="animate-fade-in-up rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-emerald-800"
                data-testid="waitlist-joined"
            >
                You&apos;re on the waitlist — we&apos;ll notify you if a seat opens up.
            </div>
        )
    }

    return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="mb-3 font-medium text-red-800">This event is sold out.</p>
            <button
                onClick={handleJoin}
                disabled={submitting}
                data-testid="join-waitlist"
                className="rounded bg-slate-900 px-4 py-2 font-medium text-white transition-transform duration-150 hover:bg-slate-700 active:scale-95 disabled:opacity-50"
            >
                Join waitlist
            </button>
            {state === 'error' && (
                <p className="mt-2 text-sm text-red-600">Something went wrong. Try again.</p>
            )}
        </div>
    )
}
