import { Clock } from 'lucide-react'

import { useParameterDictionary } from '@/features/parameters/hooks'
import type { ArticleSummary } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { formatDateShort, formatReadingTime } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/Badge'
import { Skeleton } from '@/shared/ui/Feedback'
import { Image } from '@/shared/ui/Image'
import { SmartLink } from '@/shared/ui/SmartLink'

interface ArticleCardProps {
  article: ArticleSummary
  /** La nota principal del feed ocupa más espacio y muestra el resumen completo. */
  highlight?: boolean
  /** Posición en la rejilla, para la entrada en cascada. */
  index?: number
}

export function ArticleCard({ article, highlight = false, index = 0 }: ArticleCardProps) {
  const dictionary = useParameterDictionary()
  const href = `/noticias/${article.slug}`

  return (
    <article
      style={{ '--stagger': index } as React.CSSProperties}
      className={cn(
        'surface-card hover-lift animate-stagger group flex overflow-hidden rounded-card',
        highlight ? 'flex-col lg:flex-row' : 'flex-col',
      )}
    >
      <SmartLink
        to={href}
        prefetchPage="article"
        className={cn('relative block shrink-0', highlight ? 'lg:w-1/2' : '')}
        aria-label={article.title}
      >
        <Image
          src={article.coverImageUrl}
          alt={article.title}
          priority={highlight}
          aspect={highlight ? 'aspect-[16/9] lg:h-full lg:aspect-auto' : 'aspect-[16/9]'}
          className="transition-transform duration-500 group-hover:scale-[1.04]"
          sizes={highlight ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
        />
        {article.categoryCode ? (
          <span className="absolute top-2.5 left-2.5">
            <Badge onImage>{dictionary.valueLabel('NEWS_CATEGORY', article.categoryCode)}</Badge>
          </span>
        ) : null}
      </SmartLink>

      <div className="flex flex-1 flex-col p-5">
        <h3
          className={cn(
            'leading-snug font-semibold',
            highlight ? 'text-2xl sm:text-[1.65rem]' : 'text-lg',
          )}
        >
          <SmartLink to={href} prefetchPage="article" className="hover:underline">
            {article.title}
          </SmartLink>
        </h3>

        {article.excerpt ? (
          <p
            className={cn(
              'text-muted mt-2.5 text-sm leading-relaxed',
              highlight ? '' : 'line-clamp-3',
            )}
          >
            {article.excerpt}
          </p>
        ) : null}

        {article.tags.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {article.tags.slice(0, 3).map((tag) => (
              <li key={tag}>
                <SmartLink
                  to={`/noticias?tag=${encodeURIComponent(tag)}`}
                  prefetchPage="news"
                  className="bg-surface-sunken text-muted hover:text-strong rounded-full px-2.5 py-0.5 text-[0.7rem] transition-colors"
                >
                  #{tag}
                </SmartLink>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="text-muted mt-auto flex items-center gap-3 pt-4 text-xs">
          <span className="numeric">{formatDateShort(article.publishedAt)}</span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" aria-hidden />
            {formatReadingTime(article.readingMinutes)}
          </span>
        </div>
      </div>
    </article>
  )
}

export function ArticleCardSkeleton() {
  return (
    <div className="surface-card overflow-hidden rounded-card">
      <Skeleton className="aspect-[16/9] rounded-none" />
      <div className="flex flex-col gap-2.5 p-5">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  )
}
