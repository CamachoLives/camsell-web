import { Car, LayoutGrid, Rows3, Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { FilterPanel } from '@/features/listings/FilterPanel'
import { useListingSearch } from '@/features/listings/hooks'
import { ListingCard, ListingCardSkeleton } from '@/features/listings/ListingCard'
import { useListingFilters } from '@/features/listings/useListingFilters'
import { useBrands, useParameterDictionary } from '@/features/parameters/hooks'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { cn } from '@/shared/lib/cn'
import { formatNumber, formatPriceCompact } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { EmptyState, ErrorState } from '@/shared/ui/Feedback'
import { Pagination } from '@/shared/ui/Pagination'
import { SmartLink } from '@/shared/ui/SmartLink'

const SORTS = [
  { value: '', label: 'Más recientes' },
  { value: 'priceAmount', label: 'Precio: menor a mayor' },
  { value: 'modelYear', label: 'Año: más nuevos' },
  { value: 'mileageKm', label: 'Kilometraje: menor' },
  { value: 'viewCount', label: 'Más vistos' },
]

type ViewMode = 'grid' | 'row'
const VIEW_KEY = 'camsell.catalogView'

/** La preferencia de vista se recuerda: es una decisión personal, no de sesión. */
function readStoredView(): ViewMode {
  try {
    return localStorage.getItem(VIEW_KEY) === 'row' ? 'row' : 'grid'
  } catch {
    return 'grid'
  }
}

export function ListingsPage() {
  const filters = useListingFilters()
  const [searchTerm, setSearchTerm] = useState(filters.params.text ?? '')
  const debouncedTerm = useDebouncedValue(searchTerm)
  const [panelOpen, setPanelOpen] = useState(false)
  const [view, setView] = useState<ViewMode>(readStoredView)

  // El texto se escribe libre y se aplica con retardo, para no lanzar una
  // consulta por cada tecla.
  useEffect(() => {
    if ((filters.params.text ?? '') !== debouncedTerm) {
      filters.setText(debouncedTerm)
    }
  }, [debouncedTerm]) // eslint-disable-line react-hooks/exhaustive-deps

  function changeView(next: ViewMode) {
    setView(next)
    try {
      localStorage.setItem(VIEW_KEY, next)
    } catch {
      // Sin almacenamiento la preferencia dura lo que dure la pestaña.
    }
  }

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useListingSearch(
    filters.params,
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-9 lg:px-8">
      <header className="mb-7">
        <h1 className="text-3xl font-semibold sm:text-4xl">Vehículos en venta</h1>
        <p className="text-muted mt-2">
          Los filtros se construyen desde el catálogo de parámetros de la plataforma.
        </p>
      </header>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex flex-1 items-center">
          <Search className="text-muted pointer-events-none absolute left-3.5 size-4" aria-hidden />
          <label className="sr-only" htmlFor="catalog-search">
            Buscar por marca, modelo o referencia
          </label>
          <input
            id="catalog-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Toyota, Hilux, CAMS-D0001…"
            className="bg-surface-raised text-strong placeholder:text-muted/60 hover:border-surface-strong focus:border-brand-500 h-11 w-full rounded-xl border border-surface pr-10 pl-10 text-sm transition-colors"
          />
          {searchTerm ? (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              onClick={() => setSearchTerm('')}
              className="text-muted hover:text-strong absolute right-3 transition-colors"
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>

        <Button
          variant="secondary"
          className="h-11 lg:hidden"
          icon={<SlidersHorizontal className="size-4" />}
          onClick={() => setPanelOpen(true)}
        >
          Filtros{filters.activeCount > 0 ? ` (${filters.activeCount})` : ''}
        </Button>
      </div>

      <ActiveChips filters={filters} />

      <div className="grid gap-8 lg:grid-cols-[17.5rem_1fr]">
        <aside className="surface-card hidden h-fit rounded-panel p-5 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto">
          <FilterPanel filters={filters} />
        </aside>

        <section aria-live="polite" aria-busy={isPending}>
          {/* Barra de resultados adherida: el conteo, el orden y la vista
              siguen al alcance mientras se recorre una lista larga. */}
          <div className="surface-glass sticky top-[4.25rem] z-20 mb-5 flex items-center gap-3 rounded-xl px-3.5 py-2.5">
            <p className="text-muted text-sm">
              {isPending ? (
                'Buscando…'
              ) : (
                <>
                  <span className="numeric text-strong font-medium">
                    {formatNumber(data?.totalElements ?? 0)}
                  </span>{' '}
                  {data?.totalElements === 1 ? 'resultado' : 'resultados'}
                </>
              )}
            </p>

            <div className="ml-auto flex items-center gap-2">
              <label className="sr-only" htmlFor="catalog-sort">
                Ordenar resultados
              </label>
              <select
                id="catalog-sort"
                value={filters.params.sort ?? ''}
                onChange={(event) => filters.setSort(event.target.value)}
                className="text-base h-9 cursor-pointer rounded-lg border border-surface bg-surface-raised px-2.5 text-xs"
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div
                role="group"
                aria-label="Forma de ver los resultados"
                className="hidden rounded-lg border border-surface bg-surface-raised p-0.5 sm:flex"
              >
                <ViewButton
                  active={view === 'grid'}
                  label="Ver en rejilla"
                  onClick={() => changeView('grid')}
                >
                  <LayoutGrid className="size-4" aria-hidden />
                </ViewButton>
                <ViewButton
                  active={view === 'row'}
                  label="Ver en lista"
                  onClick={() => changeView('row')}
                >
                  <Rows3 className="size-4" aria-hidden />
                </ViewButton>
              </div>
            </div>
          </div>

          {isError ? (
            <ErrorState error={error} onRetry={() => void refetch()} />
          ) : isPending ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <ListingCardSkeleton key={index} />
              ))}
            </div>
          ) : data.content.length === 0 ? (
            <EmptyState
              icon={<Car className="size-5" aria-hidden />}
              title="Ningún vehículo coincide con estos filtros"
              description="Prueba ampliando el rango de precio o quitando algún filtro."
              action={
                filters.activeCount > 0 ? (
                  <Button variant="secondary" size="sm" onClick={filters.reset}>
                    Limpiar filtros
                  </Button>
                ) : (
                  <SmartLink to="/publicar" prefetchPage="publish">
                    <Button size="sm">Publicar el primero</Button>
                  </SmartLink>
                )
              }
            />
          ) : (
            <>
              {/* Se atenúa mientras llega la página siguiente, en lugar de
                  vaciarse y perder el contexto de lectura. */}
              <div
                className={cn(
                  'transition-opacity duration-200',
                  isPlaceholderData && 'opacity-55',
                )}
              >
                <div
                  className={cn(
                    'grid gap-5',
                    view === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1',
                  )}
                >
                  {data.content.map((listing, index) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      index={index}
                      layout={view}
                      priority={index < 3}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-10">
                <Pagination
                  page={data.page}
                  totalPages={data.totalPages}
                  totalElements={data.totalElements}
                  onChange={filters.setPage}
                />
              </div>
            </>
          )}
        </section>
      </div>

      {panelOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar filtros"
            onClick={() => setPanelOpen(false)}
            className="absolute inset-0 bg-neutral-950/55 backdrop-blur-sm"
          />
          <div className="bg-surface-raised animate-rise absolute inset-y-0 right-0 flex w-full max-w-sm flex-col border-l border-surface">
            <header className="flex items-center justify-between border-b border-surface px-5 py-4">
              <h2 className="text-lg font-semibold">Filtros</h2>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                aria-label="Cerrar"
                className="text-muted hover:bg-surface-sunken rounded-lg p-1.5"
              >
                <X className="size-5" aria-hidden />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <FilterPanel filters={filters} />
            </div>
            <footer className="border-t border-surface px-5 py-4">
              <Button fullWidth onClick={() => setPanelOpen(false)}>
                Ver {formatNumber(data?.totalElements ?? 0)} resultados
              </Button>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ViewButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'grid size-8 place-items-center rounded-md transition-colors',
        active ? 'bg-brand-500/15 text-brand-600 dark:text-brand-300' : 'text-muted hover:text-strong',
      )}
    >
      {children}
    </button>
  )
}

