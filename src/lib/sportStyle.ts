export const SPORT_STYLE: Record<string, { gradient: string; icon: string }> = {
    football: { gradient: 'from-blue-600 to-indigo-800', icon: '⚽' },
    cricket: { gradient: 'from-amber-500 to-orange-700', icon: '🏏' },
    basketball: { gradient: 'from-orange-500 to-red-700', icon: '🏀' },
}
export const DEFAULT_SPORT_STYLE = { gradient: 'from-slate-600 to-slate-800', icon: '🏆' }

export const sportStyleFor = (slug: string) => SPORT_STYLE[slug] ?? DEFAULT_SPORT_STYLE
