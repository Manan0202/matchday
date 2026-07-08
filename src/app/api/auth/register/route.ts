import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, createSessionCookie } from '@/lib/auth'
import { parseJsonBody } from '@/lib/http'

export async function POST(request: NextRequest) {
    const parsed = await parseJsonBody<{
        email?: string
        password?: string
        name?: string
    }>(request)
    if (!parsed.ok) return parsed.response
    const { email, password, name } = parsed.data

    if (!email || !password || !name) {
        return NextResponse.json(
            { error: 'email, password, and name are required' },
            { status: 400 }
        )
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        return NextResponse.json(
            { error: 'An account with this email already exists' },
            { status: 409 }
        )
    }

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
        data: { email, name, passwordHash },
    })

    await createSessionCookie({ userId: user.id, role: user.role })

    return NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    })
}
