import { prisma } from '@/lib/db'
import { AdminEventForm } from '@/components/admin/AdminEventForm'

export default async function NewEventPage() {
    const [sports, teams, venues] = await Promise.all([
        prisma.sport.findMany({ orderBy: { name: 'asc' } }),
        prisma.team.findMany({ orderBy: { name: 'asc' } }),
        prisma.venue.findMany({ include: { sections: true }, orderBy: { name: 'asc' } }),
    ])

    return (
        <div>
            <h1 className="mb-4 text-2xl font-bold">New event</h1>
            <AdminEventForm sports={sports} teams={teams} venues={venues} />
        </div>
    )
}
