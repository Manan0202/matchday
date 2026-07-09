'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'

export function FollowButton({
    teamId,
    initialFollowing,
    loggedIn,
}: {
    teamId: string
    initialFollowing: boolean
    loggedIn: boolean
}) {
    const router = useRouter()
    const { showToast } = useToast()
    const [following, setFollowing] = useState(initialFollowing)
    const [submitting, setSubmitting] = useState(false)

    const handleClick = async () => {
        if (!loggedIn) {
            router.push('/login')
            return
        }
        setSubmitting(true)
        try {
            const res = await fetch(`/api/teams/${teamId}/favorite`, { method: 'POST' })
            const data = await res.json()
            setFollowing(data.favorited)
            showToast(data.favorited ? 'Following team' : 'Unfollowed team', 'info')
            router.refresh()
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={submitting}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-transform duration-150 active:scale-95 disabled:opacity-50 ${
                following
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-white text-rose-700 hover:bg-rose-50'
            }`}
        >
            {following ? '✓ Following' : '+ Follow'}
        </button>
    )
}
