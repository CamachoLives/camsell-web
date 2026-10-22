import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { useAuthStore } from '@/features/auth/store'
import { HomePage } from '@/pages/HomePage'
import { ListingsPage } from '@/pages/ListingsPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { queryClient } from '@/shared/api/queryClient'
import { AppShell } from '@/shared/layout/AppShell'

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/vehiculos', element: <ListingsPage /> },
      { path: '/ingresar', element: <LoginPage /> },
      { path: '/registro', element: <RegisterPage /> },
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
