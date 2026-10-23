import { Code2 } from 'lucide-react'

import { Logo } from '@/shared/layout/Logo'
import { SmartLink } from '@/shared/ui/SmartLink'
import type { PageKey } from '@/app/routes'

// Se calcula una vez al cargar el módulo: llamar a Date durante el render hace
// que el componente deje de ser puro.
const CURRENT_YEAR = new Date().getFullYear()

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
                      className="text-muted hover:text-strong text-sm transition-colors"
                    >
                      {link.label}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-muted mt-12 flex flex-col gap-2 border-t border-surface pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {CURRENT_YEAR} Camsell. Proyecto de demostración.</p>
          <p>Los vehículos y las notas son datos de ejemplo generados para probar la plataforma.</p>
        </div>
      </div>
    </footer>
  )
}
