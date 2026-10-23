import {
  Archive,
  Car,
  Check,
  Handshake,
  Heart,
  Inbox,
  Plus,
  Send,
  Trash2,
  Upload,
  UserCog,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { authApi } from '@/features/auth/api'
import { useAuthStore } from '@/features/auth/store'
import { useFavorites } from '@/features/favorites/hooks'
import {
  useChangeListingStatus,
  useDeleteListing,
  useMyListings,
} from '@/features/listings/hooks'
import { ListingCard, ListingCardSkeleton } from '@/features/listings/ListingCard'
import { useOfferAction, useOffersReceived, useOffersSent } from '@/features/offers/hooks'
import { ApiError } from '@/shared/api/client'
import type { ListingStatus, Offer } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { formatPrice, formatRelative } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { TextField } from '@/shared/ui/Field'
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/Feedback'
import { Pagination } from '@/shared/ui/Pagination'
import { useToast } from '@/shared/ui/toast'

const TABS = [
  { id: 'publicaciones', label: 'Mis publicaciones', icon: Car },
  { id: 'recibidas', label: 'Ofertas recibidas', icon: Inbox },
  { id: 'enviadas', label: 'Ofertas enviadas', icon: Send },
  { id: 'favoritos', label: 'Favoritos', icon: Heart },
  { id: 'perfil', label: 'Perfil', icon: UserCog },
] as const

type TabId = (typeof TABS)[number]['id']

export function AccountPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const requested = searchParams.get('tab') as TabId | null
  const active: TabId = TABS.some((tab) => tab.id === requested) ? requested! : 'publicaciones'

  function setTab(tab: TabId) {
    const next = new URLSearchParams(searchParams)
    if (tab === 'publicaciones') {
      next.delete('tab')
    } else {
      next.set('tab', tab)
    }
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">Mi cuenta</h1>
          <p className="text-muted mt-1.5">
            Hola {user?.fullName.split(' ')[0]}. Administra tus publicaciones y tus negociaciones.
          </p>
        </div>
        <Link to="/publicar">
          <Button icon={<Plus className="size-4" />}>Publicar vehículo</Button>
        </Link>
      </header>

      <div
        role="tablist"
        aria-label="Secciones de la cuenta"
        className="mb-7 flex gap-1 overflow-x-auto border-b border-surface pb-px"
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={active === id}
            onClick={() => setTab(id)}
            className={cn(
              '-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors',
              active === id
                ? 'border-brand-600 text-brand-700 dark:text-brand-300'
                : 'text-muted hover:text-strong border-transparent',
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {active === 'publicaciones' ? <MyListingsTab /> : null}
      {active === 'recibidas' ? <ReceivedOffersTab /> : null}
      {active === 'enviadas' ? <SentOffersTab /> : null}
      {active === 'favoritos' ? <FavoritesTab /> : null}
      {active === 'perfil' ? <ProfileTab /> : null}
    </div>
  )
}

/* ── Mis publicaciones ──────────────────────────────────────────────────── */

function MyListingsTab() {
  const [page, setPage] = useState(0)
  const { data, isPending, isError, error, refetch } = useMyListings(page)
  const changeStatus = useChangeListingStatus()
  const remove = useDeleteListing()
  const toast = useToast()

  async function apply(id: number, status: ListingStatus, label: string) {
    try {
      await changeStatus.mutateAsync({ id, status })
      toast.success(label)
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'No pudimos actualizar la publicación',
      )
    }
  }

  async function onDelete(id: number, title: string) {
    // Borrar es irreversible: se confirma antes de enviar la petición.
    if (!window.confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) {
      return
    }
    try {
      await remove.mutateAsync(id)
      toast.success('Publicación eliminada')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No pudimos eliminar la publicación')
    }
  }

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }

  if (isPending) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <ListingCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (data.content.length === 0) {
    return (
      <EmptyState
        icon={<Car className="size-5" aria-hidden />}
        title="Aún no tienes publicaciones"
        description="Publicar es gratis y toma tres pasos. Puedes guardar un borrador y terminarlo después."
        action={
          <Link to="/publicar">
            <Button size="sm" icon={<Plus className="size-4" />}>
              Publicar mi vehículo
            </Button>
          </Link>
        }
      />
    )
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.content.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            showStatus
            actions={
              <>
                {listing.status === 'DRAFT' ? (
                  <Button
                    size="sm"
                    icon={<Upload className="size-3.5" />}
                    onClick={() => void apply(listing.id, 'PUBLISHED', 'Publicación al aire')}
                  >
                    Publicar
                  </Button>
                ) : null}
                {listing.status === 'PUBLISHED' || listing.status === 'RESERVED' ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<Check className="size-3.5" />}
                    onClick={() => void apply(listing.id, 'SOLD', 'Marcado como vendido')}
                  >
                    Marcar vendido
                  </Button>
                ) : null}
                {listing.status !== 'ARCHIVED' ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Archive className="size-3.5" />}
                    onClick={() => void apply(listing.id, 'ARCHIVED', 'Publicación archivada')}
                  >
                    Archivar
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Trash2 className="size-3.5" />}
                  onClick={() => void onDelete(listing.id, listing.title)}
                >
                  Eliminar
                </Button>
              </>
            }
          />
        ))}
      </div>

      <div className="mt-8">
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          onChange={setPage}
        />
      </div>
    </>
  )
}

