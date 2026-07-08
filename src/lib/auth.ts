import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import type { Role } from '@/generated/prisma'

const SESSION_COOKIE = 'matchday_session'
const JWT_SECRET = process.env.SESSION_SECRET ?? 'dev-only-insecure-secret-change-me'

export type SessionPayload = {
    userId: string
    role: Role
}

export const hashPassword = (password: string) => bcrypt.hash(password, 10)

export const verifyPassword = (password: string, hash: string) =>
    bcrypt.compare(password, hash)

export const createSessionCookie = async (payload: SessionPayload) => {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
    const store = await cookies()
    store.set(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
    })
}

export const clearSessionCookie = async () => {
    const store = await cookies()
    store.delete(SESSION_COOKIE)
}

export const getSession = async (): Promise<SessionPayload | null> => {
    const store = await cookies()
    const token = store.get(SESSION_COOKIE)?.value
    if (!token) return null
    try {
        return jwt.verify(token, JWT_SECRET) as SessionPayload
    } catch {
        return null
    }
}

export const getCurrentUser = async () => {
    const session = await getSession()
    if (!session) return null
    return prisma.user.findUnique({ where: { id: session.userId } })
}

export const requireAdminSession = async (): Promise<SessionPayload | null> => {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return null
    return session
}
