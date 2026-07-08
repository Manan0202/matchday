import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { EventStatusBadge } from '@/components/EventStatusBadge'
import { SeatMap } from '@/components/SeatMap'
import { WaitlistButton } from '@/components/WaitlistButton'

export default async function EventDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const event = await prisma.event.findUnique({
        where: { id },
        include: {
            sport: true,
            homeTeam: true,
            awayTeam: true,
            venue: true,
            sections: {
                include: {
                    section: true,
                    seats: { orderBy: [{ row: 'asc' }, { number: 'asc' }] },
                },
            },
        },
    })

    if (!event) notFound()

    const availableSeats = event.sections.reduce(
        (sum, section) =>
            sum + section.seats.filter((seat) => seat.status === 'AVAILABLE').length,
        0
    )

    const seatMapSections = event.sections.map((es) => ({
        id: es.id,
        name: es.section.name,
        price: es.price,
        seats: es.seats,
    }))

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between">
                <div>
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {event.sport.name} · {event.league}
                    </span>
                    <h1 className="text-2xl font-bold">
                        {event.homeTeam.name} vs {event.awayTeam.name}
                    </h1>
                    <p className="text-slate-600">
                        {event.venue.name}, {event.venue.city} ·{' '}
                        {new Date(event.startTime).toLocaleString('en-US', {
                            dateStyle: 'full',
                            timeStyle: 'short',
                        })}
                    </p>
                </div>
                <EventStatusBadge
                    status={event.status}
                    startTime={event.startTime.toISOString()}
                />
            </div>

            {availableSeats > 0 ? (
                <SeatMap eventId={event.id} sections={seatMapSections} />
            ) : (
                <WaitlistButton eventId={event.id} />
            )}
        </div>
    )
}
