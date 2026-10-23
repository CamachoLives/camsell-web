import { Newspaper, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { ArticleCard, ArticleCardSkeleton } from '@/features/news/ArticleCard'
import { useNewsFeed, useNewsTags } from '@/features/news/hooks'
import { useParameterGroups } from '@/features/parameters/hooks'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { EmptyState, ErrorState } from '@/shared/ui/Feedback'
import { Pagination } from '@/shared/ui/Pagination'

export function NewsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: groups } = useParameterGroups()
  const { data: tags } = useNewsTags()

  const categories = groups?.find((group) => group.code === 'NEWS_CATEGORY')?.options ?? []
  const activeCategory = searchParams.get('categoryCode') ?? ''
  const activeTag = searchParams.get('tag') ?? ''
  const page = Number(searchParams.get('page') ?? 0)

  const [term, setTerm] = useState(searchParams.get('text') ?? '')
  const debouncedTerm = useDebouncedValue(term)

  useEffect(() => {
    setParam('text', debouncedTerm || undefined)
  }, [debouncedTerm]) // eslint-disable-line react-hooks/exhaustive-deps

  function setParam(key: string, value?: string) {
    const next = new URLSearchParams(searchParams)
    if (value === undefined || value === '') {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    if (key !== 'page') {
      next.delete('page')
    }
    setSearchParams(next, { replace: true })
  }

  const { data, isPending, isError, error, refetch } = useNewsFeed({
    text: searchParams.get('text') ?? undefined,
    categoryCode: activeCategory || undefined,
    tag: activeTag || undefined,
    page,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <header className="mb-8">
        <p className="text-brand-700 dark:text-brand-300 inline-flex items-center gap-1.5 text-sm font-semibold">
          <Newspaper className="size-4" aria-hidden />
          Camsell Informa
        </p>
        <h1 className="mt-1.5 text-3xl font-semibold sm:text-4xl">Novedades del mercado automotor</h1>
        <p className="text-muted mt-1.5">
          Lanzamientos, pruebas de manejo, guías de compra y lo que mueve los precios.
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-4">
        <div className="relative flex max-w-md items-center">
          <Search className="text-muted pointer-events-none absolute left-3.5 size-4" aria-hidden />
          <label className="sr-only" htmlFor="news-search">
            Buscar notas
          </label>
          <input
            id="news-search"
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Buscar por título o contenido"
            className="bg-surface-raised text-strong placeholder:text-muted/70 focus:border-brand-500 h-11 w-full rounded-xl border border-surface pr-3 pl-10 text-sm transition-colors"
          />
        </div>

        {/* Las categorías son opciones del grupo de parámetros NEWS_CATEGORY. */}
        <div className="flex flex-wrap gap-1.5">
          <CategoryChip
            label="Todas"
            active={!activeCategory}
            onClick={() => setParam('categoryCode', undefined)}
          />
          {categories.map((option) => (
            <CategoryChip
              key={option.code}
              label={option.label}
              active={activeCategory === option.code}
              onClick={() =>
                setParam('categoryCode', activeCategory === option.code ? undefined : option.code)
              }
            />
          ))}
        </div>

        {activeTag ? (
          <div className="flex items-center gap-2">
            <span className="text-muted text-sm">Filtrando por etiqueta:</span>
            <button
              type="button"
              onClick={() => setParam('tag', undefined)}
              className="bg-brand-600 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white"
            >
              #{activeTag}
              <X className="size-3" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>

      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : isPending ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <ArticleCardSkeleton key={index} />
          ))}
        </div>
      ) : data.content.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="size-5" aria-hidden />}
          title="No hay notas que coincidan"
          description="Prueba con otra categoría o quita el filtro de etiqueta."
          action={
            <Button variant="secondary" size="sm" onClick={() => setSearchParams(new URLSearchParams())}>
              Ver todas las notas
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-5">
            {/* La primera nota de la primera página se destaca. */}
            {page === 0 ? <ArticleCard article={data.content[0]} highlight /> : null}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {(page === 0 ? data.content.slice(1) : data.content).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>

          <div className="mt-9">
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              onChange={(nextPage) => setParam('page', nextPage === 0 ? undefined : String(nextPage))}
            />
          </div>
        </>
      )}

      {tags && tags.length > 0 ? (
        <section className="mt-14">
          <h2 className="text-muted mb-3 text-sm font-semibold tracking-wide uppercase">
            Etiquetas
          </h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setParam('tag', tag)}
                className="surface-card hover:border-brand-400 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-surface text-muted hover:border-brand-400 hover:text-strong',
      )}
    >
      {label}
    </button>
  )
}
