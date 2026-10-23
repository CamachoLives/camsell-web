import type { ReactNode } from 'react'
import { Link, NavLink, type NavLinkProps } from 'react-router-dom'

import { preloadPage, type PageKey } from '@/app/routes'

interface SmartLinkProps {
  to: string
  /** Vista cuyo fragmento se descarga al posarse o enfocar el enlace. */
  prefetchPage?: PageKey
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
export function SmartLink({ to, prefetchPage, children, ...rest }: SmartLinkProps) {
  const warm = prefetchPage ? () => preloadPage(prefetchPage) : undefined

  return (
    <Link to={to} onPointerEnter={warm} onFocus={warm} {...rest}>
      {children}
    </Link>
  )
}

type SmartNavLinkProps = NavLinkProps & { prefetchPage?: PageKey }

export function SmartNavLink({ prefetchPage, children, ...rest }: SmartNavLinkProps) {
  const warm = prefetchPage ? () => preloadPage(prefetchPage) : undefined

  return (
    <NavLink onPointerEnter={warm} onFocus={warm} {...rest}>
      {children}
    </NavLink>
  )
}
