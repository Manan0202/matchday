import Link from 'next/link'

export function Footer() {
    return (
        <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
            <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:flex-row sm:justify-between">
                <div className="max-w-xs">
                    <p className="text-lg font-bold tracking-tight text-white">
                        Match<span className="text-rose-500">Day</span>
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                        Book tickets for the biggest football, cricket, and basketball fixtures —
                        live status, real seat maps, instant confirmation.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                    <div className="flex flex-col gap-2 text-sm">
                        <p className="font-semibold text-white">Company</p>
                        <Link href="/about" className="text-slate-400 transition-colors hover:text-rose-400">
                            About
                        </Link>
                        <Link href="/help" className="text-slate-400 transition-colors hover:text-rose-400">
                            Help &amp; FAQ
                        </Link>
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                        <p className="font-semibold text-white">Browse</p>
                        <Link href="/" className="text-slate-400 transition-colors hover:text-rose-400">
                            Events
                        </Link>
                        <Link href="/teams" className="text-slate-400 transition-colors hover:text-rose-400">
                            Teams
                        </Link>
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                        <p className="font-semibold text-white">Support</p>
                        <a
                            href="mailto:support@matchday.example"
                            className="text-slate-400 transition-colors hover:text-rose-400"
                        >
                            support@matchday.example
                        </a>
                    </div>
                </div>
            </div>
            <div className="border-t border-slate-900 px-4 py-4 text-center text-xs text-slate-500">
                © {new Date().getFullYear()} MatchDay. A demo ticket-booking app.
            </div>
        </footer>
    )
}
