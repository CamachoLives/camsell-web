import { QueryClientProvider } from '@tanstack/react-query'
import { Suspense, useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import {
  AccountPage,
  AdminPage,
  ArticlePage,
  HomePage,
  ListingDetailPage,
  ListingsPage,
  LoginPage,
  NewsPage,
  NotFoundPage,
  PublishListingPage,
  RegisterPage,
  preloadPage,
} from '@/app/routes'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { useAuthStore } from '@/features/auth/store'
import { queryClient } from '@/shared/api/queryClient'
import { AppShell } from '@/shared/layout/AppShell'
import { RouteFallback } from '@/shared/layout/RouteFallback'

/** Envuelve cada vista diferida con su propio límite de suspensión. */
function page(element: React.ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: page(<HomePage />) },
      { path: '/vehiculos', element: page(<ListingsPage />) },
      { path: '/vehiculos/:slug', element: page(<ListingDetailPage />) },
      { path: '/noticias', element: page(<NewsPage />) },
      { path: '/noticias/:slug', element: page(<ArticlePage />) },
      { path: '/ingresar', element: page(<LoginPage />) },
      { path: '/registro', element: page(<RegisterPage />) },
      {
        path: '/publicar',
        element: page(
          <ProtectedRoute>
            <PublishListingPage />
          </ProtectedRoute>,
        ),
      },
      {
        path: '/cuenta',
        element: page(
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>,
        ),
      },
      {
        path: '/admin',
        element: page(
          <ProtectedRoute roles={['ADMIN']}>
            <AdminPage />
          </ProtectedRoute>,
        ),
      },
      { path: '*', element: page(<NotFoundPage />) },
    ],
  },
])

export function App() {
  const refreshProfile = useAuthStore((state) => state.refreshProfile)

  // Al arrancar se revalida el token guardado contra el backend, para no
  // mostrar datos de sesión que ya no son válidos.
  useEffect(() => {
    void refreshProfile()
  }, [refreshProfile])

  // El catálogo es el destino más probable desde cualquier vista. Se descarga
  // cuando el navegador está desocupado, para no competir con el primer pintado.
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 1200))
    const handle = idle(() => preloadPage('listings'))
    return () => {
      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(handle as number)
      } else {
        window.clearTimeout(handle as number)
      }
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
