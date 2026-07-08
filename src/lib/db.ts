import { PrismaClient } from '@/generated/prisma'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

// Reuse a single PrismaClient across Next.js dev hot-reloads to avoid
// exhausting the SQLite connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

const createPrismaClient = () => {
    // Turso (libSQL) in production/preview — Vercel's filesystem is
    // read-only/ephemeral, so a local SQLite file can't persist writes there.
    if (process.env.TURSO_DATABASE_URL) {
        const adapter = new PrismaLibSQL({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
        })
        return new PrismaClient({ adapter })
    }
    // Local dev: plain file-based SQLite via DATABASE_URL.
    return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}
