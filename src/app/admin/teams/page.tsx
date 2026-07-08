import { prisma } from '@/lib/db'
import { AdminTeamsClient } from '@/components/admin/AdminTeamsClient'

export default async function AdminTeamsPage() {
    const [teams, sports] = await Promise.all([
        prisma.team.findMany({ include: { sport: true }, orderBy: { name: 'asc' } }),
        prisma.sport.findMany({ orderBy: { name: 'asc' } }),
    ])

    return (
        <div>
            <h1 className="mb-4 text-2xl font-bold">Teams</h1>
            <AdminTeamsClient teams={teams} sports={sports} />
        </div>
    )
}
