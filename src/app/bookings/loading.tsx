export default function BookingsLoading() {
    return (
        <div className="flex flex-col gap-6">
            <div className="skeleton h-7 w-48 rounded" />
            <div className="flex flex-col gap-4">
                {[0, 1].map((i) => (
                    <div key={i} className="rounded-lg border border-slate-200 bg-white p-4">
                        <div className="skeleton mb-2 h-3 w-32 rounded" />
                        <div className="skeleton mb-2 h-5 w-48 rounded" />
                        <div className="skeleton h-3 w-40 rounded" />
                    </div>
                ))}
            </div>
        </div>
    )
}
