import { Menu, Newspaper, Plus, Search, Car, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

import { cn } from '@/shared/lib/cn'
import { Logo } from '@/shared/layout/Logo'
import { ThemeToggle } from '@/shared/layout/ThemeToggle'
import { Button } from '@/shared/ui/Button'

const NAV = [
  { to: '/vehiculos', label: 'Comprar', icon: Car },
  { to: '/publicar', label: 'Vender', icon: Plus },
  { to: '/noticias', label: 'Noticias', icon: Newspaper },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  // Navegar cierra el menú móvil, para que no quede abierto sobre la vista nueva.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  function submitSearch(event: React.FormEvent) {
    event.preventDefault()
    const term = search.trim()
    navigate(term ? `/vehiculos?text=${encodeURIComponent(term)}` : '/vehiculos')
  }

  return (
    <header className="bg-surface-raised/85 sticky top-0 z-40 border-b border-surface backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-5 lg:px-8">
        <Logo />

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                    : 'text-muted hover:bg-surface-sunken hover:text-strong',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden flex-1 max-w-sm lg:block">
          <label className="sr-only" htmlFor="header-search">
            Buscar vehículos
          </label>
          <div className="relative flex items-center">
            <Search className="text-muted pointer-events-none absolute left-3 size-4" aria-hidden />
            <input
              id="header-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Marca, modelo o referencia"
              className="bg-surface-sunken text-strong placeholder:text-muted/70 focus:border-brand-500 h-10 w-full rounded-xl border border-transparent pl-9 pr-3 text-sm transition-colors"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
          <ThemeToggle />
          <Link to="/ingresar" className="hidden sm:block">
            <Button size="sm" variant="secondary">
              Ingresar
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="text-muted hover:bg-surface-sunken grid size-9 place-items-center rounded-xl transition-colors md:hidden"
          >
            {menuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="bg-surface-raised animate-rise border-t border-surface md:hidden">
          <nav aria-label="Principal móvil" className="mx-auto max-w-7xl px-4 py-3">
            <form onSubmit={submitSearch} className="mb-3">
              <div className="relative flex items-center">
                <Search
                  className="text-muted pointer-events-none absolute left-3 size-4"
                  aria-hidden
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar vehículos"
                  className="bg-surface-sunken text-strong h-11 w-full rounded-xl border border-transparent pl-9 pr-3 text-sm"
                />
              </div>
            </form>
            <ul className="flex flex-col gap-1">
              {NAV.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium',
                        isActive
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                          : 'text-muted hover:bg-surface-sunken',
                      )
                    }
                  >
                    <Icon className="size-4" aria-hidden />
                    {label}
                  </NavLink>
                </li>
              ))}
              <li className="pt-1">
                <Link to="/ingresar">
                  <Button fullWidth variant="secondary">
                    Ingresar
                  </Button>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
