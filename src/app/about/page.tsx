export const metadata = { title: 'About — MatchDay' }

export default function AboutPage() {
    return (
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">About MatchDay</h1>
                <p className="mt-2 text-slate-600">
                    A simpler way to get to the game.
                </p>
            </div>

            <p className="text-slate-700">
                MatchDay started with a simple frustration: booking a seat for a match
                shouldn&apos;t mean juggling five different club sites, guessing whether a seat
                is actually available, or finding out at checkout that the section you wanted
                sold out an hour ago. We wanted one place to browse football, cricket, and
                basketball fixtures across leagues, see a real seat map before you commit, and
                get instant confirmation.
            </p>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="font-semibold">What makes MatchDay different</h2>
                <ul className="mt-3 flex flex-col gap-2 text-sm text-slate-700">
                    <li>
                        <strong>Real seat maps.</strong> Pick your exact seat, not just a ticket
                        tier — see what&apos;s available, section by section.
                    </li>
                    <li>
                        <strong>Live status, not stale listings.</strong> Matches show as
                        upcoming, live, or finished with a real countdown, so you always know
                        where things stand.
                    </li>
                    <li>
                        <strong>A waitlist that actually works.</strong> Sold out doesn&apos;t
                        mean dead end — join the waitlist and we&apos;ll let you know if a seat
                        frees up.
                    </li>
                </ul>
            </div>

            <p className="text-slate-700">
                MatchDay is a demo ticket-booking application — built to explore what a fast,
                seat-level booking experience could look like across multiple sports in one
                place.
            </p>
        </div>
    )
}
