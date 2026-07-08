import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: eventId } = await params
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const entry = await prisma.waitlistEntry.upsert({
        where: { eventId_userId: { eventId, userId: session.userId } },
        update: {},
        create: { eventId, userId: session.userId },
    })

    return NextResponse.json(entry, { status: 201 })
}
