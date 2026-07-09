'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'

type Sport = { id: string; name: string }
type Team = { id: string; name: string; shortName: string; sport: Sport }

export function AdminTeamsClient({
    teams,
    sports,
}: {
    teams: Team[]
    sports: Sport[]
}) {
    const router = useRouter()
    const { showToast } = useToast()
    const [name, setName] = useState('')
    const [shortName, setShortName] = useState('')
    const [sportId, setSportId] = useState(sports[0]?.id ?? '')
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSubmitting(true)
        try {
            const res = await fetch('/api/admin/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, shortName, sportId }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error ?? 'Something went wrong')
                showToast(data.error ?? 'Something went wrong', 'error')
                return
            }
            showToast(`Added ${name}`, 'success')
            setName('')
            setShortName('')
            router.refresh()
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string, teamName: string) => {
        await fetch(`/api/admin/teams/${id}`, { method: 'DELETE' })
        showToast(`Deleted ${teamName}`, 'info')
        router.refresh()
    }

    return (
        <div className="flex flex-col gap-6">
            <form
                onSubmit={handleCreate}
                className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
            >
                <label className="flex flex-col gap-1 text-sm">
                    Name
                    <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1.5"
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                    Short name
                    <input
                        required
                        value={shortName}
                        onChange={(e) => setShortName(e.target.value)}
                        className="w-24 rounded border border-slate-300 px-2 py-1.5"
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                    Sport
                    <select
                        value={sportId}
                        onChange={(e) => setSportId(e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1.5"
                    >
                        {sports.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </label>
                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded bg-rose-600 px-4 py-1.5 font-medium text-white transition-transform duration-150 hover:bg-rose-500 active:scale-95 disabled:opacity-50"
                >
                    Add team
                </button>
                {error && <p className="text-sm text-red-600">{error}</p>}
            </form>

            <table className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                    <tr>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Short</th>
                        <th className="px-4 py-2">Sport</th>
                        <th className="px-4 py-2" />
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {teams.map((team) => (
                        <tr key={team.id} className="transition-colors hover:bg-slate-50">
                            <td className="px-4 py-2">{team.name}</td>
                            <td className="px-4 py-2">{team.shortName}</td>
                            <td className="px-4 py-2">{team.sport.name}</td>
                            <td className="px-4 py-2 text-right">
                                <button
                                    onClick={() => handleDelete(team.id, team.name)}
                                    className="text-red-600 hover:underline"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
