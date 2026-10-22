import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'

import { Footer } from '@/shared/layout/Footer'
import { Header } from '@/shared/layout/Header'
import { ToastViewport } from '@/shared/ui/toast'

export function AppShell() {
  const { pathname } = useLocation()

  // Cada navegación mueve el foco al contenido, para que el lector de pantalla
  // anuncie la vista nueva y no siga leyendo el menú.
  useEffect(() => {
    document.getElementById('contenido')?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="bg-brand-600 sr-only rounded-lg px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        Saltar al contenido
      </a>

      <Header />

      <main id="contenido" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>

      <Footer />
      <ToastViewport />
      <ScrollRestoration />
    </div>
  )
}
