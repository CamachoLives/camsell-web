import { Skeleton } from '@/shared/ui/Feedback'

/**
 * Relleno mientras se descarga el código de una vista.
 *
 * <p>Imita la estructura general de una página en lugar de mostrar un spinner
 * centrado: la silueta correcta hace que el cambio se perciba como la página
 * apareciendo y no como un salto entre dos estados distintos.
 */
export function RouteFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8" role="status" aria-label="Cargando vista">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-2/3 max-w-md" />
        <Skeleton className="h-4 w-1/2 max-w-sm" />
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="surface-card overflow-hidden rounded-card">
            <Skeleton className="aspect-[4/3] rounded-none" />
            <div className="flex flex-col gap-2.5 p-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
