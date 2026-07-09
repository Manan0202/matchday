// Group-booking discount: shared by the seat map (live preview), the
// checkout page (pre-confirmation summary), and the booking API (the
// authoritative charge) so the three can never drift out of sync — the
// client-shown total must always match what the server actually charges.
export const GROUP_DISCOUNT_MIN_SEATS = 4
export const GROUP_DISCOUNT_RATE = 0.1

export type PricingBreakdown = {
    seatCount: number
    subtotal: number
    discountApplied: boolean
    discountAmount: number
    total: number
}

export function calculatePricing(seatPrices: number[]): PricingBreakdown {
    const seatCount = seatPrices.length
    const subtotal = seatPrices.reduce((sum, price) => sum + price, 0)
    const discountApplied = seatCount >= GROUP_DISCOUNT_MIN_SEATS
    const discountAmount = discountApplied ? subtotal * GROUP_DISCOUNT_RATE : 0
    return {
        seatCount,
        subtotal,
        discountApplied,
        discountAmount,
        total: subtotal - discountAmount,
    }
}
