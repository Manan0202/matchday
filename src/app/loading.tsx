// Generic fallback for any route without its own loading.tsx (this file is
// scoped to the whole app, not just the home page — Next.js falls back to
// the nearest ancestor loading.tsx for any segment that doesn't have one).
export default function RootLoading() {
    return (
        <div className="flex flex-col gap-4">
            <div className="skeleton h-7 w-56 rounded" />
            <div className="skeleton h-4 w-72 rounded" />
            <div className="skeleton mt-2 h-32 w-full rounded-lg" />
        </div>
    )
}
