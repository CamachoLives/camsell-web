import { Link } from 'react-router-dom'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Camsell, ir al inicio">
      <span className="bg-brand-600 grid size-9 shrink-0 place-items-center rounded-xl shadow-sm">
        <svg viewBox="0 0 32 32" className="size-6" aria-hidden>
          <path
            d="M7 19.5h18M9.5 19.5v2.2a1 1 0 0 1-1 1H7.8a1 1 0 0 1-1-1v-2.2M25.2 19.5v2.2a1 1 0 0 1-1 1h-.7a1 1 0 0 1-1-1v-2.2"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M7 19.5l1.9-5.6A2.6 2.6 0 0 1 11.4 12h9.2a2.6 2.6 0 0 1 2.5 1.9l1.9 5.6"
            stroke="white"
            strokeWidth="1.8"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="11" cy="16.6" r="1.1" fill="#f6b73c" />
          <circle cx="21" cy="16.6" r="1.1" fill="#f6b73c" />
        </svg>
      </span>
      {compact ? null : (
        <span className="flex flex-col leading-none">
          <span className="text-strong text-lg font-bold tracking-tight">Camsell</span>
          <span className="text-muted text-[0.65rem] font-medium tracking-wide uppercase">
            Compra y venta
          </span>
        </span>
      )}
    </Link>
  )
}
