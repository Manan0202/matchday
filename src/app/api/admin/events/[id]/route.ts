import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth'
import { parseJsonBody } from '@/lib/http'
import type { EventStatus } from '@/generated/prisma'

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await requireAdminSession()
    if (!admin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const parsed = await parseJsonBody<{ status?: EventStatus }>(request)
    if (!parsed.ok) return parsed.response
    const { status } = parsed.data

    if (!status) {
        return NextResponse.json({ error: 'status is required' }, { status: 400 })
    }

    const event = await prisma.event.update({ where: { id }, data: { status } })
    return NextResponse.json(event)
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await requireAdminSession()
    if (!admin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params

    await prisma.$transaction(async (tx) => {
        const eventSections = await tx.eventSection.findMany({
            where: { eventId: id },
            select: { id: true },
        })
        const sectionIds = eventSections.map((es) => es.id)

        const seats = await tx.seat.findMany({
            where: { eventSectionId: { in: sectionIds } },
            select: { id: true },
        })
        const seatIds = seats.map((s) => s.id)

        await tx.bookingSeat.deleteMany({ where: { seatId: { in: seatIds } } })
        await tx.seat.deleteMany({ where: { eventSectionId: { in: sectionIds } } })
        await tx.eventSection.deleteMany({ where: { eventId: id } })
        await tx.waitlistEntry.deleteMany({ where: { eventId: id } })
        await tx.event.delete({ where: { id } })
    })

    return NextResponse.json({ ok: true })
}
