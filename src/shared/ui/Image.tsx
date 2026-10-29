import { ImageOff } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cn } from '@/shared/lib/cn'

interface ImageProps {
  src?: string | null
  alt: string
  className?: string
  /** Proporción reservada antes de que la imagen llegue. */
  aspect?: string
  /** La portada visible al entrar no debe diferirse. */
  priority?: boolean
  sizes?: string
}

/**
 * Imagen con espacio reservado y entrada suave.
 *
 * <p>Reservar la proporción desde el primer pintado evita que el texto salte
 * cuando la imagen llega, que es el defecto más visible de una rejilla de
 * tarjetas. La imagen entra con un desvanecido corto y, mientras no está, se
 * ve un esqueleto en lugar de un hueco.
 *
 * <p>`priority` desactiva el diferido y sube la prioridad de descarga: tiene
 * sentido solo para lo que ya está en pantalla al entrar, porque diferir eso
 * retrasa justamente la imagen que la persona está mirando.
 */
export function Image({
  src,
  alt,
  className,
  aspect = 'aspect-[4/3]',
  priority = false,
  sizes,
}: ImageProps) {
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>(src ? 'loading' : 'failed')

  // Cuando src cambia (p.ej. al navegar entre fichas) hay que volver a cargar.
  useEffect(() => {
    setState(src ? 'loading' : 'failed')
  }, [src])

  if (!src || state === 'failed') {
    return (
      <div
        className={cn('bg-surface-sunken text-muted grid place-items-center', aspect, className)}
        role="img"
        aria-label={`${alt} (sin imagen)`}
      >
        <ImageOff className="size-7 opacity-50" aria-hidden />
      </div>
    )
  }

  return (
    <div className={cn('bg-surface-sunken relative overflow-hidden', aspect, className)}>
      {state === 'loading' ? <div className="skeleton absolute inset-0" aria-hidden /> : null}
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        // `decoding="async"` evita que decodificar una imagen grande bloquee
        // el hilo principal justo cuando se está desplazando la lista.
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setState('ready')}
        onError={() => setState('failed')}
        className={cn(
          'size-full object-cover transition-opacity duration-500',
          state === 'ready' ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  )
}
