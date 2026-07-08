export default function AdminEventsLoading() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="skeleton h-7 w-32 rounded" />
                <div className="skeleton h-9 w-28 rounded" />
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 border-b border-slate-100 p-4 last:border-0">
                        <div className="skeleton h-4 w-28 rounded" />
                        <div className="skeleton h-4 w-32 rounded" />
                        <div className="skeleton h-4 w-24 rounded" />
                        <div className="skeleton h-4 w-28 rounded" />
                    </div>
                ))}
            </div>
        </div>
    )
}
