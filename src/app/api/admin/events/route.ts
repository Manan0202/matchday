import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth'
import { parseJsonBody } from '@/lib/http'
import type { EventStatus } from '@/generated/prisma'

type SectionPriceInput = { sectionId: string; price: number }

export async function POST(request: NextRequest) {
    const admin = await requireAdminSession()
    if (!admin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const parsed = await parseJsonBody<{
        sportId?: string
        league?: string
        homeTeamId?: string
        awayTeamId?: string
        venueId?: string
        startTime?: string
        status?: EventStatus
        sectionPrices?: SectionPriceInput[]
    }>(request)
    if (!parsed.ok) return parsed.response
    const {
        sportId,
        league,
        homeTeamId,
        awayTeamId,
        venueId,
        startTime,
        status,
        sectionPrices,
    } = parsed.data

    if (
        !sportId ||
        !league ||
        !homeTeamId ||
        !awayTeamId ||
        !venueId ||
        !startTime ||
        !sectionPrices ||
        sectionPrices.length === 0
    ) {
        return NextResponse.json(
            {
                error:
                    'sportId, league, homeTeamId, awayTeamId, venueId, startTime, and sectionPrices are required',
            },
            { status: 400 }
        )
    }

    if (homeTeamId === awayTeamId) {
        return NextResponse.json(
            { error: 'homeTeamId and awayTeamId must be different' },
            { status: 400 }
        )
    }

    const sections = await prisma.section.findMany({
        where: { id: { in: sectionPrices.map((sp) => sp.sectionId) }, venueId },
    })
    if (sections.length !== sectionPrices.length) {
        return NextResponse.json(
            { error: 'One or more sections do not belong to this venue' },
            { status: 400 }
        )
    }

    const event = await prisma.$transaction(async (tx) => {
        const created = await tx.event.create({
            data: {
                sportId,
                league,
                homeTeamId,
                awayTeamId,
                venueId,
                startTime: new Date(startTime),
                status: status ?? 'UPCOMING',
            },
        })

        for (const sp of sectionPrices) {
            const section = sections.find((s) => s.id === sp.sectionId)!
            const eventSection = await tx.eventSection.create({
                data: { eventId: created.id, sectionId: sp.sectionId, price: sp.price },
            })

            const seatsData = []
            for (let row = 1; row <= section.rows; row++) {
                for (let number = 1; number <= section.seatsPerRow; number++) {
                    seatsData.push({ eventSectionId: eventSection.id, row, number })
                }
            }
            await tx.seat.createMany({ data: seatsData })
        }

        return created
    })

    return NextResponse.json(event, { status: 201 })
}
