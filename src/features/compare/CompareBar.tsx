import { BarChart2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useCompareStore } from '@/features/compare/compareStore'
import { cn } from '@/shared/lib/cn'
import { formatPriceCompact } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'
import { Image } from '@/shared/ui/Image'

export function CompareBar() {
  const { items, remove, clear } = useCompareStore()
  const navigate = useNavigate()

  if (items.length === 0) return null

  return (
    <div
      aria-label="Vehículos para comparar"
      className={cn(
        'fixed bottom-0 inset-x-0 z-[60] border-t border-surface',
        'surface-glass shadow-lift',
        'animate-rise',
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:px-8">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {items.map((listing) => (
            <div
              key={listing.id}
              className="surface-card flex items-center gap-2 rounded-xl px-2.5 py-1.5"
            >
              <Image
                src={listing.coverImageUrl}
                alt={listing.title}
                aspect="aspect-square"
                className="size-9 shrink-0 rounded-lg"
              />
              <div className="min-w-0">
                <p className="max-w-[120px] truncate text-xs font-medium">{listing.title}</p>
                <p className="numeric text-muted text-[0.65rem]">
                  {formatPriceCompact(listing.price, listing.currency)}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Quitar ${listing.title} de la comparación`}
                onClick={() => remove(listing.id)}
                className="text-muted hover:text-strong ml-1 transition-colors"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          ))}

          {items.length < 3 ? (
            <p className="text-muted text-xs">
              {3 - items.length} {3 - items.length === 1 ? 'vehículo más' : 'vehículos más'} para
              comparar
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={clear}
            className="text-muted hover:text-strong text-xs transition-colors"
          >
            Limpiar
          </button>
          <Button
            size="sm"
            icon={<BarChart2 className="size-4" />}
            onClick={() => navigate('/comparar')}
            disabled={items.length < 2}
          >
            Comparar {items.length > 0 ? `(${items.length})` : ''}
          </Button>
        </div>
      </div>
    </div>
  )
}
