import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuthStore } from '@/features/auth/store'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'

const STORAGE_KEY = 'camsell.session'
const WARN_BEFORE_MS = 5 * 60 * 1000  // show warning 5 min before expiry
const CHECK_INTERVAL_MS = 30 * 1000   // check every 30s

function getExpiresAt(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { expiresAt?: number }
    return parsed.expiresAt ?? null
  } catch {
    return null
  }
}

export function SessionExpiryWarning() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!user) {
      setMinutesLeft(null)
      setDismissed(false)
      return
    }

    function check() {
      const expiresAt = getExpiresAt()
      if (!expiresAt) return
      const remaining = expiresAt - Date.now()
      if (remaining <= 0) {
        logout()
        navigate('/ingresar')
        return
      }
      if (remaining <= WARN_BEFORE_MS) {
        setMinutesLeft(Math.ceil(remaining / 60000))
      } else {
        setMinutesLeft(null)
        setDismissed(false)
      }
    }

    check()
    const interval = setInterval(check, CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [user, logout, navigate])

  if (!user || minutesLeft === null || dismissed) return null

  function handleLogout() {
    logout()
    navigate('/ingresar')
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'fixed top-20 right-4 z-[65] w-72 animate-pop',
        'surface-glass rounded-panel border border-amber-300/40 shadow-lift',
        'dark:border-amber-700/40',
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Sesión por vencer</p>
          <p className="text-muted mt-0.5 text-xs">
            Tu sesión vence en{' '}
            <span className="numeric font-medium text-amber-600 dark:text-amber-400">
              {minutesLeft} {minutesLeft === 1 ? 'minuto' : 'minutos'}
            </span>
            . Vuelve a ingresar para no perder tu trabajo.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-surface px-4 py-2.5">
        <Button
          size="sm"
          variant="secondary"
          icon={<RefreshCw className="size-3.5" />}
          onClick={handleLogout}
        >
          Volver a ingresar
        </Button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-muted hover:text-strong ml-auto text-xs transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  )
}
