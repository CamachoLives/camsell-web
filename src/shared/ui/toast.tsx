import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { useEffect } from 'react'
import { create } from 'zustand'

import { cn } from '@/shared/lib/cn'

type ToastTone = 'success' | 'error' | 'info'

interface Toast {
  id: number
  tone: ToastTone
  message: string
}

interface ToastState {
  toasts: Toast[]
  push: (tone: ToastTone, message: string) => void
  dismiss: (id: number) => void
}

let nextId = 1

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (tone, message) => {
    const id = nextId++
    set((state) => ({ toasts: [...state.toasts, { id, tone, message }] }))
    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
    }, 5000)
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))

/** Avisos efímeros de resultado de una acción. */
export function useToast() {
  const push = useToastStore((state) => state.push)
  return {
    success: (message: string) => push('success', message),
    error: (message: string) => push('error', message),
    info: (message: string) => push('info', message),
  }
}

const TONES: Record<ToastTone, { className: string; icon: typeof Info }> = {
  success: {
    className:
      'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800',
    icon: CheckCircle2,
  },
  error: {
    className:
      'bg-red-50 text-red-900 border-red-200 dark:bg-red-950 dark:text-red-100 dark:border-red-800',
    icon: AlertTriangle,
  },
  info: {
    className:
      'bg-surface-raised text-strong border-surface dark:bg-surface-raised',
    icon: Info,
  },
}

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end"
    >
      {toasts.map((toast) => (
        <ToastRow key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  )
}

function ToastRow({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const { className, icon: Icon } = TONES[toast.tone]

  // Un aviso de error se mantiene hasta que la persona lo cierre.
  useEffect(() => {
    if (toast.tone !== 'error') {
      return
    }
    return () => undefined
  }, [toast.tone])

  return (
    <div
      className={cn(
        'animate-rise pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm shadow-lg',
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p className="flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar aviso"
        className="-mr-1 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  )
}
