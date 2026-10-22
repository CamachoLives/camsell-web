import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuthStore } from '@/features/auth/store'
import type { UserRole } from '@/shared/api/types'
import { EmptyState, Spinner } from '@/shared/ui/Feedback'

interface ProtectedRouteProps {
  children: ReactNode
  /** Si se indica, además de sesión se exige uno de estos roles. */
  roles?: UserRole[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user)
  const initializing = useAuthStore((state) => state.initializing)
  const location = useLocation()

  // Mientras se revalida el token guardado no se decide nada: redirigir aquí
  // expulsaría a una persona que sí tiene sesión válida.
  if (initializing) {
    return <Spinner label="Verificando tu sesión" />
  }

  if (!user) {
    return <Navigate to="/ingresar" replace state={{ from: location.pathname + location.search }} />
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          title="No tienes acceso a esta sección"
          description="Tu cuenta no cuenta con los permisos necesarios. Si crees que es un error, contacta al administrador."
        />
      </div>
    )
  }

  return <>{children}</>
}
