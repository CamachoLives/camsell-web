import { ArrowLeft, Clock, Eye, Share2, User } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { ArticleCard } from '@/features/news/ArticleCard'
import { useArticle, useRelatedNews } from '@/features/news/hooks'
import { useParameterDictionary } from '@/features/parameters/hooks'
import { ApiError } from '@/shared/api/client'
import { formatDate, formatNumber } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { ErrorState, Skeleton } from '@/shared/ui/Feedback'
import { useToast } from '@/shared/ui/toast'

export function ArticlePage() {
  const { slug = '' } = useParams()
  const { data: article, isPending, isError, error, refetch } = useArticle(slug)
  const { data: related } = useRelatedNews(slug)
  const dictionary = useParameterDictionary()
  const toast = useToast()

  if (isPending) {
    return (
      <article className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-12">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
        <Skeleton className="h-60 w-full" />
      </article>
    )
  }

  if (isError || !article) {
    const apiError = error instanceof ApiError ? error : null
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState error={error} onRetry={apiError?.isNotFound ? undefined : () => void refetch()} />
        <div className="mt-5 text-center">
          <Link to="/noticias">
            <Button variant="secondary">Ver todas las noticias</Button>
          </Link>
        </div>
      </div>
    )
  }

  async function onShare() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: article!.title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      toast.success('Enlace copiado')
    } catch {
      toast.error('No pudimos compartir el enlace')
    }
  }

  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
        <Link
          to="/noticias"
          className="text-muted hover:text-strong mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver a noticias
        </Link>

        <header>
          {article.categoryCode ? (
            <Badge tone="brand">
              {dictionary.valueLabel('NEWS_CATEGORY', article.categoryCode)}
            </Badge>
          ) : null}

          <h1 className="mt-3 text-3xl leading-tight font-bold sm:text-4xl">{article.title}</h1>

          {article.excerpt ? (
            <p className="text-muted mt-4 text-lg leading-relaxed">{article.excerpt}</p>
          ) : null}

          <div className="text-muted mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-surface py-3.5 text-sm">
            <span className="flex items-center gap-1.5">
              <User className="size-4" aria-hidden />
              {article.authorName}
            </span>
            <span>{formatDate(article.publishedAt)}</span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              {article.readingMinutes} min
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="size-4" aria-hidden />
              {formatNumber(article.viewCount)}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto"
              icon={<Share2 className="size-3.5" />}
              onClick={onShare}
            >
              Compartir
            </Button>
          </div>
        </header>

        {article.coverImageUrl ? (
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="bg-surface-sunken mt-7 aspect-[16/9] w-full rounded-2xl object-cover"
          />
        ) : null}

        {/*
          El cuerpo llega como texto plano con párrafos separados por línea en
          blanco; se renderiza como párrafos y no con innerHTML, para no abrir
          una vía de inyección desde el contenido editorial.
        */}
        <div className="mt-8 flex flex-col gap-5">
          {article.body
            .split(/\n\s*\n/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={index} className="text-base leading-[1.75]">
                {paragraph}
              </p>
            ))}
        </div>

        {article.tags.length > 0 ? (
          <ul className="mt-9 flex flex-wrap gap-2 border-t border-surface pt-6">
            {article.tags.map((tag) => (
              <li key={tag}>
                <Link
                  to={`/noticias?tag=${encodeURIComponent(tag)}`}
                  className="bg-surface-sunken text-muted hover:text-strong rounded-full px-3 py-1 text-xs font-medium transition-colors"
                >
                  #{tag}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </article>

      {related && related.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 pb-6 lg:px-8">
          <h2 className="mb-5 text-xl font-semibold">También te puede interesar</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {related.map((item) => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  )
}
