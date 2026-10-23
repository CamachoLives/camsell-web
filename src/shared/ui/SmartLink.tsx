import type { ReactNode } from 'react'
import { Link, NavLink, type NavLinkProps } from 'react-router-dom'

import { preloadPage, type PageKey } from '@/app/routes'

interface SmartLinkProps {
  to: string
  /** Vista cuyo fragmento se descarga al posarse o enfocar el enlace. */
  prefetch?: PageKey
  className?: string
  children: ReactNode
  state?: unknown
  'aria-label'?: string
  onClick?: () => void
}

/**
 * Enlace que adelanta la descarga del código de su destino.
 *
 * <p>Posarse sobre un enlace es una señal fiable de intención. Descargar el
 * fragmento en ese momento suele dejarlo listo antes del clic, de modo que la
 * navegación se siente inmediata aunque la aplicación esté dividida por rutas.
 * También se dispara al enfocar con el teclado, para no castigar a quien no usa
 * un ratón.
 */
export function SmartLink({ to, prefetch, children, ...rest }: SmartLinkProps) {
  const warm = prefetch ? () => preloadPage(prefetch) : undefined

  return (
    <Link to={to} onPointerEnter={warm} onFocus={warm} {...rest}>
      {children}
    </Link>
  )
}

type SmartNavLinkProps = NavLinkProps & { prefetch?: PageKey }

export function SmartNavLink({ prefetch, children, ...rest }: SmartNavLinkProps) {
  const warm = prefetch ? () => preloadPage(prefetch) : undefined

  return (
    <NavLink onPointerEnter={warm} onFocus={warm} {...rest}>
      {children}
    </NavLink>
  )
}
