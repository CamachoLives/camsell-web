const LOCALE = 'es-CO'

const currencyFormatters = new Map<string, Intl.NumberFormat>()

function currencyFormatter(currency: string): Intl.NumberFormat {
  const existing = currencyFormatters.get(currency)
  if (existing) {
    return existing
  }
  const formatter = new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })
  currencyFormatters.set(currency, formatter)
  return formatter
}

/** Precio completo, por ejemplo `$ 168.900.000`. */
export function formatPrice(amount: number, currency = 'COP'): string {
  return currencyFormatter(currency).format(amount)
}

/**
 * Precio compacto para tarjetas y chips, por ejemplo `$ 168,9 M`. Mantiene la
 * lectura rapida en listados largos sin perder la magnitud.
 */
export function formatPriceCompact(amount: number, currency = 'COP'): string {
  const symbol = currency === 'COP' || currency === 'USD' ? '$' : `${currency} `
  if (amount >= 1_000_000_000) {
    return `${symbol}${trim(amount / 1_000_000_000)} MM`
  }
  if (amount >= 1_000_000) {
    return `${symbol}${trim(amount / 1_000_000)} M`
  }
  if (amount >= 1_000) {
    return `${symbol}${trim(amount / 1_000)} K`
  }
  return `${symbol}${amount}`
}

function trim(value: number): string {
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(LOCALE).format(value)
}

/** Kilometraje con unidad, o `0 km` si viene vacío. */
export function formatMileage(value: number): string {
  return `${formatNumber(value)} km`
}

export function formatDate(value?: string | null): string {
  if (!value) {
    return '—'
  }
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatDateShort(value?: string | null): string {
  if (!value) {
    return '—'
  }
  return new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

/** Tiempo relativo legible, por ejemplo `hace 3 días`. */
export function formatRelative(value?: string | null): string {
  if (!value) {
    return '—'
  }
  const target = new Date(value).getTime()
  const diffSeconds = Math.round((target - Date.now()) / 1000)
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ]
  const formatter = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' })

  for (const [unit, seconds] of units) {
    if (Math.abs(diffSeconds) >= seconds) {
      return formatter.format(Math.round(diffSeconds / seconds), unit)
    }
  }
  return formatter.format(Math.round(diffSeconds), 'second')
}

export function initials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}
