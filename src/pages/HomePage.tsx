import {
  ArrowRight,
  BadgeCheck,
  Car,
  Handshake,
  Newspaper,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Store,
  Zap,
} from 'lucide-react'
import { type ReactNode, useState } from 'react'

import { useCatalogStats, useFeaturedListings } from '@/features/listings/hooks'
import { useCountUp } from '@/shared/hooks/useCountUp'
import { ListingCard, ListingCardCompact, ListingCardSkeleton } from '@/features/listings/ListingCard'
import { useRecentlyViewed } from '@/features/listings/useRecentlyViewed'
import { ArticleCard, ArticleCardSkeleton } from '@/features/news/ArticleCard'
import { useFeaturedNews } from '@/features/news/hooks'
import { useBrands } from '@/features/parameters/hooks'
import { usePaletteStore } from '@/features/search/paletteStore'
import type { CatalogStats } from '@/shared/api/types'
import { formatNumber } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { SmartLink } from '@/shared/ui/SmartLink'

export function HomePage() {
  const { data: stats } = useCatalogStats()

  return (
    <>
      <Hero stats={stats} />
      <FeaturedListings />
      <RecentlyViewedSection />
      <BrandStrip />
      <ValueBento />
      <LatestNews />
      <ClosingCta />
    </>
  )
}

/* ── Portada ────────────────────────────────────────────────────────────── */

/** Atajos a búsquedas que la gente realmente hace. */
const QUICK_FILTERS = [
  { label: 'SUV', to: '/vehiculos?attr=BODY_TYPE%3ASUV' },
  { label: 'Sedán', to: '/vehiculos?attr=BODY_TYPE%3ASEDAN' },
  { label: 'Pick-up', to: '/vehiculos?attr=BODY_TYPE%3APICKUP' },
  { label: 'Híbridos', to: '/vehiculos?attr=FUEL_TYPE%3AHYBRID' },
  { label: 'Eléctricos', to: '/vehiculos?attr=FUEL_TYPE%3AELECTRIC' },
  { label: 'Automáticas', to: '/vehiculos?attr=TRANSMISSION%3AAUTOMATIC' },
  { label: 'Hasta $80 M', to: '/vehiculos?maxPrice=80000000' },
  { label: 'Hasta $50 M', to: '/vehiculos?maxPrice=50000000' },
  { label: 'Menos de 50k km', to: '/vehiculos?maxMileage=50000' },
  { label: 'Único dueño', to: '/vehiculos?attr=SINGLE_OWNER%3Atrue' },
]

function Hero({ stats }: { stats?: CatalogStats }) {
  const openPalette = usePaletteStore((state) => state.setOpen)

  return (
    <section className="relative isolate overflow-hidden border-b border-surface">
      <div aria-hidden className="bg-mesh absolute inset-0" />
      <div aria-hidden className="bg-grid absolute inset-0" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28 lg:px-8">
        <div className="max-w-3xl">
          <Badge tone="brand" icon={<BadgeCheck className="size-3" aria-hidden />}>
            Catálogo verificado
          </Badge>

          <h1 className="mt-5 text-4xl leading-[1.05] font-bold sm:text-6xl">
            <span className="text-gradient">Compra y vende carros</span>
            <br />
            sin dar vueltas
          </h1>

          <p className="text-muted mt-6 max-w-xl text-lg leading-relaxed">
            Filtra por lo que de verdad importa — combustible, transmisión, equipamiento, ciudad —
            compara precios reales y negocia directo con el vendedor.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <SmartLink to="/vehiculos" prefetchPage="listings">
              <Button size="lg" trailingIcon={<ArrowRight className="size-4" />}>
                Explorar el catálogo
              </Button>
            </SmartLink>
            <Button
              size="lg"
              variant="glass"
              icon={<Search className="size-4" />}
              onClick={() => openPalette(true)}
            >
              Buscar un modelo
            </Button>
            <SmartLink to="/publicar" prefetchPage="publish">
              <Button size="lg" variant="ghost" icon={<Plus className="size-4" />}>
                Publicar gratis
              </Button>
            </SmartLink>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-2">
            <span className="text-muted mr-1 text-xs font-medium tracking-widest uppercase">
              Populares
            </span>
            {QUICK_FILTERS.map((filter) => (
              <SmartLink
                key={filter.label}
                to={filter.to}
                prefetchPage="listings"
                className="surface-flat hover:border-brand-400 hover:text-strong text-muted rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
              >
                {filter.label}
              </SmartLink>
            ))}
          </div>
        </div>

        <dl className="mt-16 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="En venta" value={stats?.publishedListings} highlight />
          <Stat label="Marcas" value={stats?.brandsWithListings} />
          <Stat label="Reservados" value={stats?.reservedListings} />
          <Stat label="Vendidos" value={stats?.soldListings} />
        </dl>
      </div>
    </section>
  )
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string
  value?: number
  highlight?: boolean
}) {
  const { value: animated, ref } = useCountUp(value)

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={
        highlight
          ? 'surface-edge rounded-card px-4 py-3.5'
          : 'surface-card rounded-card px-4 py-3.5'
      }
    >
      <dt className="text-muted text-[0.65rem] font-semibold tracking-widest uppercase">
        {label}
      </dt>
      <dd className="numeric text-strong mt-1.5 text-2xl font-semibold">
        {animated === undefined ? (
          <span className="skeleton block h-7 w-14 rounded-md" />
        ) : (
          formatNumber(animated)
        )}
      </dd>
    </div>
  )
}

