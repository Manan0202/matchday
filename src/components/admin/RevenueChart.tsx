// Single series (revenue by sport) — one consistent brand color, no
// legend needed since the title already names what's plotted.
export function RevenueChart({ data }: { data: { label: string; value: number }[] }) {
    const max = Math.max(...data.map((d) => d.value), 1)

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="mb-4 font-semibold">Revenue by sport</h3>
            <div className="flex flex-col gap-3">
                {data.map((d) => (
                    <div key={d.label} className="group flex items-center gap-3">
                        <span className="w-20 shrink-0 text-sm text-[#52514e]">{d.label}</span>
                        <div className="relative flex-1">
                            <div
                                className="h-6 max-w-full rounded-r bg-rose-600 transition-[filter] group-hover:brightness-110"
                                style={{ width: `${Math.max((d.value / max) * 100, 2)}%` }}
                                title={`${d.label}: $${d.value.toLocaleString()}`}
                            />
                        </div>
                        <span className="w-20 shrink-0 text-right text-sm font-semibold tabular-nums">
                            ${d.value.toLocaleString()}
                        </span>
                    </div>
                ))}
                {data.every((d) => d.value === 0) && (
                    <p className="text-sm text-[#898781]">No bookings yet.</p>
                )}
            </div>
        </div>
    )
}
