import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { useAuthStore } from '@/features/auth/store'
import { AccountPage } from '@/pages/AccountPage'
import { HomePage } from '@/pages/HomePage'
import { ListingDetailPage } from '@/pages/ListingDetailPage'
import { ListingsPage } from '@/pages/ListingsPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PublishListingPage } from '@/pages/PublishListingPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { queryClient } from '@/shared/api/queryClient'
import { AppShell } from '@/shared/layout/AppShell'

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/vehiculos', element: <ListingsPage /> },
      { path: '/vehiculos/:slug', element: <ListingDetailPage /> },
      { path: '/ingresar', element: <LoginPage /> },
      { path: '/registro', element: <RegisterPage /> },
      {
        path: '/publicar',
        element: (
          <ProtectedRoute>
            <PublishListingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/cuenta',
        element: (
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
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

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
