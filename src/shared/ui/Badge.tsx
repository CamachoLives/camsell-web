import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'accent'

const TONES: Record<Tone, string> = {
  neutral: 'bg-surface-sunken text-muted border-surface',
  brand:
    'bg-brand-50 text-brand-700 border-brand-200 ' +
    'dark:bg-brand-950 dark:text-brand-200 dark:border-brand-800',
  accent:
    'bg-accent-300/18 text-accent-600 border-accent-400/35 ' +
    'dark:text-accent-300 dark:border-accent-500/35',
  success:
    'bg-emerald-50 text-emerald-700 border-emerald-200 ' +
    'dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  warning:
    'bg-amber-50 text-amber-800 border-amber-200 ' +
    'dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
  danger:
    'bg-red-50 text-red-700 border-red-200 ' +
    'dark:bg-red-950/60 dark:text-red-300 dark:border-red-800',
  info:
    'bg-sky-50 text-sky-700 border-sky-200 ' +
    'dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
}

interface BadgeProps {
  tone?: Tone
  icon?: ReactNode
  /** Variante translúcida, para colocar la etiqueta sobre una imagen. */
  onImage?: boolean
  className?: string
  children: ReactNode
}

export function Badge({ tone = 'neutral', icon, onImage = false, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5',
        'text-[0.7rem] font-medium tracking-tight',
        onImage
          ? 'border-white/15 bg-neutral-950/65 text-white backdrop-blur-md'
          : TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}

/**
 * Punto de estado con halo. Comunica un estado vivo (en venta, reservado) de
 * forma más inmediata que una palabra.
 */
export function StatusDot({ tone = 'neutral' }: { tone?: Tone }) {
  const colors: Record<Tone, string> = {
    neutral: 'bg-neutral-400',
    brand: 'bg-brand-500',
    accent: 'bg-accent-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-sky-500',
  }
  return (
    <span className="relative flex size-2 shrink-0" aria-hidden>
      <span
        className={cn('absolute inline-flex size-full animate-ping rounded-full opacity-60', colors[tone])}
      />
      <span className={cn('relative inline-flex size-2 rounded-full', colors[tone])} />
    </span>
  )
}