/** Resumen de lo que está filtrando, con quitar en un clic. */
function ActiveChips({ filters }: { filters: ReturnType<typeof useListingFilters> }) {
  const dictionary = useParameterDictionary()
  const { data: brands } = useBrands()
  const attrEntries = [...filters.attrByGroup.entries()]
  const { params } = filters

  const selectedBrand = brands?.find((b) => b.id === params.brandIds?.[0])
  const selectedModel = selectedBrand?.models.find((m) => m.id === params.modelIds?.[0])

  const hasAny =
    attrEntries.length > 0 ||
    params.minPrice != null ||
    params.maxPrice != null ||
    params.maxMileage != null ||
    params.minYear != null ||
    params.maxYear != null ||
    params.brandIds?.length ||
    params.negotiable

  if (!hasAny) {
    return null
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {/* Chips de atributos dinámicos */}
      {attrEntries.flatMap(([groupCode, values]) =>
        values.map((value) => (
          <button
            key={`${groupCode}:${value}`}
            type="button"
            onClick={() => filters.toggleAttr(groupCode, value)}
            className="transition-opacity hover:opacity-75"
            aria-label={`Quitar filtro ${dictionary.valueLabel(groupCode, value)}`}
          >
            <Badge tone="brand" className="pr-1.5">
              <span className="opacity-70">{dictionary.groupLabel(groupCode)}:</span>
              {dictionary.valueLabel(groupCode, value)}
              <X className="ml-0.5 size-3" aria-hidden />
            </Badge>
          </button>
        )),
      )}

      {/* Chip de marca */}
      {selectedBrand ? (
        <button
          type="button"
          onClick={() => filters.setBrand(undefined)}
          className="transition-opacity hover:opacity-75"
          aria-label={`Quitar filtro ${selectedBrand.name}`}
        >
          <Badge tone="brand" className="pr-1.5">
            <span className="opacity-70">Marca:</span>
            {selectedBrand.name}
            {selectedModel ? ` · ${selectedModel.name}` : ''}
            <X className="ml-0.5 size-3" aria-hidden />
          </Badge>
        </button>
      ) : null}

      {/* Chip de precio */}
      {(params.minPrice != null || params.maxPrice != null) ? (
        <button
          type="button"
          onClick={() => {
            filters.setNumber('minPrice', undefined)
            filters.setNumber('maxPrice', undefined)
          }}
          className="transition-opacity hover:opacity-75"
          aria-label="Quitar filtro de precio"
        >
          <Badge tone="brand" className="pr-1.5">
            <span className="opacity-70">Precio:</span>
            {params.minPrice != null ? formatPriceCompact(params.minPrice) : '0'}
            {' → '}
            {params.maxPrice != null ? formatPriceCompact(params.maxPrice) : '∞'}
            <X className="ml-0.5 size-3" aria-hidden />
          </Badge>
        </button>
      ) : null}

      {/* Chip de año */}
      {(params.minYear != null || params.maxYear != null) ? (
        <button
          type="button"
          onClick={() => {
            filters.setNumber('minYear', undefined)
            filters.setNumber('maxYear', undefined)
          }}
          className="transition-opacity hover:opacity-75"
          aria-label="Quitar filtro de año"
        >
          <Badge tone="brand" className="pr-1.5">
            <span className="opacity-70">Año:</span>
            {params.minYear ?? '—'}
            {' → '}
            {params.maxYear ?? '—'}
            <X className="ml-0.5 size-3" aria-hidden />
          </Badge>
        </button>
      ) : null}

      {/* Chip de kilometraje */}
      {params.maxMileage != null ? (
        <button
          type="button"
          onClick={() => filters.setNumber('maxMileage', undefined)}
          className="transition-opacity hover:opacity-75"
          aria-label="Quitar filtro de kilometraje"
        >
          <Badge tone="brand" className="pr-1.5">
            <span className="opacity-70">Hasta:</span>
            {formatNumber(params.maxMileage)} km
            <X className="ml-0.5 size-3" aria-hidden />
          </Badge>
        </button>
      ) : null}

      {/* Chip de negociable */}
      {params.negotiable ? (
        <button
          type="button"
          onClick={() => filters.setNegotiable(false)}
          className="transition-opacity hover:opacity-75"
          aria-label="Quitar filtro precio negociable"
        >
          <Badge tone="brand" className="pr-1.5">
            Precio negociable
            <X className="ml-0.5 size-3" aria-hidden />
          </Badge>
        </button>
      ) : null}

      <button
        type="button"
        onClick={filters.reset}
        className="text-muted hover:text-strong ml-1 text-xs font-medium underline-offset-2 hover:underline"
      >
        Limpiar todo
      </button>
    </div>
  )
}
