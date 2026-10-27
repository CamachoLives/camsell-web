import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'

import { CommandPalette } from '@/features/search/CommandPalette'
import { Footer } from '@/shared/layout/Footer'
import { Header } from '@/shared/layout/Header'
import { ToastViewport } from '@/shared/ui/ToastViewport'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Camsell — Compra y vende carros sin dar vueltas',
  '/vehiculos': 'Catálogo de vehículos — Camsell',
  '/publicar': 'Publicar vehículo — Camsell',
  '/noticias': 'Noticias del mercado automotor — Camsell',
  '/ingresar': 'Ingresar — Camsell',
  '/registro': 'Crear cuenta — Camsell',
  '/cuenta': 'Mi cuenta — Camsell',
}

function resolveTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.startsWith('/vehiculos/')) return 'Detalle del vehículo — Camsell'
  if (pathname.startsWith('/noticias/')) return 'Artículo — Camsell'
  if (pathname.startsWith('/admin')) return 'Administración — Camsell'
  return 'Camsell'
}

export function AppShell() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.getElementById('contenido')?.focus({ preventScroll: true })
  }, [pathname])

  useEffect(() => {
    document.title = resolveTitle(pathname)
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
      <CommandPalette />
      <ToastViewport />
      <ScrollRestoration />
    </div>
  )
}