/* ── Destacados ─────────────────────────────────────────────────────────── */

function FeaturedListings() {
  const { data, isPending } = useFeaturedListings(6)

  if (!isPending && (data?.length ?? 0) === 0) {
    return null
  }

  return (
    <Section
      eyebrow="Destacados"
      eyebrowIcon={<Sparkles className="size-4" aria-hidden />}
      title="Vehículos que vale la pena mirar"
      action={
        <SmartLink to="/vehiculos" prefetchPage="listings">
          <Button variant="ghost" size="sm" trailingIcon={<ArrowRight className="size-4" />}>
            Ver todos
          </Button>
        </SmartLink>
      }
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isPending
          ? Array.from({ length: 3 }, (_, index) => <ListingCardSkeleton key={index} />)
          : data?.map((listing, index) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                index={index}
                priority={index < 3}
              />
            ))}
      </div>
    </Section>
  )
}

/* ── Vistos recientemente ───────────────────────────────────────────────── */

function RecentlyViewedSection() {
  const { items, clear } = useRecentlyViewed()

  if (items.length === 0) return null

  return (
    <Section
      eyebrow="Historial"
      eyebrowIcon={<Car className="size-4" aria-hidden />}
      title="Viste recientemente"
      action={
        <Button variant="ghost" size="sm" onClick={clear}>
          Limpiar
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((listing) => (
          <ListingCardCompact key={listing.id} listing={listing} />
        ))}
      </div>
    </Section>
  )
}

/* ── Marcas ─────────────────────────────────────────────────────────────── */

const BRANDS_VISIBLE = 14

function BrandStrip() {
  const { data: brands } = useBrands(false)
  const [expanded, setExpanded] = useState(false)

  if (!brands || brands.length === 0) {
    return null
  }

  const visible = expanded ? brands : brands.slice(0, BRANDS_VISIBLE)
  const hasMore = brands.length > BRANDS_VISIBLE

  return (
    <section className="mx-auto max-w-7xl px-4 pt-20 lg:px-8">
      <h2 className="text-muted mb-4 text-xs font-semibold tracking-widest uppercase">
        Explora por marca
      </h2>
      <div className="flex flex-wrap gap-2">
        {visible.map((brand) => (
          <SmartLink
            key={brand.id}
            to={`/vehiculos?brandId=${brand.id}`}
            prefetchPage="listings"
            className="surface-flat hover:border-brand-400 hover:text-strong text-base rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            {brand.name}
          </SmartLink>
        ))}
        {hasMore ? (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="surface-flat hover:border-brand-400 hover:text-strong text-muted rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            {expanded ? 'Ver menos' : `+${brands.length - BRANDS_VISIBLE} más`}
          </button>
        ) : null}
      </div>
    </section>
  )
}

/* ── Propuesta de valor ─────────────────────────────────────────────────── */

/**
 * Rejilla tipo bento: la primera celda ocupa el doble de ancho.
 *
 * <p>Tres tarjetas idénticas obligan a leerlas las tres para saber cuál
 * importa. Con tamaños distintos la jerarquía se ve antes de leer.
 */
