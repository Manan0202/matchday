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
