// Two series (sold vs available) — reuses the same red/emerald semantics
// used everywhere else in the app ("Sold out" / "X seats available"),
// validated for CVD-safe contrast at ΔE 23.0. A legend is required since
// there are two series; identity never rides on color alone here because
// each segment also gets a native tooltip with the exact counts.
export function SeatsChart({
    data,
}: {
    data: { label: string; sold: number; available: number }[]
}) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Seats sold vs available</h3>
                <div className="flex items-center gap-3 text-xs text-[#52514e]">
                    <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm bg-red-600" /> Sold
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" /> Available
                    </span>
                </div>
            </div>
            <div className="flex flex-col gap-3">
                {data.map((d) => {
                    const total = d.sold + d.available
                    const soldPct = total > 0 ? (d.sold / total) * 100 : 0
                    const availablePct = total > 0 ? (d.available / total) * 100 : 0
                    return (
                        <div key={d.label} className="flex items-center gap-3">
                            <span className="w-32 shrink-0 truncate text-sm text-[#52514e]" title={d.label}>
                                {d.label}
                            </span>
                            <div className="flex h-6 flex-1 gap-0.5 overflow-hidden rounded">
                                {d.sold > 0 && (
                                    <div
                                        className="h-full bg-red-600 transition-[filter] hover:brightness-110"
                                        style={{ width: `${soldPct}%` }}
                                        title={`${d.label}: ${d.sold} sold`}
                                    />
                                )}
                                {d.available > 0 && (
                                    <div
                                        className="h-full bg-emerald-600 transition-[filter] hover:brightness-110"
                                        style={{ width: `${availablePct}%` }}
                                        title={`${d.label}: ${d.available} available`}
                                    />
                                )}
                            </div>
                            <span className="w-16 shrink-0 text-right text-xs text-[#898781] tabular-nums">
                                {d.sold}/{total}
                            </span>
                        </div>
                    )
                })}
                {data.length === 0 && (
                    <p className="text-sm text-[#898781]">No events yet.</p>
                )}
            </div>
        </div>
    )
}
