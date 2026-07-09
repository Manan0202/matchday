import Link from 'next/link'
import { prisma } from '@/lib/db'
import { sportStyleFor } from '@/lib/sportStyle'

export const metadata = { title: 'Teams — MatchDay' }

export default async function TeamsPage() {
    const sports = await prisma.sport.findMany({
        include: { teams: { orderBy: { name: 'asc' } } },
        orderBy: { name: 'asc' },
    })

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Teams</h1>
                <p className="mt-1 text-slate-600">
                    Browse by team to see their upcoming and past fixtures.
                </p>
            </div>

            {sports.map((sport) => {
                const style = sportStyleFor(sport.slug)
                return (
                    <div key={sport.id} className="flex flex-col gap-3">
                        <h2 className="flex items-center gap-2 text-lg font-bold">
                            <span>{style.icon}</span>
                            {sport.name}
                        </h2>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {sport.teams.map((team) => (
                                <Link
                                    key={team.id}
                                    href={`/teams/${team.id}`}
                                    className="group flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <span
                                        className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${style.gradient} text-lg font-bold text-white`}
                                    >
                                        {team.shortName}
                                    </span>
                                    <span className="text-sm font-medium text-slate-800 group-hover:text-rose-600">
                                        {team.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
