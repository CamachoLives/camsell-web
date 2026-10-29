import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  Car,
  Clock,
  CornerDownLeft,
  Heart,
  LayoutDashboard,
  Newspaper,
  Plus,
  Search,
  Settings,
  Tag,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuthStore } from '@/features/auth/store'
import { listingsApi } from '@/features/listings/api'
import { newsApi } from '@/features/news/api'
import { useBrands } from '@/features/parameters/hooks'
import { usePaletteStore } from '@/features/search/paletteStore'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { cn } from '@/shared/lib/cn'
import { formatPriceCompact, formatReadingTime } from '@/shared/lib/format'

const HISTORY_KEY = 'camsell.searchHistory'
const MAX_HISTORY = 5

function readHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function pushHistory(term: string) {
  try {
    const current = readHistory().filter((t) => t !== term)
    localStorage.setItem(HISTORY_KEY, JSON.stringify([term, ...current].slice(0, MAX_HISTORY)))
  } catch {
    // ignore
  }
}

interface Command {
  id: string
  label: string
  hint?: string
  group: string
  icon: typeof Car
  run: () => void
}

/**
 * Paleta de comandos.
 *
 * <p>Reúne en un solo gesto lo que de otro modo exige recorrer el menú: ir a
 * una sección, buscar un vehículo por marca o referencia, abrir una nota. Las
 * búsquedas remotas se lanzan con retardo y solo a partir de dos caracteres,
 * para no disparar una consulta por cada tecla.
 */
