'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type Seat = { id: string; row: number; number: number; status: 'AVAILABLE' | 'RESERVED' | 'SOLD' }
type SectionData = { id: string; name: string; price: number; seats: Seat[] }

export function SeatMap({
    eventId,
    sections,
}: {
    eventId: string
    sections: SectionData[]
}) {
    const router = useRouter()
    const [selected, setSelected] = useState<Set<string>>(new Set())

    const priceBySeatId = useMemo(() => {
        const map = new Map<string, number>()
        for (const section of sections) {
            for (const seat of section.seats) {
                map.set(seat.id, section.price)
            }
        }
        return map
    }, [sections])

    const toggleSeat = (seatId: string, status: Seat['status']) => {
        if (status !== 'AVAILABLE') return
        setSelected((prev) => {
            const next = new Set(prev)
            if (next.has(seatId)) {
                next.delete(seatId)
            } else {
                next.add(seatId)
            }
            return next
        })
    }

    const total = Array.from(selected).reduce(
        (sum, seatId) => sum + (priceBySeatId.get(seatId) ?? 0),
        0
    )

    const handleCheckout = () => {
        const seatIds = Array.from(selected).join(',')
        router.push(`/checkout?event=${eventId}&seats=${seatIds}`)
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-4 text-xs">
                <Legend swatchClass="bg-white border border-slate-300" label="Available" />
                <Legend swatchClass="bg-rose-600" label="Selected" />
                <Legend swatchClass="bg-slate-300" label="Sold" />
            </div>

            {sections.map((section) => (
                <div key={section.id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-semibold">{section.name}</h3>
                        <span className="text-sm text-slate-600">${section.price.toFixed(0)} / seat</span>
                    </div>
                    <SectionGrid section={section} selected={selected} onToggle={toggleSeat} />
                </div>
            ))}

            <div
                className="sticky bottom-0 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-lg transition-shadow"
                data-testid="checkout-summary"
            >
                <div>
                    <p className="text-sm text-slate-600">{selected.size} seat(s) selected</p>
                    <p key={total} className="animate-fade-in-up text-lg font-bold">
                        ${total.toFixed(2)}
                    </p>
                </div>
                <button
                    onClick={handleCheckout}
                    disabled={selected.size === 0}
                    data-testid="proceed-to-checkout"
                    className="rounded bg-rose-600 px-5 py-2.5 font-medium text-white transition-transform duration-150 hover:bg-rose-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Proceed to checkout
                </button>
            </div>
        </div>
    )
}

function SectionGrid({
    section,
    selected,
    onToggle,
}: {
    section: SectionData
    selected: Set<string>
    onToggle: (seatId: string, status: Seat['status']) => void
}) {
    const rows = useMemo(() => {
        const byRow = new Map<number, Seat[]>()
        for (const seat of section.seats) {
            const list = byRow.get(seat.row) ?? []
            list.push(seat)
            byRow.set(seat.row, list)
        }
        return Array.from(byRow.entries()).sort(([a], [b]) => a - b)
    }, [section.seats])

    return (
        <div className="flex flex-col gap-1.5">
            {rows.map(([row, seats]) => (
                <div key={row} className="flex items-center gap-1.5">
                    <span className="w-6 text-xs text-slate-400">{row}</span>
                    {seats
                        .sort((a, b) => a.number - b.number)
                        .map((seat) => {
                            const isSelected = selected.has(seat.id)
                            const isSold = seat.status !== 'AVAILABLE'
                            return (
                                <button
                                    key={seat.id}
                                    type="button"
                                    disabled={isSold}
                                    onClick={() => onToggle(seat.id, seat.status)}
                                    aria-label={`Row ${row} seat ${seat.number}, ${isSold ? 'sold' : isSelected ? 'selected' : 'available'}`}
                                    aria-pressed={isSelected}
                                    data-testid={`seat-${seat.id}`}
                                    data-seat-status={isSold ? 'SOLD' : isSelected ? 'SELECTED' : 'AVAILABLE'}
                                    className={`flex h-7 w-7 items-center justify-center rounded text-[10px] font-medium transition-all duration-150 ${
                                        isSold
                                            ? 'cursor-not-allowed bg-slate-300 text-slate-500'
                                            : isSelected
                                              ? 'scale-105 bg-rose-600 text-white hover:scale-110 active:scale-95'
                                              : 'border border-slate-300 bg-white text-slate-600 hover:scale-110 hover:border-rose-400 active:scale-95'
                                    }`}
                                >
                                    {seat.number}
                                </button>
                            )
                        })}
                </div>
            ))}
        </div>
    )
}

function Legend({ swatchClass, label }: { swatchClass: string; label: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <span className={`h-3.5 w-3.5 rounded ${swatchClass}`} />
            {label}
        </div>
    )
}
