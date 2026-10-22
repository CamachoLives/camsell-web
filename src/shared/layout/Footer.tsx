import { Code2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Logo } from '@/shared/layout/Logo'

const SECTIONS = [
  {
    title: 'Comprar',
    links: [
      { to: '/vehiculos', label: 'Todo el catálogo' },
      { to: '/vehiculos?attr=CONDITION%3ANEW', label: 'Vehículos nuevos' },
      { to: '/vehiculos?attr=FUEL_TYPE%3AELECTRIC', label: 'Eléctricos' },
      { to: '/vehiculos?attr=FUEL_TYPE%3AHYBRID', label: 'Híbridos' },
    ],
  },
  {
    title: 'Vender',
    links: [
      { to: '/publicar', label: 'Publicar mi vehículo' },
      { to: '/cuenta', label: 'Mis publicaciones' },
      { to: '/cuenta', label: 'Ofertas recibidas' },
    ],
  },
  {
    title: 'Informarse',
    links: [
      { to: '/noticias', label: 'Últimas noticias' },
      { to: '/noticias?categoryCode=BUYING_GUIDE', label: 'Guías de compra' },
      { to: '/noticias?categoryCode=TEST_DRIVE', label: 'Pruebas de manejo' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-surface-sunken mt-20 border-t border-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="text-muted max-w-xs text-sm">
              Marketplace de vehículos con filtros que de verdad sirven, publicación guiada y las
              novedades del mercado colombiano en un solo lugar.
            </p>
            <a
              href="https://github.com/CamachoLives/camsell-web"
              target="_blank"
              rel="noreferrer"
              className="text-muted hover:text-strong inline-flex w-fit items-center gap-2 text-sm transition-colors"
            >
              <Code2 className="size-4" aria-hidden />
              Código del proyecto
            </a>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-strong mb-3 text-sm font-semibold">{section.title}</h3>
              <ul className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={`${section.title}-${link.label}`}>
                    <Link
                      to={link.to}
                      className="text-muted hover:text-strong text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-muted mt-10 flex flex-col gap-2 border-t border-surface pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Camsell. Proyecto de demostración.</p>
          <p>
            Los vehículos y las notas son datos de ejemplo generados para probar la plataforma.
          </p>
        </div>
      </div>
    </footer>
  )
}
