import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth'
import { parseJsonBody } from '@/lib/http'
import { Prisma } from '@/generated/prisma'

export async function GET() {
    const teams = await prisma.team.findMany({
        include: { sport: true },
        orderBy: { name: 'asc' },
    })
    return NextResponse.json(teams)
}

export async function POST(request: NextRequest) {
    const admin = await requireAdminSession()
    if (!admin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const parsed = await parseJsonBody<{
        name?: string
        shortName?: string
        sportId?: string
    }>(request)
    if (!parsed.ok) return parsed.response
    const { name, shortName, sportId } = parsed.data

    if (!name || !shortName || !sportId) {
        return NextResponse.json(
            { error: 'name, shortName, and sportId are required' },
            { status: 400 }
        )
    }

    try {
        const team = await prisma.team.create({ data: { name, shortName, sportId } })
        return NextResponse.json(team, { status: 201 })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return NextResponse.json(
                { error: 'A team with this name already exists for this sport' },
                { status: 409 }
            )
        }
        throw error
    }
}
