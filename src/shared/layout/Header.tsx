import { Car, LayoutDashboard, Menu, Newspaper, Plus, Search, X } from 'lucide-react'
import { useState } from 'react'

import { useAuthStore } from '@/features/auth/store'
import { usePaletteStore } from '@/features/search/paletteStore'
import { UserMenu } from '@/features/auth/UserMenu'
import { Logo } from '@/shared/layout/Logo'
import { ThemeToggle } from '@/shared/layout/ThemeToggle'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { SmartLink, SmartNavLink } from '@/shared/ui/SmartLink'
import type { PageKey } from '@/app/routes'

const NAV: { to: string; label: string; icon: typeof Car; prefetchPage: PageKey }[] = [
  { to: '/vehiculos', label: 'Comprar', icon: Car, prefetchPage: 'listings' },
  { to: '/publicar', label: 'Vender', icon: Plus, prefetchPage: 'publish' },
  { to: '/noticias', label: 'Noticias', icon: Newspaper, prefetchPage: 'news' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const user = useAuthStore((state) => state.user)
  const openPalette = usePaletteStore((state) => state.setOpen)

  function closeMenuOnLink(event: React.MouseEvent) {
    if ((event.target as HTMLElement).closest('a')) {
      setMenuOpen(false)
    }
  }

  return (
    <header className="surface-glass sticky top-0 z-40 border-x-0 border-t-0">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-4 lg:px-8">
        <Logo />

        <nav aria-label="Principal" className="hidden items-center gap-0.5 md:flex">
          {NAV.map(({ to, label, prefetchPage }) => (
            <SmartNavLink
              key={to}
              to={to}
              prefetchPage={prefetchPage}
              className={({ isActive }) =>
                cn(
                  'relative rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'text-strong' : 'text-muted hover:text-strong',
                )
              }
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  {label}
                  {/* Subrayado corto como indicador de sección activa: más
                      discreto que una pastilla de fondo. */}
                  <span
                    aria-hidden
                    className={cn(
                      'bg-brand-500 absolute inset-x-3 -bottom-px h-0.5 rounded-full transition-opacity',
                      isActive ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </>
              )}
            </SmartNavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <CommandHint onClick={() => openPalette(true)} />
          <ThemeToggle />

          {user ? (
            <UserMenu />
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <SmartLink to="/ingresar" prefetchPage="login">
                <Button size="sm" variant="ghost">
                  Ingresar
                </Button>
              </SmartLink>
              <SmartLink to="/registro" prefetchPage="register">
                <Button size="sm">Crear cuenta</Button>
              </SmartLink>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="text-muted hover:bg-surface-sunken hover:text-strong grid size-9 place-items-center rounded-xl transition-colors md:hidden"
          >
            {menuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          className="bg-surface-raised animate-rise border-t border-surface md:hidden"
          onClick={closeMenuOnLink}
        >
          <nav aria-label="Principal móvil" className="mx-auto max-w-7xl px-4 py-3">
            <ul className="flex flex-col gap-1">
              {NAV.map(({ to, label, icon: Icon, prefetchPage }) => (
                <li key={to}>
                  <SmartNavLink
                    to={to}
                    prefetchPage={prefetchPage}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
                          : 'text-muted hover:bg-surface-sunken',
                      )
                    }
                  >
                    <Icon className="size-4" aria-hidden />
                    {label}
                  </SmartNavLink>
                </li>
              ))}

              {user ? (
                <li>
                  <SmartNavLink
                    to="/cuenta"
                    prefetchPage="account"
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
                          : 'text-muted hover:bg-surface-sunken',
                      )
                    }
                  >
                    <LayoutDashboard className="size-4" aria-hidden />
                    Mi cuenta
                  </SmartNavLink>
                </li>
              ) : (
                <li className="flex flex-col gap-2 pt-1">
                  <SmartLink to="/ingresar" prefetchPage="login">
                    <Button fullWidth variant="secondary">
                      Ingresar
                    </Button>
                  </SmartLink>
                  <SmartLink to="/registro" prefetchPage="register">
                    <Button fullWidth>Crear cuenta</Button>
                  </SmartLink>
                </li>
              )}
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  )
}

/**
 * Disparador de búsqueda que además anuncia el atajo de teclado.
 *
 * <p>Ocupa mucho menos que un campo de texto en la barra y deja claro que hay
 * una forma rápida de llegar a cualquier parte. El atajo se muestra según el
 * sistema, para no enseñar ⌘ en Windows.
 */
function CommandHint({ onClick }: { onClick: () => void }) {
  const isApple = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'text-muted hover:text-strong hover:border-surface-strong group flex items-center gap-2',
        'rounded-xl border border-surface bg-surface-sunken py-2 pr-2 pl-3 text-sm transition-colors',
      )}
    >
      <Search className="size-4" aria-hidden />
      <span className="hidden lg:inline">Buscar</span>
      <kbd className="hidden rounded-md border border-surface bg-surface-raised px-1.5 py-0.5 font-mono text-[0.65rem] lg:inline">
        {isApple ? '⌘' : 'Ctrl'} K
      </kbd>
    </button>
  )
}
