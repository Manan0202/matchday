import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth'
import { parseJsonBody, isPrismaErrorCode } from '@/lib/http'

export async function GET() {
    const venues = await prisma.venue.findMany({
        include: { sections: true },
        orderBy: { name: 'asc' },
    })
    return NextResponse.json(venues)
}

type SectionInput = { name: string; rows: number; seatsPerRow: number }

export async function POST(request: NextRequest) {
    const admin = await requireAdminSession()
    if (!admin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const parsed = await parseJsonBody<{
        name?: string
        city?: string
        capacity?: number
        sections?: SectionInput[]
    }>(request)
    if (!parsed.ok) return parsed.response
    const { name, city, capacity, sections } = parsed.data

    if (!name || !city || !capacity || !sections || sections.length === 0) {
        return NextResponse.json(
            { error: 'name, city, capacity, and at least one section are required' },
            { status: 400 }
        )
    }

    const sectionNames = new Set(sections.map((s) => s.name))
    if (sectionNames.size !== sections.length) {
        return NextResponse.json(
            { error: 'Section names must be unique within a venue' },
            { status: 400 }
        )
    }

    try {
        const venue = await prisma.venue.create({
            data: {
                name,
                city,
                capacity,
                sections: {
                    create: sections.map((s) => ({
                        name: s.name,
                        rows: s.rows,
                        seatsPerRow: s.seatsPerRow,
                    })),
                },
            },
            include: { sections: true },
        })
        return NextResponse.json(venue, { status: 201 })
    } catch (error) {
        if (isPrismaErrorCode(error, 'P2002')) {
            return NextResponse.json(
                { error: 'A section with this name already exists in this venue' },
                { status: 409 }
            )
        }
        throw error
    }
}
