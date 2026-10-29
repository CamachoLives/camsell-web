import { ArrowLeft, Check, X } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useCompareStore } from '@/features/compare/compareStore'
import { Button } from '@/shared/ui/Button'
import { Image } from '@/shared/ui/Image'
import { SmartLink } from '@/shared/ui/SmartLink'
import { formatMileage, formatPrice } from '@/shared/lib/format'

export function ComparePage() {
  const { items, remove } = useCompareStore()

  if (items.length < 2) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-muted text-lg">Agrega al menos 2 vehículos para comparar.</p>
        <Link to="/vehiculos" className="mt-6 inline-block">
          <Button>Explorar el catálogo</Button>
        </Link>
      </div>
    )
  }

  const specs: { label: string; key: keyof typeof items[0] }[] = [
    { label: 'Precio', key: 'price' },
    { label: 'Año', key: 'year' },
    { label: 'Kilometraje', key: 'mileageKm' },
    { label: 'Marca', key: 'brandName' },
    { label: 'Modelo', key: 'modelName' },
    { label: 'Ciudad', key: 'cityCode' },
    { label: 'Negociable', key: 'negotiable' },
  ]

  function renderValue(listing: typeof items[0], key: keyof typeof items[0]) {
    const val = listing[key]
    if (key === 'price') return formatPrice(listing.price, listing.currency)
    if (key === 'mileageKm') return formatMileage(listing.mileageKm)
    if (typeof val === 'boolean')
      return val ? <Check className="size-4 text-emerald-500" /> : <X className="size-4 text-red-400" />
    if (val === null || val === undefined || val === '') return <span className="text-muted">—</span>
    return String(val)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <Link
        to="/vehiculos"
        className="text-muted hover:text-strong mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Volver al catálogo
      </Link>

      <h1 className="mb-6 text-2xl font-semibold">Comparar vehículos</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-muted w-36 pr-4 pb-4 text-left text-xs font-semibold tracking-widest uppercase">
                Característica
              </th>
              {items.map((listing) => (
                <th key={listing.id} className="pb-4 text-left align-top">
                  <div className="surface-card relative mr-3 rounded-panel p-4">
                    <button
                      type="button"
                      aria-label={`Quitar ${listing.title}`}
                      onClick={() => remove(listing.id)}
                      className="text-muted hover:text-strong absolute top-3 right-3 transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                    <Image
                      src={listing.coverImageUrl}
                      alt={listing.title}
                      aspect="aspect-[16/10]"
                      className="mb-3 rounded-xl"
                    />
                    <p className="font-semibold leading-snug">{listing.title}</p>
                    <SmartLink
                      to={`/vehiculos/${listing.slug}`}
                      prefetchPage="listingDetail"
                      className="text-brand-700 dark:text-brand-300 mt-1 inline-block text-xs hover:underline"
                    >
                      Ver ficha completa
                    </SmartLink>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {specs.map(({ label, key }) => (
              <tr key={key} className="border-t border-surface">
                <td className="text-muted pr-4 py-3 text-xs font-medium">{label}</td>
                {items.map((listing) => (
                  <td key={listing.id} className="py-3 pr-3 font-medium">
                    {renderValue(listing, key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
