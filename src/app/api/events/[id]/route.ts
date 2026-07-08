import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const event = await prisma.event.findUnique({
        where: { id },
        include: {
            sport: true,
            homeTeam: true,
            awayTeam: true,
            venue: true,
            sections: {
                include: { section: true, seats: { orderBy: [{ row: 'asc' }, { number: 'asc' }] } },
            },
        },
    })

    if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json(event)
}
