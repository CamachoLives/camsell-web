import { ChevronDown, Heart, LayoutDashboard, LogOut, Settings, UserCog } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuthStore } from '@/features/auth/store'
import { cn } from '@/shared/lib/cn'
import { initials } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/Badge'

const ROLE_LABEL = {
  USER: 'Particular',
  DEALER: 'Concesionario',
  ADMIN: 'Administrador',
} as const

export function UserMenu() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Clic fuera y Escape cierran el menú.
  useEffect(() => {
    if (!open) {
      return
    }
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!user) {
    return null
  }

  const items = [
    { to: '/cuenta', label: 'Mi cuenta', icon: LayoutDashboard },
    { to: '/cuenta?tab=favoritos', label: 'Favoritos', icon: Heart },
    { to: '/cuenta?tab=perfil', label: 'Perfil', icon: UserCog },
  ]

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="hover:bg-surface-sunken flex items-center gap-2 rounded-xl py-1.5 pr-2 pl-1.5 transition-colors"
      >
        <Avatar user={user} />
        <span className="text-strong hidden text-sm font-medium sm:block">
          {user.fullName.split(' ')[0]}
        </span>
        <ChevronDown
          className={cn('text-muted size-4 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="bg-surface-raised animate-rise absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-surface shadow-xl"
        >
          <div className="flex items-center gap-3 border-b border-surface px-4 py-3.5">
            <Avatar user={user} />
            <div className="min-w-0">
              <p className="text-strong truncate text-sm font-medium">{user.fullName}</p>
              <p className="text-muted truncate text-xs">{user.email}</p>
            </div>
          </div>

          <div className="px-4 py-2">
            <Badge tone={user.role === 'ADMIN' ? 'brand' : 'neutral'}>
              {ROLE_LABEL[user.role]}
            </Badge>
          </div>

          <ul className="py-1">
            {items.map(({ to, label, icon: Icon }) => (
              <li key={label}>
                <Link
                  to={to}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="text-muted hover:bg-surface-sunken hover:text-strong flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </Link>
              </li>
            ))}
            {user.role === 'ADMIN' ? (
              <li>
                <Link
                  to="/admin"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="text-muted hover:bg-surface-sunken hover:text-strong flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                >
                  <Settings className="size-4" aria-hidden />
                  Administración
                </Link>
              </li>
            ) : null}
          </ul>

          <div className="border-t border-surface py-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                logout()
                navigate('/')
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              <LogOut className="size-4" aria-hidden />
              Cerrar sesión
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Avatar({ user }: { user: { fullName: string; avatarUrl?: string | null } }) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt=""
        className="size-8 shrink-0 rounded-full object-cover"
        loading="lazy"
      />
    )
  }
  return (
    <span className="bg-brand-600 grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white">
      {initials(user.fullName)}
    </span>
  )
}
