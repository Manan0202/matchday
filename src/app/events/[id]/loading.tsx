export default function EventDetailLoading() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                    <div className="skeleton h-3 w-40 rounded" />
                    <div className="skeleton h-7 w-72 rounded" />
                    <div className="skeleton h-4 w-56 rounded" />
                </div>
                <div className="skeleton h-6 w-24 rounded-full" />
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                    <div className="skeleton h-4 w-24 rounded" />
                    <div className="skeleton h-4 w-16 rounded" />
                </div>
                <div className="flex flex-col gap-1.5">
                    {[0, 1, 2, 3].map((row) => (
                        <div key={row} className="flex gap-1.5">
                            {[0, 1, 2, 3, 4, 5, 6, 7].map((seat) => (
                                <div key={seat} className="skeleton h-7 w-7 rounded" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
