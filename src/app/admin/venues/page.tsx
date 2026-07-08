import { prisma } from '@/lib/db'
import { AdminVenuesClient } from '@/components/admin/AdminVenuesClient'

export default async function AdminVenuesPage() {
    const venues = await prisma.venue.findMany({
        include: { sections: true },
        orderBy: { name: 'asc' },
    })

    return (
        <div>
            <h1 className="mb-4 text-2xl font-bold">Venues</h1>
            <AdminVenuesClient venues={venues} />
        </div>
    )
}
