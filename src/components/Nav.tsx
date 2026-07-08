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
        <nav className="border-b border-slate-800 bg-slate-950 text-slate-100">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                <Link href="/" className="text-lg font-bold tracking-tight">
                    MatchDay
                </Link>
                <div className="flex items-center gap-4 text-sm">
                    <Link href="/" className="hover:text-emerald-400">
                        Events
                    </Link>
                    {loaded && me && (
                        <Link href="/bookings" className="hover:text-emerald-400">
                            My Bookings
                        </Link>
                    )}
                    {loaded && me?.role === 'ADMIN' && (
                        <Link href="/admin" className="hover:text-emerald-400">
                            Admin
                        </Link>
                    )}
                    {loaded && !me && (
                        <>
                            <Link href="/login" className="hover:text-emerald-400">
                                Log in
                            </Link>
                            <Link
                                href="/register"
                                className="rounded bg-emerald-500 px-3 py-1.5 font-medium text-slate-950 hover:bg-emerald-400"
                            >
                                Sign up
                            </Link>
                        </>
                    )}
                    {loaded && me && (
                        <button
                            onClick={handleLogout}
                            className="transition-transform duration-150 hover:text-emerald-400 active:scale-95"
                        >
                            Log out ({me.name})
                        </button>
                    )}
                </div>
            </div>
        </nav>
    )
}
