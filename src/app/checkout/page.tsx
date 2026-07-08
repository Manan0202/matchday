import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ConfirmBookingButton } from '@/components/ConfirmBookingButton'

export default async function CheckoutPage({
    searchParams,
}: {
    searchParams: Promise<{ event?: string; seats?: string }>
}) {
    const { event: eventId, seats } = await searchParams
    const seatIds = (seats ?? '').split(',').filter(Boolean)

    if (!eventId || seatIds.length === 0) {
        redirect('/')
    }

    const user = await getCurrentUser()
    if (!user) {
        redirect(`/login?redirectTo=/checkout?event=${eventId}&seats=${seats}`)
    }

    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
            homeTeam: true,
            awayTeam: true,
            venue: true,
            sections: { include: { section: true, seats: true } },
        },
    })

    if (!event) redirect('/')

    const selectedSeats = event.sections.flatMap((es) =>
        es.seats
            .filter((seat) => seatIds.includes(seat.id))
            .map((seat) => ({
                seatId: seat.id,
                sectionName: es.section.name,
                row: seat.row,
                number: seat.number,
                price: es.price,
                available: seat.status === 'AVAILABLE',
            }))
    )

    const total = selectedSeats.reduce((sum, seat) => sum + seat.price, 0)
    const anyUnavailable = selectedSeats.some((seat) => !seat.available)

    return (
        <div className="mx-auto flex max-w-lg flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold">Checkout</h1>
                <p className="text-slate-600">
                    {event.homeTeam.shortName} vs {event.awayTeam.shortName} · {event.venue.name}
                </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
                <ul className="divide-y divide-slate-100">
                    {selectedSeats.map((seat) => (
                        <li key={seat.seatId} className="flex justify-between py-2 text-sm">
                            <span>
                                {seat.sectionName} · Row {seat.row}, Seat {seat.number}
                                {!seat.available && (
                                    <span className="ml-2 text-red-600">(no longer available)</span>
                                )}
                            </span>
                            <span>${seat.price.toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>

            {anyUnavailable ? (
                <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    One or more of these seats is no longer available. Go back and pick different
                    seats.
                </p>
            ) : (
                <ConfirmBookingButton eventId={event.id} seatIds={seatIds} />
            )}
        </div>
    )
}
