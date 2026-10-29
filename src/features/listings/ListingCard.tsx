import { Calendar, Eye, Gauge, MapPin, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

import { useParameterDictionary } from '@/features/parameters/hooks'
import type { ListingSummary } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { formatNumber, formatPrice, formatPriceCompact } from '@/shared/lib/format'
import { Badge, StatusDot } from '@/shared/ui/Badge'
import { Skeleton } from '@/shared/ui/Feedback'
import { Image } from '@/shared/ui/Image'
import { SmartLink } from '@/shared/ui/SmartLink'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

function isRecentlyPublished(publishedAt?: string | null): boolean {
  if (!publishedAt) return false
  return Date.now() - new Date(publishedAt).getTime() < SEVEN_DAYS_MS
}

const STATUS_BADGE = {
  DRAFT: { tone: 'neutral', label: 'Borrador' },
  PUBLISHED: { tone: 'success', label: 'En venta' },
  RESERVED: { tone: 'warning', label: 'Reservado' },
  SOLD: { tone: 'danger', label: 'Vendido' },
  ARCHIVED: { tone: 'neutral', label: 'Archivado' },
} as const

interface ListingCardProps {
  listing: ListingSummary
  /** En el panel del vendedor interesa ver el estado aunque no sea público. */
  showStatus?: boolean
  actions?: ReactNode
  /** Posición en la rejilla, para la entrada en cascada. */
  index?: number
  /** Tarjeta horizontal, para la vista de lista del catálogo. */
  layout?: 'grid' | 'row'
  priority?: boolean
}

export function ListingCard({
  listing,
  showStatus = false,
  actions,
  index = 0,
  layout = 'grid',
  priority = false,
}: ListingCardProps) {
  const dictionary = useParameterDictionary()
  const status = STATUS_BADGE[listing.status]
  const href = `/vehiculos/${listing.slug}`
  const isRow = layout === 'row'

  const highlightBadge = listing.featured ? (
    <Badge onImage icon={<Sparkles className="size-3" aria-hidden />}>Destacado</Badge>
  ) : isRecentlyPublished(listing.publishedAt) && listing.status === 'PUBLISHED' ? (
    <Badge onImage tone="success">Nuevo</Badge>
  ) : null

  return (
    <article
      style={{ '--stagger': index } as React.CSSProperties}
      className={cn(
        'surface-card hover-lift animate-stagger group relative flex overflow-hidden rounded-card',
        isRow ? 'flex-col sm:flex-row' : 'flex-col',
      )}
    >
      <SmartLink
        to={href}
        prefetchPage="listingDetail"
        className={cn('relative block shrink-0', isRow ? 'sm:w-64' : '')}
        aria-label={listing.title}
      >
        <Image
          src={listing.coverImageUrl}
          alt={listing.title}
          priority={priority}
          aspect={isRow ? 'aspect-[16/10] sm:h-full sm:aspect-auto' : 'aspect-[4/3]'}
          className="transition-transform duration-500 group-hover:scale-[1.04]"
          sizes={isRow ? '256px' : '(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw'}
        />

        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {highlightBadge}
          {showStatus || listing.status !== 'PUBLISHED' ? (
            <Badge tone={status.tone}>{status.label}</Badge>
          ) : null}
        </div>
      </SmartLink>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-muted flex items-center gap-1.5 text-[0.7rem] font-medium tracking-widest uppercase">
          {listing.status === 'PUBLISHED' ? <StatusDot tone="success" /> : null}
          {listing.brandName} · {listing.modelName}
        </p>

        <h3 className="mt-1.5 line-clamp-2 text-base leading-snug font-semibold">
          <SmartLink to={href} prefetchPage="listingDetail" className="hover:underline">
            {listing.title}
          </SmartLink>
        </h3>

        <div className="mt-3 flex items-baseline gap-2">
          <p className="numeric text-strong text-xl font-semibold" title={formatPrice(listing.price, listing.currency)}>
            {formatPriceCompact(listing.price, listing.currency)}
          </p>
          {listing.negotiable ? (
            <span className="text-muted text-[0.7rem] font-medium">negociable</span>
          ) : null}
        </div>

        {/* Los datos duros van en una fila separada por hairlines: se leen
            como una ficha técnica breve y no como texto corrido. */}
        <dl className="text-muted mt-3.5 grid grid-cols-3 divide-x divide-[var(--surface-border)] border-y border-surface py-2 text-xs">
          <Fact icon={<Calendar className="size-3.5" aria-hidden />} label="Año">
            {listing.year}
          </Fact>
          <Fact icon={<Gauge className="size-3.5" aria-hidden />} label="Kilometraje">
            {formatNumber(listing.mileageKm)} km
          </Fact>
          <Fact icon={<MapPin className="size-3.5" aria-hidden />} label="Ciudad">
            <span className="truncate">
              {listing.cityCode ? dictionary.valueLabel('CITY', listing.cityCode) : '—'}
            </span>
          </Fact>
        </dl>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3.5">
          <span className="text-muted truncate text-xs">{listing.sellerName}</span>
          <div className="flex shrink-0 items-center gap-2">
            {listing.viewCount > 0 ? (
              <span className="text-muted flex items-center gap-0.5 text-[0.65rem]">
                <Eye className="size-3" aria-hidden />
                <span className="numeric">{formatNumber(listing.viewCount)}</span>
              </span>
            ) : null}
            <span className="numeric text-muted text-[0.65rem]">{listing.reference}</span>
          </div>
        </div>

        {actions ? <div className="mt-3 flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </article>
  )
}

function Fact({
  icon,
  label,
  children,
}: {
  icon: ReactNode
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-0.5 px-1">
      <dt className="sr-only">{label}</dt>
      <span className="opacity-60">{icon}</span>
      <dd className="numeric min-w-0 truncate text-[0.7rem]">{children}</dd>
    </div>
  )
}

export function ListingCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('surface-card overflow-hidden rounded-card', className)}>
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="flex flex-col gap-2.5 p-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

/** Versión compacta para carruseles y barras laterales. */
export function ListingCardCompact({ listing }: { listing: ListingSummary }) {
  return (
    <SmartLink
      to={`/vehiculos/${listing.slug}`}
      prefetchPage="listingDetail"
      className="surface-flat hover:border-surface-strong flex items-center gap-3 rounded-xl p-2 transition-colors"
    >
      <Image
        src={listing.coverImageUrl}
        alt={listing.title}
        aspect="aspect-square"
        className="size-14 shrink-0 rounded-lg"
      />
      <div className="min-w-0 flex-1">
        <p className="text-strong truncate text-sm font-medium">{listing.title}</p>
        <p className="numeric text-muted text-xs">
          {formatPrice(listing.price, listing.currency)}
        </p>
      </div>
    </SmartLink>
  )
}
