import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const bookings = await prisma.booking.findMany({
        where: { userId: session.userId },
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

    return NextResponse.json(bookings)
}