function ValueBento() {
  return (
    <Section
      eyebrow="Cómo funciona"
      eyebrowIcon={<Zap className="size-4" aria-hidden />}
      title="Hecho para decidir, no para perder tiempo"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <article className="surface-edge rounded-panel p-7 md:col-span-2">
          <span className="bg-brand-500/12 text-brand-600 dark:text-brand-300 grid size-11 place-items-center rounded-xl">
            <SlidersHorizontal className="size-5" aria-hidden />
          </span>
          <h3 className="mt-5 text-xl font-semibold">Filtros que se adaptan solos</h3>
          <p className="text-muted mt-2.5 max-w-xl text-sm leading-relaxed">
            Los filtros se generan desde el catálogo de parámetros del sistema. Si el equipo agrega
            una característica nueva — nivel de blindaje, tipo de garantía — aparece aquí como
            filtro, como campo del formulario y como fila de la ficha técnica, sin actualizar la
            aplicación.
          </p>
          <SmartLink
            to="/vehiculos"
            prefetchPage="listings"
            className="text-brand-700 dark:text-brand-300 mt-5 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
          >
            Probar los filtros
            <ArrowRight className="size-3.5" aria-hidden />
          </SmartLink>
        </article>

        <div className="grid gap-4">
          <BentoSmall
            icon={<Store className="size-5" aria-hidden />}
            title="Particulares y concesionarios"
            description="En el mismo lugar, con el rol visible para saber con quién negocias."
          />
          <BentoSmall
            icon={<Handshake className="size-5" aria-hidden />}
            title="Ofertas con reglas claras"
            description="Ofertas, el vendedor acepta o rechaza, y el vehículo queda reservado."
          />
        </div>
      </div>
    </Section>
  )
}

function BentoSmall({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <article className="surface-card rounded-panel p-6">
      <span className="bg-surface-sunken text-muted grid size-10 place-items-center rounded-xl">
        {icon}
      </span>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="text-muted mt-1.5 text-sm leading-relaxed">{description}</p>
    </article>
  )
}

/* ── Noticias ───────────────────────────────────────────────────────────── */

function LatestNews() {
  const { data, isPending } = useFeaturedNews(3)

  if (!isPending && (data?.length ?? 0) === 0) {
    return null
  }

  return (
    <Section
      eyebrow="Camsell Informa"
      eyebrowIcon={<Newspaper className="size-4" aria-hidden />}
      title="Para decidir con información"
      action={
        <SmartLink to="/noticias" prefetchPage="news">
          <Button variant="ghost" size="sm" trailingIcon={<ArrowRight className="size-4" />}>
            Ver todas
          </Button>
        </SmartLink>
      }
    >
      <div className="grid gap-5 md:grid-cols-3">
        {isPending
          ? Array.from({ length: 3 }, (_, index) => <ArticleCardSkeleton key={index} />)
          : data?.map((article, index) => (
              <ArticleCard key={article.id} article={article} index={index} />
            ))}
      </div>
    </Section>
  )
}

/* ── Cierre ─────────────────────────────────────────────────────────────── */

function ClosingCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-20 lg:px-8">
      <div className="surface-edge relative isolate overflow-hidden rounded-panel p-8 sm:p-12">
        <div aria-hidden className="bg-mesh absolute inset-0 opacity-70" />
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">¿Listo para vender?</h2>
            <p className="text-muted mt-2 max-w-md text-sm leading-relaxed">
              Publicar es gratis y toma tres pasos. Recibes ofertas, decides con calma y el precio
              lo manejas tú.
            </p>
          </div>
          <SmartLink to="/publicar" prefetchPage="publish" className="shrink-0">
            <Button size="lg" icon={<Car className="size-4" />}>
              Publicar mi vehículo
            </Button>
          </SmartLink>
        </div>
      </div>
    </section>
  )
}

/* ── Envoltura de sección ───────────────────────────────────────────────── */

function Section({
  eyebrow,
  eyebrowIcon,
  title,
  action,
  children,
}: {
  eyebrow: string
  eyebrowIcon: ReactNode
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-20 lg:px-8">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="text-brand-700 dark:text-brand-300 inline-flex items-center gap-1.5 text-sm font-semibold">
            {eyebrowIcon}
            {eyebrow}
          </p>
          <h2 className="mt-1.5 text-2xl font-semibold sm:text-3xl">{title}</h2>
        </div>
        {action ? <div className="hidden shrink-0 sm:block">{action}</div> : null}
      </div>
      {children}
    </section>
  )
}
