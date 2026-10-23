import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent' | 'glass'
type Size = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'

const VARIANTS: Record<Variant, string> = {
  // Degradado muy corto: da volumen sin parecer un botón de los 2000.
  primary:
    'bg-linear-to-b from-brand-500 to-brand-600 text-white shadow-sm ' +
    'hover:from-brand-400 hover:to-brand-500 active:from-brand-600 active:to-brand-700',
  secondary:
    'bg-surface-raised text-strong border border-surface hover:border-surface-strong ' +
    'hover:bg-surface-sunken active:bg-surface-sunken',
  ghost: 'text-muted hover:bg-surface-sunken hover:text-strong',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-500 active:bg-red-700',
  accent:
    'bg-linear-to-b from-accent-400 to-accent-500 text-neutral-950 shadow-sm ' +
    'hover:from-accent-300 hover:to-accent-400',
  glass: 'surface-glass text-strong hover:border-surface-strong',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[0.95rem] gap-2 rounded-xl',
  icon: 'size-10 justify-center rounded-xl',
  'icon-sm': 'size-8 justify-center rounded-lg',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
  /** Icono a la derecha; útil para flechas de avance. */
  trailingIcon?: ReactNode
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  trailingIcon,
  fullWidth = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex shrink-0 items-center font-medium whitespace-nowrap',
        'transition-[background,border-color,color,transform,box-shadow] duration-200',
        // Un hundimiento mínimo al presionar hace que el clic se sienta.
        'active:scale-[0.98]',
        'disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full justify-center',
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
      {loading ? null : trailingIcon}
    </button>
  )
}
