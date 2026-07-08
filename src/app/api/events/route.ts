import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')
    const league = searchParams.get('league')
    const status = searchParams.get('status')

    const events = await prisma.event.findMany({
        where: {
            ...(sport ? { sport: { slug: sport } } : {}),
            ...(league ? { league } : {}),
            ...(status ? { status: status as never } : {}),
        },
        include: {
            sport: true,
            homeTeam: true,
            awayTeam: true,
            venue: true,
            sections: { include: { seats: true } },
        },
        orderBy: { startTime: 'asc' },
    })

    const withAvailability = events.map(({ sections, ...event }) => {
        const totalSeats = sections.reduce((sum, section) => sum + section.seats.length, 0)
        const availableSeats = sections.reduce(
            (sum, section) =>
                sum + section.seats.filter((seat) => seat.status === 'AVAILABLE').length,
            0
        )
        return { ...event, totalSeats, availableSeats, soldOut: availableSeats === 0 }
    })

    return NextResponse.json(withAvailability)
}
