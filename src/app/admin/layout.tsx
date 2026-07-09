import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
        redirect('/login?redirectTo=/admin')
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex gap-4 border-b border-slate-200 pb-3 text-sm font-medium">
                <Link href="/admin" className="hover:text-rose-600">
                    Dashboard
                </Link>
                <Link href="/admin/events" className="hover:text-rose-600">
                    Events
                </Link>
                <Link href="/admin/venues" className="hover:text-rose-600">
                    Venues
                </Link>
                <Link href="/admin/teams" className="hover:text-rose-600">
                    Teams
                </Link>
            </div>
            {children}
        </div>
    )
}
