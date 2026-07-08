import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth'

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await requireAdminSession()
    if (!admin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    await prisma.venue.delete({ where: { id } })
    return NextResponse.json({ ok: true })
}
