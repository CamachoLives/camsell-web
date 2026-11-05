import { ArrowUp, Code2 } from 'lucide-react'
import { useMemo } from 'react'

import { Logo } from '@/shared/layout/Logo'
import { SmartLink } from '@/shared/ui/SmartLink'
import type { PageKey } from '@/app/routes'

interface FooterLink {
  to: string
  label: string
  prefetchPage: PageKey
}

const SECTIONS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Comprar',
    links: [
      { to: '/vehiculos', label: 'Todo el catálogo', prefetchPage: 'listings' },
      { to: '/vehiculos?attr=CONDITION%3ANEW', label: 'Vehículos nuevos', prefetchPage: 'listings' },
      { to: '/vehiculos?attr=FUEL_TYPE%3AELECTRIC', label: 'Eléctricos', prefetchPage: 'listings' },
      { to: '/vehiculos?attr=FUEL_TYPE%3AHYBRID', label: 'Híbridos', prefetchPage: 'listings' },
    ],
  },
  {
    title: 'Vender',
    links: [
      { to: '/publicar', label: 'Publicar mi vehículo', prefetchPage: 'publish' },
      { to: '/cuenta', label: 'Mis publicaciones', prefetchPage: 'account' },
      { to: '/cuenta?tab=recibidas', label: 'Ofertas recibidas', prefetchPage: 'account' },
    ],
  },
  {
    title: 'Informarse',
    links: [
      { to: '/noticias', label: 'Últimas noticias', prefetchPage: 'news' },
      { to: '/noticias?categoryCode=BUYING_GUIDE', label: 'Guías de compra', prefetchPage: 'news' },
      { to: '/noticias?categoryCode=TEST_DRIVE', label: 'Pruebas de manejo', prefetchPage: 'news' },
    ],
  },
]

export function Footer() {
  const currentYear = useMemo(() => new Date().getFullYear(), [])

  return (
    <footer className="bg-surface-sunken relative mt-24 overflow-hidden border-t border-surface">
      {/* Retícula invertida: ancla el pie de página sin competir con el texto. */}
      <div
        aria-hidden
        className="bg-grid absolute inset-0 rotate-180 opacity-70"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="text-muted max-w-xs text-sm leading-relaxed">
              Marketplace de vehículos con filtros que de verdad sirven, publicación guiada y las
              novedades del mercado colombiano en un solo lugar.
            </p>
            <a
              href="https://github.com/CamachoLives/camsell-web"
              target="_blank"
              rel="noreferrer"
              className="text-muted hover:text-strong hover:border-surface-strong inline-flex w-fit items-center gap-2 rounded-lg border border-surface px-3 py-1.5 text-xs font-medium transition-colors"
            >
              <Code2 className="size-3.5" aria-hidden />
              Código del proyecto
            </a>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-strong mb-3.5 text-xs font-semibold tracking-widest uppercase">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <li key={`${section.title}-${link.label}`}>
                    <SmartLink
                      to={link.to}
                      prefetchPage={link.prefetchPage}
                      className="text-muted hover:text-strong group relative inline-flex items-center gap-1 text-sm transition-colors"
                    >
                      <span className="bg-brand-500 absolute -left-2 h-3.5 w-0.5 rounded-full opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                      {link.label}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Separador con gradiente de marca */}
        <div
          aria-hidden
          className="mt-12 h-px w-full bg-gradient-to-r from-transparent via-brand-500/30 to-transparent"
        />

        <div className="text-muted mt-6 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Camsell. Proyecto de demostración.</p>
          <div className="flex items-center gap-4">
            <p>Los vehículos y las notas son datos de ejemplo.</p>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Volver al inicio de la página"
              className="hover:text-strong inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1 transition-colors hover:border-surface"
            >
              <ArrowUp className="size-3" aria-hidden />
              Inicio
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
