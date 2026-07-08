'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSubmitting(true)
        try {
            const res = await fetch(`/api/auth/${mode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mode === 'register' ? { name, email, password } : { email, password }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error ?? 'Something went wrong')
                return
            }
            const redirectTo = searchParams.get('redirectTo') ?? '/'
            router.push(redirectTo)
            router.refresh()
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-4">
            <h1 className="text-2xl font-bold">
                {mode === 'login' ? 'Log in' : 'Create an account'}
            </h1>
            {mode === 'register' && (
                <label className="flex flex-col gap-1 text-sm">
                    Name
                    <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded border border-slate-300 px-3 py-2"
                        data-testid="name-input"
                    />
                </label>
            )}
            <label className="flex flex-col gap-1 text-sm">
                Email
                <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded border border-slate-300 px-3 py-2"
                    data-testid="email-input"
                />
            </label>
            <label className="flex flex-col gap-1 text-sm">
                Password
                <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded border border-slate-300 px-3 py-2"
                    data-testid="password-input"
                />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
                type="submit"
                disabled={submitting}
                className="rounded bg-emerald-500 px-4 py-2 font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                data-testid="submit-button"
            >
                {mode === 'login' ? 'Log in' : 'Sign up'}
            </button>
        </form>
    )
}
