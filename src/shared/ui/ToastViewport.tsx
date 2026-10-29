import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { useToastStore, type Toast, type ToastTone } from '@/shared/ui/toast'

const DURATIONS: Record<ToastTone, number> = {
  success: 4500,
  error: 8000,
  info: 4500,
}

const TONES: Record<ToastTone, { className: string; barClass: string; icon: typeof Info }> = {
  success: {
    className:
      'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800',
    barClass: 'bg-emerald-400',
    icon: CheckCircle2,
  },
  error: {
    className:
      'bg-red-50 text-red-900 border-red-200 dark:bg-red-950 dark:text-red-100 dark:border-red-800',
    barClass: 'bg-red-400',
    icon: AlertTriangle,
  },
  info: {
    className: 'bg-surface-raised text-strong border-surface',
    barClass: 'bg-brand-400',
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
  const { className, barClass, icon: Icon } = TONES[toast.tone]
  const duration = DURATIONS[toast.tone]
  const [progress, setProgress] = useState(100)
  const startRef = useRef<number>(performance.now())
  const rafRef = useRef<number>(0)

  useEffect(() => {
    startRef.current = performance.now()

    function tick() {
      const elapsed = performance.now() - startRef.current
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [duration])

  return (
    <div
      className={cn(
        'animate-rise pointer-events-auto relative flex w-full max-w-sm flex-col overflow-hidden',
        'rounded-xl border text-sm shadow-lg',
        className,
      )}
    >
      <div className="flex items-start gap-2.5 px-3.5 pt-3 pb-2.5">
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

      {/* Progress bar */}
      <div className="h-0.5 w-full bg-current/10">
        <div
          className={cn('h-full transition-none', barClass)}
          style={{ width: `${progress}%` }}
          aria-hidden
        />
      </div>
    </div>
  )
}
