import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export default async function BookingsPage({
    searchParams,
}: {
    searchParams: Promise<{ confirmed?: string }>
}) {
    const { confirmed } = await searchParams
    const user = await getCurrentUser()
    if (!user) {
        redirect('/login?redirectTo=/bookings')
    }

    const bookings = await prisma.booking.findMany({
        where: { userId: user.id },
        include: {
            seats: {
                include: {
                    seat: {
                        include: {
                            eventSection: {
                                include: {
                                    section: true,
                                    event: {
                                        include: { homeTeam: true, awayTeam: true, venue: true, sport: true },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">My Bookings</h1>

            {confirmed && (
                <p
                    className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
                    data-testid="booking-confirmed-banner"
                >
                    Booking confirmed! Your tickets are below.
                </p>
            )}

            {bookings.length === 0 && (
                <p className="text-slate-600">You haven&apos;t booked any tickets yet.</p>
            )}

            <div className="flex flex-col gap-4">
                {bookings.map((booking) => {
                    const event = booking.seats[0]?.seat.eventSection.event
                    if (!event) return null
                    return (
                        <div
                            key={booking.id}
                            data-testid={`booking-${booking.id}`}
                            className={`rounded-lg border bg-white p-4 shadow-sm ${
                                confirmed === booking.id ? 'border-emerald-400' : 'border-slate-200'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                    {event.sport.name} · {event.league}
                                </span>
                                <span className="text-sm text-slate-600">
                                    {new Date(event.startTime).toLocaleDateString('en-US')}
                                </span>
                            </div>
                            <p className="text-lg font-semibold">
                                {event.homeTeam.shortName} vs {event.awayTeam.shortName}
                            </p>
                            <p className="text-sm text-slate-600">
                                {event.venue.name}, {event.venue.city}
                            </p>
                            <ul className="mt-2 text-sm text-slate-700">
                                {booking.seats.map((bs) => (
                                    <li key={bs.id}>
                                        {bs.seat.eventSection.section.name} · Row {bs.seat.row}, Seat{' '}
                                        {bs.seat.number}
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-2 font-bold">${booking.totalPrice.toFixed(2)}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
