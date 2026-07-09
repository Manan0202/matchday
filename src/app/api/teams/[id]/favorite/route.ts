import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id: teamId } = await params

    const existing = await prisma.favorite.findUnique({
        where: { userId_teamId: { userId: session.userId, teamId } },
    })

    if (existing) {
        await prisma.favorite.delete({ where: { id: existing.id } })
        return NextResponse.json({ favorited: false })
    }

    await prisma.favorite.create({ data: { userId: session.userId, teamId } })
    return NextResponse.json({ favorited: true })
}
