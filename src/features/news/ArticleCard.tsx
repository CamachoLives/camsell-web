import { Clock, ImageOff } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useParameterDictionary } from '@/features/parameters/hooks'
import type { ArticleSummary } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { formatDateShort } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/Badge'
import { Skeleton } from '@/shared/ui/Feedback'

interface ArticleCardProps {
  article: ArticleSummary
  /** La nota principal del feed ocupa más espacio y muestra el resumen completo. */
  highlight?: boolean
}

export function ArticleCard({ article, highlight = false }: ArticleCardProps) {
  const dictionary = useParameterDictionary()

  return (
    <article
      className={cn(
        'surface-card group flex overflow-hidden rounded-2xl transition-shadow hover:shadow-lg',
        highlight ? 'flex-col lg:flex-row' : 'flex-col',
      )}
    >
      <Link
        to={`/noticias/${article.slug}`}
        className={cn(
          'bg-surface-sunken relative block shrink-0 overflow-hidden',
          highlight ? 'aspect-[16/9] lg:aspect-auto lg:w-1/2' : 'aspect-[16/9]',
        )}
      >
        {article.coverImageUrl ? (
          <img
            src={article.coverImageUrl}
            alt={article.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="text-muted grid size-full place-items-center">
            <ImageOff className="size-7" aria-hidden />
          </span>
        )}
        {article.categoryCode ? (
          <span className="absolute top-2.5 left-2.5">
            <Badge tone="brand">{dictionary.valueLabel('NEWS_CATEGORY', article.categoryCode)}</Badge>
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className={cn('leading-snug font-semibold', highlight ? 'text-2xl' : 'text-lg')}>
          <Link to={`/noticias/${article.slug}`} className="hover:underline">
            {article.title}
          </Link>
        </h3>

        {article.excerpt ? (
          <p className={cn('text-muted mt-2 text-sm', highlight ? '' : 'line-clamp-3')}>
            {article.excerpt}
          </p>
        ) : null}

        {article.tags.length > 0 ? (
          <ul className="mt-3.5 flex flex-wrap gap-1.5">
            {article.tags.slice(0, 3).map((tag) => (
              <li key={tag}>
                <Link
                  to={`/noticias?tag=${encodeURIComponent(tag)}`}
                  className="bg-surface-sunken text-muted hover:text-strong rounded-full px-2.5 py-0.5 text-xs transition-colors"
                >
                  #{tag}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="text-muted mt-auto flex items-center gap-3 pt-4 text-xs">
          <span>{formatDateShort(article.publishedAt)}</span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" aria-hidden />
            {article.readingMinutes} min de lectura
          </span>
        </div>
      </div>
    </article>
  )
}

export function ArticleCardSkeleton() {
  return (
    <div className="surface-card overflow-hidden rounded-2xl">
      <Skeleton className="aspect-[16/9] rounded-none" />
      <div className="flex flex-col gap-2.5 p-5">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  )
}
