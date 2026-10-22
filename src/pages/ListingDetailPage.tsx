import {
  ArrowLeft,
  Calendar,
  Check,
  Gauge,
  Handshake,
  Heart,
  MapPin,
  Pencil,
  Share2,
  Star,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useAuthStore } from '@/features/auth/store'
import { useToggleFavorite } from '@/features/favorites/hooks'
import { useListing } from '@/features/listings/hooks'
import { ListingGallery } from '@/features/listings/ListingGallery'
import { SpecsTable } from '@/features/listings/SpecsTable'
import { OfferDialog } from '@/features/offers/OfferDialog'
import { useParameterDictionary } from '@/features/parameters/hooks'
import { ApiError } from '@/shared/api/client'
import { cn } from '@/shared/lib/cn'
import { formatMileage, formatPrice, formatRelative, initials } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { ErrorState, Skeleton } from '@/shared/ui/Feedback'
import { useToast } from '@/shared/ui/toast'

const STATUS_NOTE = {
  DRAFT: { tone: 'neutral', label: 'Borrador', note: 'Solo tú puedes ver esta publicación.' },
  PUBLISHED: { tone: 'success', label: 'En venta', note: null },
  RESERVED: {
    tone: 'warning',
    label: 'Reservado',
    note: 'El vendedor aceptó una oferta y está cerrando el negocio.',
  },
  SOLD: { tone: 'danger', label: 'Vendido', note: 'Este vehículo ya se vendió.' },
  ARCHIVED: { tone: 'neutral', label: 'Archivado', note: 'La publicación fue retirada.' },
} as const