/* ── Ofertas ────────────────────────────────────────────────────────────── */

const OFFER_BADGE = {
  PENDING: { tone: 'warning', label: 'Pendiente' },
  ACCEPTED: { tone: 'success', label: 'Aceptada' },
  REJECTED: { tone: 'danger', label: 'Rechazada' },
  WITHDRAWN: { tone: 'neutral', label: 'Retirada' },
} as const

function OfferRow({ offer, children }: { offer: Offer; children?: React.ReactNode }) {
  const badge = OFFER_BADGE[offer.status]

  return (
    <li className="surface-card flex flex-col gap-3 rounded-panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={`/vehiculos?text=${encodeURIComponent(offer.listingReference)}`}
            className="text-strong font-medium hover:underline"
          >
            {offer.listingTitle}
          </Link>
          <p className="text-muted mt-0.5 font-mono text-xs">{offer.listingReference}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={badge.tone}>{badge.label}</Badge>
          <p className="numeric text-strong text-lg font-semibold">
            {formatPrice(offer.amount, offer.currency)}
          </p>
        </div>
      </div>

      {offer.message ? (
        <p className="bg-surface-sunken text-muted rounded-xl px-3.5 py-2.5 text-sm">
          {offer.message}
        </p>
      ) : null}

      <div className="text-muted flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <span>{formatRelative(offer.createdAt)}</span>
        {offer.status === 'ACCEPTED' && offer.buyerPhone ? (
          <span className="text-strong font-medium">Contacto: {offer.buyerPhone}</span>
        ) : null}
      </div>

      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </li>
  )
}

function ReceivedOffersTab() {
  const [page, setPage] = useState(0)
  const { data, isPending, isError, error, refetch } = useOffersReceived(page)
  const action = useOfferAction()
  const toast = useToast()

  async function run(offerId: number, type: 'accept' | 'reject') {
    try {
      await action.mutateAsync({ offerId, action: type })
      toast.success(
        type === 'accept'
          ? 'Oferta aceptada. El vehículo quedó reservado y las demás ofertas se rechazaron.'
          : 'Oferta rechazada',
      )
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No pudimos procesar la oferta')
    }
  }

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }
  if (isPending) {
    return <OffersSkeleton />
  }
  if (data.content.length === 0) {
    return (
      <EmptyState
        icon={<Inbox className="size-5" aria-hidden />}
        title="No has recibido ofertas"
        description="Cuando alguien proponga un precio por uno de tus vehículos, aparecerá aquí."
      />
    )
  }

  return (
    <>
      <ul className="flex flex-col gap-4">
        {data.content.map((offer) => (
          <OfferRow key={offer.id} offer={offer}>
            {offer.status === 'PENDING' ? (
              <>
                <Button
                  size="sm"
                  icon={<Handshake className="size-3.5" />}
                  loading={action.isPending}
                  onClick={() => void run(offer.id, 'accept')}
                >
                  Aceptar
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<X className="size-3.5" />}
                  loading={action.isPending}
                  onClick={() => void run(offer.id, 'reject')}
                >
                  Rechazar
                </Button>
              </>
            ) : null}
          </OfferRow>
        ))}
      </ul>
      <div className="mt-8">
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          onChange={setPage}
        />
      </div>
    </>
  )
}

