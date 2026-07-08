'use client'

import { createContext, useCallback, useContext, useState } from 'react'

type ToastKind = 'success' | 'error' | 'info'
type ToastItem = { id: number; message: string; kind: ToastKind }

type ToastContextValue = {
    showToast: (message: string, kind?: ToastKind) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const KIND_STYLES: Record<ToastKind, string> = {
    success: 'border-emerald-300 bg-emerald-50 text-emerald-800',
    error: 'border-red-300 bg-red-50 text-red-800',
    info: 'border-slate-300 bg-white text-slate-800',
}

let nextId = 1

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([])

    const showToast = useCallback((message: string, kind: ToastKind = 'info') => {
        const id = nextId++
        setToasts((prev) => [...prev, { id, message, kind }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 3200)
    }, [])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        role="status"
                        className={`animate-toast-in pointer-events-auto rounded-lg border px-4 py-2.5 text-sm font-medium shadow-lg ${KIND_STYLES[toast.kind]}`}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be used within a ToastProvider')
    return ctx
}
