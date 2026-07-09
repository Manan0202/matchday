export const metadata = { title: 'Help & FAQ — MatchDay' }

const FAQS: { question: string; answer: string }[] = [
    {
        question: 'How do I book a ticket?',
        answer:
            'Browse events on the home page, open the one you want, pick your seat(s) on the seat map, then proceed to checkout. You’ll need an account — sign up takes a few seconds.',
    },
    {
        question: 'Can I pick my exact seat?',
        answer:
            'Yes. Every event shows a real seat map broken down by section, with live availability. Sold seats are grayed out; your selection updates the price total instantly.',
    },
    {
        question: 'What happens if an event is sold out?',
        answer:
            'You can join the waitlist from the event page instead of a dead end. If a seat frees up, priority goes to the waitlist.',
    },
    {
        question: 'How do I know if a match is live right now?',
        answer:
            'Every event shows a status badge: a live countdown while it’s upcoming, a pulsing "LIVE" badge once it starts, and "Finished" afterward.',
    },
    {
        question: 'Where can I see my past bookings?',
        answer:
            'Once logged in, "My Bookings" in the nav bar lists every ticket you’ve booked, grouped by event.',
    },
    {
        question: 'I run an event/venue — how do I list it?',
        answer:
            'Venue and event management is handled through the admin panel by the MatchDay team. Reach out at support@matchday.example to get set up.',
    },
]

export default function HelpPage() {
    return (
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Help &amp; FAQ</h1>
                <p className="mt-2 text-slate-600">Answers to the most common questions.</p>
            </div>

            <div className="flex flex-col gap-3">
                {FAQS.map((faq) => (
                    <details
                        key={faq.question}
                        className="group rounded-lg border border-slate-200 bg-white p-4 open:shadow-sm"
                    >
                        <summary className="cursor-pointer list-none font-semibold text-slate-900 marker:content-none">
                            <span className="flex items-center justify-between">
                                {faq.question}
                                <span className="text-rose-600 transition-transform group-open:rotate-45">
                                    +
                                </span>
                            </span>
                        </summary>
                        <p className="mt-2 text-sm text-slate-700">{faq.answer}</p>
                    </details>
                ))}
            </div>

            <p className="text-sm text-slate-600">
                Still stuck? Email{' '}
                <a href="mailto:support@matchday.example" className="text-rose-600 hover:underline">
                    support@matchday.example
                </a>
                .
            </p>
        </div>
    )
}
