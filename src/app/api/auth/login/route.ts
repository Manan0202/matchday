import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword, createSessionCookie } from '@/lib/auth'
import { parseJsonBody } from '@/lib/http'

export async function POST(request: NextRequest) {
    const parsed = await parseJsonBody<{ email?: string; password?: string }>(request)
    if (!parsed.ok) return parsed.response
    const { email, password } = parsed.data

    if (!email || !password) {
        return NextResponse.json(
            { error: 'email and password are required' },
            { status: 400 }
        )
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
        return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
        )
    }

    await createSessionCookie({ userId: user.id, role: user.role })

    return NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    })
}
