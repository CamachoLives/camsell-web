import { ArrowRight, BadgeCheck, Car, Search, SlidersHorizontal, Star, Store } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ListingCard, ListingCardSkeleton } from '@/features/listings/ListingCard'
import { useCatalogStats, useFeaturedListings } from '@/features/listings/hooks'
import { useBrands } from '@/features/parameters/hooks'
import type { CatalogStats } from '@/shared/api/types'
import { formatNumber } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'

export function HomePage() {
  const { data: stats } = useCatalogStats()

  return (
    <>
      <Hero stats={stats} />
      <FeaturedListings />
      <BrandStrip />
      <ValueProps />
    </>
  )
}

function FeaturedListings() {
  const { data, isPending } = useFeaturedListings(6)

  if (!isPending && (data?.length ?? 0) === 0) {
    return null
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pt-16 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-brand-700 dark:text-brand-300 inline-flex items-center gap-1.5 text-sm font-semibold">
            <Star className="size-4" aria-hidden />
            Destacados
          </p>
          <h2 className="mt-1 text-2xl font-semibold">Vehículos que vale la pena mirar</h2>
        </div>
        <Link to="/vehiculos" className="hidden shrink-0 sm:block">
          <Button variant="ghost" size="sm" icon={<ArrowRight className="size-4" />}>
            Ver todos
          </Button>
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isPending
          ? Array.from({ length: 3 }, (_, index) => <ListingCardSkeleton key={index} />)
          : data?.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
      </div>

      <Link to="/vehiculos" className="mt-6 block sm:hidden">
        <Button fullWidth variant="secondary">
          Ver todo el catálogo
        </Button>
      </Link>
    </section>
  )
}

function BrandStrip() {
  const { data: brands } = useBrands(false)

  if (!brands || brands.length === 0) {
    return null
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pt-16 lg:px-8">
      <h2 className="text-muted mb-4 text-sm font-semibold tracking-wide uppercase">
        Explora por marca
      </h2>
      <div className="flex flex-wrap gap-2">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            to={`/vehiculos?brandId=${brand.id}`}
            className="surface-card hover:border-brand-400 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            {brand.name}
          </Link>
        ))}
      </div>
    </section>
  )
}

function Hero({ stats }: { stats?: CatalogStats }) {
  return (
    <section className="relative overflow-hidden border-b border-surface">
      <div
        aria-hidden
        className="from-brand-600/10 via-brand-500/5 absolute inset-0 bg-gradient-to-br to-transparent"
      />
      <div
        aria-hidden
        className="bg-brand-500/20 absolute -top-32 -right-24 size-80 rounded-full blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-brand-700 dark:text-brand-300 mb-3 inline-flex items-center gap-2 text-sm font-semibold">
            <BadgeCheck className="size-4" aria-hidden />
            Publicaciones verificadas
          </p>
          <h1 className="text-4xl leading-tight font-bold sm:text-5xl">
            Compra y vende carros sin dar vueltas
          </h1>
          <p className="text-muted mt-4 text-lg">
            Filtra por lo que realmente importa — combustible, transmisión, equipamiento, ciudad —
            compara precios reales y negocia directo con el vendedor.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/vehiculos">
              <Button size="lg" icon={<Search className="size-4" />}>
                Explorar el catálogo
              </Button>
            </Link>
            <Link to="/publicar">
              <Button size="lg" variant="secondary" icon={<Car className="size-4" />}>
                Publicar mi vehículo
              </Button>
            </Link>
          </div>
        </div>

        <dl className="mt-14 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="En venta" value={stats?.publishedListings} />
          <Stat label="Marcas" value={stats?.brandsWithListings} />
          <Stat label="Reservados" value={stats?.reservedListings} />
          <Stat label="Vendidos" value={stats?.soldListings} />
        </dl>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value?: number }) {
  return (
    <div className="surface-card rounded-2xl px-4 py-3.5">
      <dt className="text-muted text-xs font-medium tracking-wide uppercase">{label}</dt>
      <dd className="text-strong mt-1 text-2xl font-bold">
        {value === undefined ? <span className="skeleton block h-7 w-14 rounded-lg" /> : formatNumber(value)}
      </dd>
    </div>
  )
}

const PROPS = [
  {
    icon: SlidersHorizontal,
    title: 'Filtros que se adaptan',
    description:
      'Los filtros se generan desde el catálogo de parámetros del sistema. Si el equipo agrega una característica nueva, aparece aquí sin actualizar la aplicación.',
  },
  {
    icon: Store,
    title: 'Particulares y concesionarios',
    description:
      'Vendedores particulares y profesionales en el mismo lugar, con el rol visible para que sepas con quién estás negociando.',
  },
  {
    icon: BadgeCheck,
    title: 'Ofertas con reglas claras',
    description:
      'Haces una oferta, el vendedor la acepta o la rechaza y el vehículo queda reservado. Sin intermediarios ni mensajes perdidos.',
  },
]

function ValueProps() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <div className="grid gap-5 md:grid-cols-3">
        {PROPS.map(({ icon: Icon, title, description }) => (
          <article key={title} className="surface-card rounded-2xl p-6">
            <span className="bg-brand-50 text-brand-700 dark:bg-brand-900/50 dark:text-brand-200 grid size-11 place-items-center rounded-xl">
              <Icon className="size-5" aria-hidden />
            </span>
            <h2 className="mt-4 text-lg font-semibold">{title}</h2>
            <p className="text-muted mt-2 text-sm">{description}</p>
          </article>
        ))}
      </div>

      <div className="surface-card mt-10 flex flex-col items-start gap-4 rounded-2xl p-7 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">¿Listo para vender?</h2>
          <p className="text-muted mt-1 text-sm">
            Publica gratis, recibe ofertas y decide con calma. Tú manejas el precio.
          </p>
        </div>
        <Link to="/publicar" className="shrink-0">
          <Button icon={<ArrowRight className="size-4" />}>Empezar ahora</Button>
        </Link>
      </div>
    </section>
  )
}
