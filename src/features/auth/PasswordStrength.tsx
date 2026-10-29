import { cn } from '@/shared/lib/cn'

interface StrengthResult {
  score: 0 | 1 | 2 | 3 | 4
  label: string
  color: string
}

function evaluate(password: string): StrengthResult {
  if (!password) return { score: 0, label: '', color: '' }

  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const capped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4

  const labels: Record<1 | 2 | 3 | 4, string> = {
    1: 'Muy débil',
    2: 'Débil',
    3: 'Aceptable',
    4: 'Fuerte',
  }
  const colors: Record<1 | 2 | 3 | 4, string> = {
    1: 'bg-red-500',
    2: 'bg-orange-400',
    3: 'bg-yellow-400',
    4: 'bg-emerald-500',
  }

  return {
    score: capped,
    label: capped >= 1 ? labels[capped as 1 | 2 | 3 | 4] : '',
    color: capped >= 1 ? colors[capped as 1 | 2 | 3 | 4] : '',
  }
}

export function PasswordStrength({ password }: { password: string }) {
  const { score, label, color } = evaluate(password)

  if (!password) return null

  return (
    <div className="mt-1.5 space-y-1.5">
      <div className="flex gap-1" aria-hidden>
        {([1, 2, 3, 4] as const).map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              score >= i ? color : 'bg-surface-sunken',
            )}
          />
        ))}
      </div>
      {label ? (
        <p
          className={cn(
            'text-[0.68rem] font-medium',
            score <= 1 && 'text-red-600 dark:text-red-400',
            score === 2 && 'text-orange-600 dark:text-orange-400',
            score === 3 && 'text-yellow-600 dark:text-yellow-400',
            score === 4 && 'text-emerald-600 dark:text-emerald-400',
          )}
          role="status"
          aria-live="polite"
        >
          Seguridad: {label}
        </p>
      ) : null}
    </div>
  )
}
