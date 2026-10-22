import { Car, Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { FilterPanel } from '@/features/listings/FilterPanel'
import { ListingCard, ListingCardSkeleton } from '@/features/listings/ListingCard'
import { useListingSearch } from '@/features/listings/hooks'
import { useListingFilters } from '@/features/listings/useListingFilters'
import { useParameterDictionary } from '@/features/parameters/hooks'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { EmptyState, ErrorState } from '@/shared/ui/Feedback'
import { Pagination } from '@/shared/ui/Pagination'

const SORTS = [
  { value: '', label: 'Más recientes' },
  { value: 'priceAmount', label: 'Precio: menor a mayor' },
  { value: 'modelYear', label: 'Año: más nuevos' },
  { value: 'mileageKm', label: 'Kilometraje: menor' },
  { value: 'viewCount', label: 'Más vistos' },
]

export function ListingsPage() {
  const filters = useListingFilters()
  const [searchTerm, setSearchTerm] = useState(filters.params.text ?? '')
  const debouncedTerm = useDebouncedValue(searchTerm)
  const [panelOpen, setPanelOpen] = useState(false)

  // El texto se escribe libre y se aplica con retardo, para no lanzar una
  // consulta por cada tecla.
  useEffect(() => {
    if ((filters.params.text ?? '') !== debouncedTerm) {
      filters.setText(debouncedTerm)
    }
  }, [debouncedTerm]) // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useListingSearch(
    filters.params,
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <header className="mb-7">
        <h1 className="text-3xl font-semibold">Vehículos en venta</h1>
        <p className="text-muted mt-1.5">
          Los filtros se construyen desde el catálogo de parámetros de la plataforma.
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
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
            className="bg-surface-raised text-strong placeholder:text-muted/70 focus:border-brand-500 h-11 w-full rounded-xl border border-surface pr-3 pl-10 text-sm transition-colors"
          />
        </div>

        <label className="sr-only" htmlFor="catalog-sort">
          Ordenar resultados
        </label>
        <select
          id="catalog-sort"
          value={filters.params.sort ?? ''}
          onChange={(event) => filters.setSort(event.target.value)}
          className="bg-surface-raised text-strong h-11 cursor-pointer rounded-xl border border-surface px-3.5 text-sm sm:w-56"
        >
          {SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

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

      <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
        <aside className="surface-card hidden h-fit rounded-2xl p-5 lg:sticky lg:top-24 lg:block">
          <FilterPanel filters={filters} />
        </aside>

        <section aria-live="polite" aria-busy={isPending}>
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
                  <Link to="/publicar">
                    <Button size="sm">Publicar el primero</Button>
                  </Link>
                )
              }
            />
          ) : (
            <>
              <div
                className={cnOpacity(isPlaceholderData)}
                // El bloque se atenúa mientras llega la página siguiente, en
                // lugar de vaciarse y perder el contexto de lectura.
              >
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {data.content.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </div>

              <div className="mt-9">
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
                Ver resultados
              </Button>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  )
}

/** Resumen de lo que está filtrando, con quitar en un clic. */
function ActiveChips({ filters }: { filters: ReturnType<typeof useListingFilters> }) {
  const dictionary = useParameterDictionary()
  const entries = [...filters.attrByGroup.entries()]

  if (entries.length === 0) {
    return null
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {entries.flatMap(([groupCode, values]) =>
        values.map((value) => (
          <button
            key={`${groupCode}:${value}`}
            type="button"
            onClick={() => filters.toggleAttr(groupCode, value)}
            className="transition-opacity hover:opacity-75"
            aria-label={`Quitar filtro ${dictionary.valueLabel(groupCode, value)}`}
          >
            <Badge tone="brand" className="pr-1.5">
              <span className="text-muted/90 mr-0.5">{dictionary.groupLabel(groupCode)}:</span>
              {dictionary.valueLabel(groupCode, value)}
              <X className="ml-0.5 size-3" aria-hidden />
            </Badge>
          </button>
        )),
      )}
    </div>
  )
}

function cnOpacity(isPlaceholder: boolean): string {
  return isPlaceholder ? 'opacity-60 transition-opacity' : 'transition-opacity'
}
