import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { parseJsonBody } from '@/lib/http'

class BookingError extends Error {
    constructor(
        message: string,
        public status: number
    ) {
        super(message)
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: eventId } = await params
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const parsed = await parseJsonBody<{ seatIds?: string[] }>(request)
    if (!parsed.ok) return parsed.response
    const { seatIds } = parsed.data
    if (!seatIds || seatIds.length === 0) {
        return NextResponse.json({ error: 'seatIds is required' }, { status: 400 })
    }

    try {
        const booking = await prisma.$transaction(async (tx) => {
            const seats = await tx.seat.findMany({
                where: { id: { in: seatIds }, eventSection: { eventId } },
                include: { eventSection: true },
            })

            if (seats.length !== seatIds.length) {
                throw new BookingError('One or more seats do not belong to this event', 400)
            }

            const totalPrice = seats.reduce(
                (sum, seat) => sum + seat.eventSection.price,
                0
            )

            // Conditional update: only rows still AVAILABLE flip to SOLD. If another
            // booking claimed one of these seats first, the count won't match and
            // we roll back — this is the "last seat" race condition made safe.
            const { count } = await tx.seat.updateMany({
                where: { id: { in: seatIds }, status: 'AVAILABLE' },
                data: { status: 'SOLD' },
            })

            if (count !== seatIds.length) {
                throw new BookingError(
                    'One or more selected seats were just booked by someone else',
                    409
                )
            }

            return tx.booking.create({
                data: {
                    userId: session.userId,
                    totalPrice,
                    seats: { create: seatIds.map((seatId) => ({ seatId })) },
                },
                include: { seats: { include: { seat: true } } },
            })
        })

        return NextResponse.json(booking, { status: 201 })
    } catch (error) {
        if (error instanceof BookingError) {
            return NextResponse.json({ error: error.message }, { status: error.status })
        }
        throw error
    }
}
