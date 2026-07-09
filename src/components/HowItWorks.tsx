const STEPS = [
    {
        icon: '🔍',
        title: 'Browse fixtures',
        description: 'Filter by sport and league to find the match you want to see.',
    },
    {
        icon: '💺',
        title: 'Pick your seat',
        description: 'A real seat map shows exactly what’s available, section by section.',
    },
    {
        icon: '⚡',
        title: 'Book instantly',
        description: 'Confirm your booking and it’s yours — no waiting, no double-booked seats.',
    },
]

export function HowItWorks() {
    return (
        <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, i) => (
                <div
                    key={step.title}
                    className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-5"
                >
                    <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-700">
                            {i + 1}
                        </span>
                        <span className="text-xl">{step.icon}</span>
                    </div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="text-sm text-slate-600">{step.description}</p>
                </div>
            ))}
        </div>
    )
}
