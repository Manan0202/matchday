export default function TeamsLoading() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <div className="skeleton h-8 w-40 rounded" />
                <div className="skeleton h-4 w-72 rounded" />
            </div>
            {[0, 1, 2].map((section) => (
                <div key={section} className="flex flex-col gap-3">
                    <div className="skeleton h-5 w-32 rounded" />
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white p-4"
                            >
                                <div className="skeleton h-12 w-12 rounded-full" />
                                <div className="skeleton h-3 w-20 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
