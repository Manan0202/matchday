import { NextRequest, NextResponse } from 'next/server'

type ParsedBody<T> = { ok: true; data: T } | { ok: false; response: NextResponse }

export async function parseJsonBody<T>(request: NextRequest): Promise<ParsedBody<T>> {
    try {
        const data = (await request.json()) as T
        return { ok: true, data }
    } catch {
        return {
            ok: false,
            response: NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }),
        }
    }
}

// Duck-type the Prisma error code instead of `instanceof
// Prisma.PrismaClientKnownRequestError` — Next.js can bundle the generated
// Prisma client as separate module instances per route, which silently
// breaks that instanceof check even though the thrown error's shape (and
// its `code`) is identical. Checking `.code` directly is robust to that.
export const isPrismaErrorCode = (error: unknown, code: string): boolean =>
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === code
