import { useEffect, useState } from 'react'

/**
 * Retrasa la propagacion de un valor. Se usa en el buscador para no disparar
 * una consulta por cada tecla.
 */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}
