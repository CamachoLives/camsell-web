import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format'

interface PaginationProps {
  page: number
  totalPages: number
  totalElements: number
  onChange: (page: number) => void
}

export function Pagination({ page, totalPages, totalElements, onChange }: PaginationProps) {
  if (totalPages <= 1) {
    return (
      <p className="text-muted text-center text-sm">
        {formatNumber(totalElements)} {totalElements === 1 ? 'resultado' : 'resultados'}
      </p>
    )
  }

  const pages = windowOf(page, totalPages)

  return (
    <nav
      aria-label="Paginación de resultados"
      className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
    >
      <p className="text-muted text-sm">
        {formatNumber(totalElements)} resultados · página {page + 1} de {totalPages}
      </p>

      <div className="flex items-center gap-1">
        <PageButton
          label="Anterior"
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
          icon={<ChevronLeft className="size-4" aria-hidden />}
        />
        {pages.map((candidate, index) =>
          candidate === null ? (
            <span key={`gap-${index}`} className="text-muted px-1 text-sm">
              …
            </span>
          ) : (
            <button
              key={candidate}
              type="button"
              aria-current={candidate === page ? 'page' : undefined}
              onClick={() => onChange(candidate)}
              className={cn(
                'h-9 min-w-9 rounded-lg px-2 text-sm font-medium transition-colors',
                candidate === page
                  ? 'bg-brand-600 text-white'
                  : 'text-muted hover:bg-surface-sunken hover:text-strong',
              )}
            >
              {candidate + 1}
            </button>
          ),
        )}
        <PageButton
          label="Siguiente"
          disabled={page >= totalPages - 1}
          onClick={() => onChange(page + 1)}
          icon={<ChevronRight className="size-4" aria-hidden />}
        />
      </div>
    </nav>
  )
}

function PageButton({
  label,
  disabled,
  onClick,
  icon,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  icon: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="text-muted hover:bg-surface-sunken hover:text-strong grid size-9 place-items-center rounded-lg transition-colors disabled:pointer-events-none disabled:opacity-40"
    >
      {icon}
    </button>
  )
}

/** Ventana de páginas con elipsis, para no pintar cien botones. */
function windowOf(current: number, total: number): (number | null)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index)
  }

  const result: (number | null)[] = [0]
  const start = Math.max(1, current - 1)
  const end = Math.min(total - 2, current + 1)

  if (start > 1) {
    result.push(null)
  }
  for (let index = start; index <= end; index += 1) {
    result.push(index)
  }
  if (end < total - 2) {
    result.push(null)
  }
  result.push(total - 1)

  return result
}