export function ListingDetailPage() {
  const { slug = '' } = useParams()
  const { data: listing, isPending, isError, error, refetch } = useListing(slug)
  const user = useAuthStore((state) => state.user)
  const dictionary = useParameterDictionary()
  const toggleFavorite = useToggleFavorite(slug)
  const toast = useToast()
  const navigate = useNavigate()
  const [offerOpen, setOfferOpen] = useState(false)

  if (isPending) {
    return <DetailSkeleton />
  }

  if (isError) {
    const apiError = error instanceof ApiError ? error : null
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState
          error={error}
          onRetry={apiError?.isNotFound ? undefined : () => void refetch()}
        />
        <div className="mt-5 text-center">
          <Link to="/vehiculos">
            <Button variant="secondary">Volver al catálogo</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Los guardas anteriores cubren carga y error; esto estrecha el tipo para el
  // resto del componente, incluidos los manejadores de eventos.
  if (!listing) {
    return <DetailSkeleton />
  }

  const vehicle = listing
  const status = STATUS_NOTE[listing.status]
  const isOwner = user?.id === listing.sellerId
  const canOffer = Boolean(user) && !isOwner && listing.status === 'PUBLISHED'

  async function onToggleFavorite() {
    if (!user) {
      toast.info('Ingresa para guardar vehículos en favoritos')
      navigate('/ingresar', { state: { from: `/vehiculos/${slug}` } })
      return
    }
    try {
      const result = await toggleFavorite.mutateAsync(vehicle.id)
      toast.success(result.favorite ? 'Guardado en favoritos' : 'Quitado de favoritos')
    } catch {
      toast.error('No pudimos actualizar tus favoritos')
    }
  }

  async function onShare() {
    const url = window.location.href
    try {
      // La API de compartir nativa solo existe en algunos navegadores; si no
      // está, se copia el enlace al portapapeles.
      if (navigator.share) {
        await navigator.share({ title: vehicle.title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      toast.success('Enlace copiado')
    } catch {
      toast.error('No pudimos compartir el enlace')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <Link
        to="/vehiculos"
        className="text-muted hover:text-strong mb-5 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Volver al catálogo
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0">
          <ListingGallery images={listing.images} title={listing.title} />

          <header className="mt-7">
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <Badge tone={status.tone}>{status.label}</Badge>
              {listing.featured ? (
                <Badge tone="brand" icon={<Star className="size-3" aria-hidden />}>
                  Destacado
                </Badge>
              ) : null}
              {listing.negotiable ? <Badge tone="info">Precio negociable</Badge> : null}
              <span className="text-muted ml-auto font-mono text-xs">{listing.reference}</span>
            </div>

            <h1 className="text-3xl font-semibold">{listing.title}</h1>

            <dl className="text-muted mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <Fact icon={<Calendar className="size-4" aria-hidden />} label="Año">
                {listing.year}
              </Fact>
              <Fact icon={<Gauge className="size-4" aria-hidden />} label="Kilometraje">
                {formatMileage(listing.mileageKm)}
              </Fact>
              {listing.cityCode ? (
                <Fact icon={<MapPin className="size-4" aria-hidden />} label="Ciudad">
                  {dictionary.valueLabel('CITY', listing.cityCode)}
                </Fact>
              ) : null}
              <span>Publicado {formatRelative(listing.publishedAt ?? listing.createdAt)}</span>
            </dl>
          </header>

          <section className="mt-8">
            <h2 className="mb-3 text-xl font-semibold">Descripción</h2>
            <p className="text-base leading-relaxed whitespace-pre-line">{listing.description}</p>
          </section>

          <section className="mt-9">
            <h2 className="mb-4 text-xl font-semibold">Ficha técnica</h2>
            <SpecsTable listing={listing} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="surface-card rounded-2xl p-6">
            <p className="text-muted text-sm">Precio</p>
            <p className="text-strong mt-0.5 text-3xl font-bold">
              {formatPrice(listing.price, listing.currency)}
            </p>

            {status.note ? (
              <p className="bg-surface-sunken text-muted mt-4 rounded-xl px-3.5 py-2.5 text-sm">
                {status.note}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col gap-2">
              {isOwner ? (
                <Link to="/cuenta">
                  <Button fullWidth icon={<Pencil className="size-4" />}>
                    Administrar mi publicación
                  </Button>
                </Link>
              ) : canOffer ? (
                <Button
                  fullWidth
                  size="lg"
                  icon={<Handshake className="size-4" />}
                  onClick={() => setOfferOpen(true)}
                >
                  Hacer una oferta
                </Button>
              ) : !user ? (
                <Link to="/ingresar" state={{ from: `/vehiculos/${slug}` }}>
                  <Button fullWidth size="lg">
                    Ingresa para ofertar
                  </Button>
                </Link>
              ) : (
                <Button fullWidth size="lg" disabled icon={<Check className="size-4" />}>
                  No recibe ofertas
                </Button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  onClick={onToggleFavorite}
                  loading={toggleFavorite.isPending}
                  icon={
                    <Heart
                      className={cn('size-4', listing.favorite && 'fill-red-500 text-red-500')}
                      aria-hidden
                    />
                  }
                >
                  {listing.favorite ? 'Guardado' : 'Guardar'}
                </Button>
                <Button variant="secondary" onClick={onShare} icon={<Share2 className="size-4" />}>
                  Compartir
                </Button>
              </div>
            </div>

            {listing.favoriteCount > 0 ? (
              <p className="text-muted mt-4 text-center text-xs">
                {listing.favoriteCount}{' '}
                {listing.favoriteCount === 1 ? 'persona lo guardó' : 'personas lo guardaron'}
              </p>
            ) : null}
          </div>

          <div className="surface-card mt-4 rounded-2xl p-6">
            <h2 className="text-muted mb-3.5 text-sm font-semibold">Vendedor</h2>
            <div className="flex items-center gap-3">
              <span className="bg-brand-600 grid size-11 shrink-0 place-items-center rounded-full text-sm font-semibold text-white">
                {initials(listing.sellerName)}
              </span>
              <div className="min-w-0">
                <p className="text-strong truncate font-medium">{listing.sellerName}</p>
                <p className="text-muted flex items-center gap-1 text-xs">
                  <User className="size-3" aria-hidden />
                  Contacta por medio de una oferta
                </p>
              </div>
            </div>
            <p className="text-muted mt-4 text-xs">
              Los datos de contacto se comparten cuando el vendedor acepta tu oferta. Así se evitan
              el spam y las llamadas sin intención de compra.
            </p>
          </div>
        </aside>
      </div>

      {canOffer ? (
        <OfferDialog listing={listing} open={offerOpen} onClose={() => setOfferOpen(false)} />
      ) : null}
    </div>
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
    <div className="flex items-center gap-1.5">
      {icon}
      <dt className="sr-only">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-5">
          <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-28 w-full" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
