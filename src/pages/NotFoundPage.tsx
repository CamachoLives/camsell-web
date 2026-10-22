import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui/Button'

export function NotFoundPage() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="bg-surface-sunken text-muted grid size-14 place-items-center rounded-2xl">
        <Compass className="size-6" aria-hidden />
      </span>
      <p className="text-brand-600 dark:text-brand-300 text-sm font-semibold">Error 404</p>
      <h1 className="text-3xl font-semibold">Esta página no existe</h1>
      <p className="text-muted">
        El enlace puede estar roto o la publicación que buscabas ya no está disponible.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <Link to="/">
          <Button variant="secondary">Ir al inicio</Button>
        </Link>
        <Link to="/vehiculos">
          <Button>Ver el catálogo</Button>
        </Link>
      </div>
    </section>
  )
}
