'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

type Me = { id: string; name: string; role: 'USER' | 'ADMIN' } | null

export function Nav() {
    const pathname = usePathname()
    const [me, setMe] = useState<Me>(null)
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        // Re-check auth on every route change too, not just on mount — the Nav
        // stays mounted across client-side navigation (App Router layouts
        // persist), so without this it keeps showing stale logged-out state
        // right after login/register redirects to another page.
        fetch('/api/me')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => setMe(data))
            .finally(() => setLoaded(true))
    }, [pathname])

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        setMe(null)
        window.location.href = '/'
    }

    return (
        <nav className="border-b border-rose-900/40 bg-slate-950 text-slate-100">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                <Link href="/" className="flex items-center gap-1.5 text-lg font-bold tracking-tight">
                    Match<span className="text-rose-500">Day</span>
                </Link>
                <div className="flex items-center gap-4 text-sm">
                    <Link href="/" className="transition-colors hover:text-rose-400">
                        Events
                    </Link>
                    <Link href="/teams" className="transition-colors hover:text-rose-400">
                        Teams
                    </Link>
                    {loaded && me && (
                        <Link href="/bookings" className="transition-colors hover:text-rose-400">
                            My Bookings
                        </Link>
                    )}
                    {loaded && me?.role === 'ADMIN' && (
                        <Link href="/admin" className="transition-colors hover:text-rose-400">
                            Admin
                        </Link>
                    )}
                    {loaded && !me && (
                        <>
                            <Link href="/login" className="transition-colors hover:text-rose-400">
                                Log in
                            </Link>
                            <Link
                                href="/register"
                                className="rounded bg-rose-600 px-3 py-1.5 font-medium text-white transition-transform duration-150 hover:bg-rose-500 active:scale-95"
                            >
                                Sign up
                            </Link>
                        </>
                    )}
                    {loaded && me && (
                        <button
                            onClick={handleLogout}
                            className="transition-transform duration-150 hover:text-rose-400 active:scale-95"
                        >
                            Log out ({me.name})
                        </button>
                    )}
                </div>
            </div>
        </nav>
    )
}
