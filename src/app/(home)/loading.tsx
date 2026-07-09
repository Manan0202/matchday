export default function HomeLoading() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <div className="skeleton h-7 w-64 rounded" />
                <div className="skeleton h-4 w-80 rounded" />
            </div>
            <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="skeleton h-7 w-20 rounded-full" />
                ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4"
                    >
                        <div className="skeleton h-3 w-32 rounded" />
                        <div className="skeleton h-5 w-40 rounded" />
                        <div className="skeleton h-3 w-48 rounded" />
                        <div className="skeleton h-3 w-36 rounded" />
                    </div>
                ))}
            </div>
        </div>
    )
}
