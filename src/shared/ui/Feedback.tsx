import { AlertTriangle, Inbox, Loader2, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'

import { ApiError } from '@/shared/api/client'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-xl', className)} aria-hidden />
}

export function Spinner({ label = 'Cargando' }: { label?: string }) {
  return (
    <div className="text-muted flex items-center justify-center gap-2 py-10 text-sm">
      <Loader2 className="size-4 animate-spin" aria-hidden />
      {label}
    </div>
  )
}

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'surface-card flex flex-col items-center gap-3 rounded-2xl px-6 py-14 text-center',
        className,
      )}
    >
      <span className="bg-surface-sunken text-muted grid size-12 place-items-center rounded-full">
        {icon ?? <Inbox className="size-5" aria-hidden />}
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? <p className="text-muted max-w-md text-sm">{description}</p> : null}
      {action}
    </div>
  )
}

interface ErrorStateProps {
  error: unknown
  onRetry?: () => void
  className?: string
}

/** Traduce un error de red o de API a algo accionable para la persona. */
export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const apiError = error instanceof ApiError ? error : null
  const title =
    apiError?.code === 'network_error'
      ? 'No pudimos contactar el servidor'
      : apiError?.isNotFound
        ? 'No encontramos lo que buscabas'
        : 'Algo salió mal'
  const description =
    apiError?.message ??
    (error instanceof Error ? error.message : 'Intenta de nuevo en unos segundos.')

  return (
    <div
      className={cn(
        'surface-card flex flex-col items-center gap-3 rounded-2xl px-6 py-14 text-center',
        className,
      )}
    >
      <span className="grid size-12 place-items-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400">
        <AlertTriangle className="size-5" aria-hidden />
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-muted max-w-md text-sm">{description}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" icon={<RefreshCw className="size-4" />} onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </div>
  )
}

/** Aviso en línea para errores dentro de un formulario. */
export function InlineAlert({
  tone = 'danger',
  children,
}: {
  tone?: 'danger' | 'info' | 'success'
  children: ReactNode
}) {
  const tones = {
    danger:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900',
    info: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900',
    success:
      'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900',
  }

  return (
    <div role="alert" className={cn('rounded-xl border px-3.5 py-2.5 text-sm', tones[tone])}>
      {children}
    </div>
  )
}
