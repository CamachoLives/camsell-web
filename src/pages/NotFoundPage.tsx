import { Compass, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

import { usePaletteStore } from '@/features/search/paletteStore'
import { Button } from '@/shared/ui/Button'

export function NotFoundPage() {
  const openPalette = usePaletteStore((state) => state.setOpen)

  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-20 text-center">
      <div className="relative select-none">
        <p
          className="text-[8rem] font-black leading-none tracking-tighter text-brand-500/10 dark:text-brand-400/10 sm:text-[10rem]"
          aria-hidden
        >
          404
        </p>
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="bg-surface-sunken text-muted grid size-14 place-items-center rounded-panel">
            <Compass className="size-6 animate-[spin_8s_linear_infinite]" aria-hidden />
          </span>
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-brand-600 dark:text-brand-300 text-sm font-semibold tracking-wide uppercase">
          Error 404
        </p>
        <h1 className="text-2xl font-semibold sm:text-3xl">Esta página no existe</h1>
        <p className="text-muted max-w-sm text-sm">
          El enlace puede estar roto o la publicación que buscabas ya no está disponible.
        </p>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <Link to="/">
          <Button variant="secondary">Ir al inicio</Button>
        </Link>
        <Link to="/vehiculos">
          <Button>Ver el catálogo</Button>
        </Link>
        <Button
          variant="glass"
          icon={<Search className="size-4" />}
          onClick={() => openPalette(true)}
        >
          Buscar un vehículo
        </Button>
      </div>
    </section>
  )
}
