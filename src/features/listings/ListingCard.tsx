import { Calendar, Gauge, ImageOff, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useParameterDictionary } from '@/features/parameters/hooks'
import type { ListingSummary } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { formatMileage, formatPrice } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/Badge'
import { Skeleton } from '@/shared/ui/Feedback'

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
  actions?: React.ReactNode
}

export function ListingCard({ listing, showStatus = false, actions }: ListingCardProps) {
  const dictionary = useParameterDictionary()
  const status = STATUS_BADGE[listing.status]

  return (
    <article className="surface-card group flex flex-col overflow-hidden rounded-2xl transition-shadow hover:shadow-lg">
      <Link
        to={`/vehiculos/${listing.slug}`}
        className="bg-surface-sunken relative block aspect-[4/3] overflow-hidden"
      >
        {listing.coverImageUrl ? (
          <img
            src={listing.coverImageUrl}
            alt={listing.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="text-muted grid size-full place-items-center">
            <ImageOff className="size-8" aria-hidden />
          </span>
        )}

        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {listing.featured ? (
            <Badge tone="brand" icon={<Star className="size-3" aria-hidden />}>
              Destacado
            </Badge>
          ) : null}
          {showStatus || listing.status !== 'PUBLISHED' ? (
            <Badge tone={status.tone}>{status.label}</Badge>
          ) : null}
        </div>

        {listing.negotiable ? (
          <span className="absolute right-2.5 bottom-2.5 rounded-full bg-neutral-950/70 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            Precio negociable
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-muted text-xs font-medium tracking-wide uppercase">
          {listing.brandName} · {listing.modelName}
        </p>
        <h3 className="mt-1 line-clamp-2 text-base leading-snug font-semibold">
          <Link to={`/vehiculos/${listing.slug}`} className="hover:underline">
            {listing.title}
          </Link>
        </h3>

        <p className="text-strong mt-2.5 text-xl font-bold">
          {formatPrice(listing.price, listing.currency)}
        </p>

        <dl className="text-muted mt-3 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs">
          <Fact icon={<Calendar className="size-3.5" aria-hidden />} label="Año">
            {listing.year}
          </Fact>
          <Fact icon={<Gauge className="size-3.5" aria-hidden />} label="Kilometraje">
            {formatMileage(listing.mileageKm)}
          </Fact>
          {listing.cityCode ? (
            <Fact icon={<MapPin className="size-3.5" aria-hidden />} label="Ciudad">
              {dictionary.valueLabel('CITY', listing.cityCode)}
            </Fact>
          ) : null}
        </dl>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="text-muted truncate text-xs">{listing.sellerName}</span>
          <span className="text-muted shrink-0 font-mono text-[0.7rem]">{listing.reference}</span>
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
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-1">
      {icon}
      <dt className="sr-only">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

export function ListingCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('surface-card overflow-hidden rounded-2xl', className)}>
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="flex flex-col gap-2.5 p-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  )
}