export function CommandPalette() {
  const open = usePaletteStore((state) => state.open)
  const setOpen = usePaletteStore((state) => state.setOpen)
  const toggle = usePaletteStore((state) => state.toggle)
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const [term, setTerm] = useState('')
  const [active, setActive] = useState(0)
  const [history, setHistory] = useState<string[]>(readHistory)
  const debouncedTerm = useDebouncedValue(term, 220)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const saveToHistory = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return
    pushHistory(searchTerm.trim())
    setHistory(readHistory())
  }, [])

  // El atajo se registra una sola vez, a nivel de documento.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        toggle()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [toggle])

  // Al abrir se limpia el término anterior y se bloquea el scroll de fondo.
  useEffect(() => {
    if (!open) {
      return
    }
    setTerm('')
    setActive(0)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 20)
    return () => {
      document.body.style.overflow = previousOverflow
      window.clearTimeout(focusTimer)
    }
  }, [open])

  const remoteEnabled = open && debouncedTerm.trim().length >= 2

  const { data: listings } = useQuery({
    queryKey: ['palette', 'listings', debouncedTerm],
    queryFn: () => listingsApi.search({ text: debouncedTerm, size: 5 }),
    enabled: remoteEnabled,
    staleTime: 30_000,
  })

  const { data: news } = useQuery({
    queryKey: ['palette', 'news', debouncedTerm],
    queryFn: () => newsApi.feed({ text: debouncedTerm, size: 3 }),
    enabled: remoteEnabled,
    staleTime: 30_000,
  })

  const { data: brands } = useBrands(false)

  const commands = useMemo<Command[]>(() => {
    const go = (to: string, historyTerm?: string) => () => {
      if (historyTerm) saveToHistory(historyTerm)
      setOpen(false)
      navigate(to)
    }
    const query = term.trim().toLowerCase()

    const navigation: Command[] = [
      { id: 'nav-catalog', label: 'Ver el catálogo', group: 'Ir a', icon: Car, run: go('/vehiculos') },
      { id: 'nav-publish', label: 'Publicar un vehículo', group: 'Ir a', icon: Plus, run: go('/publicar') },
      { id: 'nav-news', label: 'Noticias', group: 'Ir a', icon: Newspaper, run: go('/noticias') },
      ...(user
        ? [
            {
              id: 'nav-account',
              label: 'Mi cuenta',
              group: 'Ir a',
              icon: LayoutDashboard,
              run: go('/cuenta'),
            },
            {
              id: 'nav-favorites',
              label: 'Mis favoritos',
              group: 'Ir a',
              icon: Heart,
              run: go('/cuenta?tab=favoritos'),
            },
          ]
        : []),
      ...(user?.role === 'ADMIN'
        ? [
            {
              id: 'nav-admin',
              label: 'Administración',
              group: 'Ir a',
              icon: Settings,
              run: go('/admin'),
            },
          ]
        : []),
    ]

    const matchedNavigation = query
      ? navigation.filter((command) => command.label.toLowerCase().includes(query))
      : navigation

    const brandCommands: Command[] = query
      ? (brands ?? [])
          .filter((brand) => brand.name.toLowerCase().includes(query))
          .slice(0, 4)
          .map((brand) => ({
            id: `brand-${brand.id}`,
            label: brand.name,
            hint: 'Ver vehículos de la marca',
            group: 'Marcas',
            icon: Tag,
            run: go(`/vehiculos?brandId=${brand.id}`),
          }))
      : []

    const listingCommands: Command[] = (listings?.content ?? []).map((listing) => ({
      id: `listing-${listing.id}`,
      label: listing.title,
      hint: `${formatPriceCompact(listing.price, listing.currency)} · ${listing.reference}`,
      group: 'Vehículos',
      icon: Car,
      run: go(`/vehiculos/${listing.slug}`),
    }))

    const newsCommands: Command[] = (news?.content ?? []).map((article) => ({
      id: `news-${article.id}`,
      label: article.title,
      hint: formatReadingTime(article.readingMinutes),
      group: 'Noticias',
      icon: Newspaper,
      run: go(`/noticias/${article.slug}`),
    }))

    const searchAll: Command[] = query
      ? [
          {
            id: 'search-all',
            label: `Buscar "${term.trim()}" en todo el catálogo`,
            group: 'Búsqueda',
            icon: Search,
            run: go(`/vehiculos?text=${encodeURIComponent(term.trim())}`, term.trim()),
          },
        ]
      : []

    const historyCommands: Command[] = !query
      ? history.map((h) => ({
          id: `history-${h}`,
          label: h,
          hint: 'Búsqueda reciente',
          group: 'Recientes',
          icon: Clock,
          run: go(`/vehiculos?text=${encodeURIComponent(h)}`, h),
        }))
      : []

    return [...searchAll, ...listingCommands, ...brandCommands, ...newsCommands, ...historyCommands, ...matchedNavigation]
  }, [term, listings, news, brands, user, history, navigate, setOpen, saveToHistory])

  // Al escribir, el resultado cambia: volver al inicio evita que el cursor
  // quede apuntando a un elemento distinto del que el usuario esperaría.
  useEffect(() => {
    setActive(0)
  }, [term])

  // Si la lista cambia de tamaño, el índice activo podría quedar fuera de rango.
  useEffect(() => {
    setActive((current) => (current >= commands.length ? 0 : current))
  }, [commands.length])

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      setOpen(false)
      return
    }
    if (event.key === 'ArrowDown' || (event.key === 'Tab' && !event.shiftKey)) {
      event.preventDefault()
      setActive((current) => (current + 1) % Math.max(1, commands.length))
      return
    }
    if (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey)) {
      event.preventDefault()
      setActive((current) => (current - 1 + commands.length) % Math.max(1, commands.length))
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      commands[active]?.run()
    }
  }

  // La opción activa se mantiene visible al recorrer con el teclado.
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active])

  if (!open) {
    return null
  }

  let lastGroup = ''

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Cerrar búsqueda"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-neutral-950/55 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Paleta de comandos"
        onKeyDown={onKeyDown}
        className="surface-glass animate-pop relative flex w-full max-w-xl flex-col overflow-hidden rounded-panel shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-surface px-4">
          <Search className="text-muted size-4 shrink-0" aria-hidden />
          <input
            ref={inputRef}
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Busca un vehículo, una marca o una sección…"
            aria-label="Buscar"
            className="text-strong placeholder:text-muted/60 h-14 flex-1 bg-transparent text-[0.95rem] outline-none"
          />
          <kbd className="text-muted rounded-md border border-surface px-1.5 py-0.5 font-mono text-[0.65rem]">
            esc
          </kbd>
        </div>

        <ul ref={listRef} className="max-h-[52vh] overflow-y-auto p-2" role="listbox">
          {commands.length === 0 ? (
            <li className="text-muted px-3 py-8 text-center text-sm">
              Nada coincide con «{term}».
            </li>
          ) : (
            commands.map((command, index) => {
              const showGroup = command.group !== lastGroup
              lastGroup = command.group
              const Icon = command.icon
              const isActive = index === active

              return (
                <li key={command.id}>
                  {showGroup ? (
                    <p className="text-muted px-3 pt-3 pb-1.5 text-[0.65rem] font-semibold tracking-widest uppercase">
                      {command.group}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    data-active={isActive}
                    onMouseEnter={() => setActive(index)}
                    onClick={command.run}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                      isActive ? 'bg-brand-500/12 text-strong' : 'text-base hover:bg-surface-sunken',
                    )}
                  >
                    <Icon
                      className={cn('size-4 shrink-0', isActive ? 'text-brand-500' : 'text-muted')}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{command.label}</span>
                      {command.hint ? (
                        <span className="text-muted block truncate text-xs">{command.hint}</span>
                      ) : null}
                    </span>
                    {isActive ? (
                      <CornerDownLeft className="text-muted size-3.5 shrink-0" aria-hidden />
                    ) : (
                      <ArrowRight className="size-3.5 shrink-0 opacity-0" aria-hidden />
                    )}
                  </button>
                </li>
              )
            })
          )}
        </ul>

        <div className="text-muted flex items-center gap-4 border-t border-surface px-4 py-2.5 text-[0.7rem]">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-surface px-1 font-mono">↑</kbd>
            <kbd className="rounded border border-surface px-1 font-mono">↓</kbd>
            navegar
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-surface px-1 font-mono">↵</kbd>
            abrir
          </span>
          <span className="ml-auto">{commands.length} resultados</span>
        </div>
      </div>
    </div>
  )
}