function SentOffersTab() {
  const [page, setPage] = useState(0)
  const { data, isPending, isError, error, refetch } = useOffersSent(page)
  const action = useOfferAction()
  const toast = useToast()

  async function withdraw(offerId: number) {
    try {
      await action.mutateAsync({ offerId, action: 'withdraw' })
      toast.success('Oferta retirada')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No pudimos retirar la oferta')
    }
  }

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }
  if (isPending) {
    return <OffersSkeleton />
  }
  if (data.content.length === 0) {
    return (
      <EmptyState
        icon={<Send className="size-5" aria-hidden />}
        title="No has hecho ofertas"
        description="Cuando encuentres un vehículo que te interese, propón tu precio desde su ficha."
        action={
          <Link to="/vehiculos">
            <Button size="sm">Ver el catálogo</Button>
          </Link>
        }
      />
    )
  }

  return (
    <>
      <ul className="flex flex-col gap-4">
        {data.content.map((offer) => (
          <OfferRow key={offer.id} offer={offer}>
            {offer.status === 'PENDING' ? (
              <Button
                size="sm"
                variant="secondary"
                loading={action.isPending}
                onClick={() => void withdraw(offer.id)}
              >
                Retirar oferta
              </Button>
            ) : null}
          </OfferRow>
        ))}
      </ul>
      <div className="mt-8">
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          onChange={setPage}
        />
      </div>
    </>
  )
}

function OffersSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-32 w-full rounded-panel" />
      ))}
    </div>
  )
}

/* ── Favoritos ──────────────────────────────────────────────────────────── */

function FavoritesTab() {
  const { data, isPending, isError, error, refetch } = useFavorites()

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }
  if (isPending) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <ListingCardSkeleton key={index} />
        ))}
      </div>
    )
  }
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="size-5" aria-hidden />}
        title="No tienes favoritos"
        description="Guarda los vehículos que te interesan para compararlos con calma."
        action={
          <Link to="/vehiculos">
            <Button size="sm">Explorar el catálogo</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}

/* ── Perfil ─────────────────────────────────────────────────────────────── */

function ProfileTab() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    fullName: user?.fullName ?? '',
    phone: user?.phone ?? '',
  })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const [error, setError] = useState<string | null>(null)

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const updated = await authApi.updateProfile({
        fullName: profile.fullName,
        phone: profile.phone || undefined,
        cityCode: user?.cityCode ?? undefined,
        avatarUrl: user?.avatarUrl ?? undefined,
      })
      setUser(updated)
      toast.success('Perfil actualizado')
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'No pudimos guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  async function savePassword(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await authApi.changePassword(passwords.currentPassword, passwords.newPassword)
      setPasswords({ currentPassword: '', newPassword: '' })
      toast.success('Clave actualizada')
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'No pudimos cambiar la clave')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form onSubmit={saveProfile} className="surface-card flex flex-col gap-4 rounded-panel p-6">
        <h2 className="text-lg font-semibold">Datos personales</h2>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <TextField
          label="Nombre completo"
          required
          value={profile.fullName}
          onChange={(event) => setProfile((state) => ({ ...state, fullName: event.target.value }))}
        />
        <TextField
          label="Teléfono"
          type="tel"
          hint="Se comparte con el comprador cuando aceptas una oferta"
          value={profile.phone}
          onChange={(event) => setProfile((state) => ({ ...state, phone: event.target.value }))}
        />
        <TextField label="Correo" value={user?.email ?? ''} disabled hint="El correo no se puede cambiar" />

        <Button type="submit" loading={saving} className="self-start">
          Guardar cambios
        </Button>
      </form>

      <form onSubmit={savePassword} className="surface-card flex flex-col gap-4 rounded-panel p-6">
        <h2 className="text-lg font-semibold">Cambiar clave</h2>

        <TextField
          label="Clave actual"
          type="password"
          autoComplete="current-password"
          required
          value={passwords.currentPassword}
          onChange={(event) =>
            setPasswords((state) => ({ ...state, currentPassword: event.target.value }))
          }
        />
        <TextField
          label="Nueva clave"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="Mínimo 8 caracteres"
          value={passwords.newPassword}
          onChange={(event) =>
            setPasswords((state) => ({ ...state, newPassword: event.target.value }))
          }
        />

        <Button type="submit" variant="secondary" loading={saving} className="self-start">
          Actualizar clave
        </Button>
      </form>
    </div>
  )
}
