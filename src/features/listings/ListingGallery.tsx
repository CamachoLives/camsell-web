import { ChevronLeft, ChevronRight, Expand, ImageOff, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import type { ListingImage } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { Image } from '@/shared/ui/Image'

interface ListingGalleryProps {
  images: ListingImage[]
  title: string
}

export function ListingGallery({ images, title }: ListingGalleryProps) {
  const [index, setIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const total = images.length

  const go = useCallback(
    (delta: number) => setIndex((value) => (value + delta + total) % total),
    [total],
  )

  // Las flechas recorren la galería y Escape cierra la vista ampliada.
  useEffect(() => {
    if (total <= 1 && !zoomed) {
      return
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') {
        go(-1)
      }
      if (event.key === 'ArrowRight') {
        go(1)
      }
      if (event.key === 'Escape' && zoomed) {
        setZoomed(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [total, zoomed, go])

  // Con la vista ampliada abierta no debe desplazarse la página de fondo.
  useEffect(() => {
    if (!zoomed) {
      return
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [zoomed])

  if (total === 0) {
    return (
      <div className="bg-surface-sunken text-muted grid aspect-[16/10] place-items-center rounded-panel">
        <div className="flex flex-col items-center gap-2">
          <ImageOff className="size-8 opacity-50" aria-hidden />
          <p className="text-sm">Esta publicación no tiene imágenes</p>
        </div>
      </div>
    )
  }

  const current = images[index]

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="group relative overflow-hidden rounded-panel">
          <Image
            src={current.url}
            alt={current.alt ?? `${title}, imagen ${index + 1} de ${total}`}
            priority
            aspect="aspect-[16/10]"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />

          <button
            type="button"
            onClick={() => setZoomed(true)}
            aria-label="Ver la imagen en grande"
            className="absolute top-3 right-3 grid size-9 place-items-center rounded-xl border border-white/15 bg-neutral-950/55 text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Expand className="size-4" aria-hidden />
          </button>

          {total > 1 ? (
            <>
              <GalleryArrow side="left" label="Imagen anterior" onClick={() => go(-1)} />
              <GalleryArrow side="right" label="Imagen siguiente" onClick={() => go(1)} />

              {/* Progreso por segmentos: muestra cuántas fotos hay y en cuál
                  se está, sin ocupar el espacio de una fila de miniaturas. */}
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full border border-white/15 bg-neutral-950/50 px-2.5 py-1.5 backdrop-blur-md">
                {images.map((image, position) => (
                  <span
                    key={image.id}
                    aria-hidden
                    className={cn(
                      'h-1 rounded-full transition-all duration-300',
                      position === index ? 'w-5 bg-white' : 'w-1.5 bg-white/45',
                    )}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>

        {total > 1 ? (
          <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {images.map((image, position) => (
              <li key={image.id}>
                <button
                  type="button"
                  onClick={() => setIndex(position)}
                  aria-label={`Ver imagen ${position + 1}`}
                  aria-current={position === index}
                  className={cn(
                    'block w-full overflow-hidden rounded-lg border-2 transition-colors',
                    position === index
                      ? 'border-brand-500'
                      : 'border-transparent hover:border-surface-strong',
                  )}
                >
                  <Image src={image.url} alt="" aspect="aspect-[4/3]" sizes="120px" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {zoomed ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title}, imagen ampliada`}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-neutral-950/92 p-4"
        >
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setZoomed(false)}
            className="absolute inset-0"
          />
          <img
            src={current.url}
            alt={current.alt ?? title}
            className="animate-pop relative max-h-[88vh] max-w-full rounded-xl object-contain"
          />
          <button
            type="button"
            onClick={() => setZoomed(false)}
            aria-label="Cerrar"
            className="absolute top-4 right-4 grid size-10 place-items-center rounded-xl border border-white/15 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
          >
            <X className="size-5" aria-hidden />
          </button>

          {total > 1 ? (
            <>
              <GalleryArrow side="left" label="Imagen anterior" onClick={() => go(-1)} large />
              <GalleryArrow side="right" label="Imagen siguiente" onClick={() => go(1)} large />
              <p className="numeric absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-white/80">
                {index + 1} / {total}
              </p>
            </>
          ) : null}
        </div>
      ) : null}
    </>
  )
}

function GalleryArrow({
  side,
  label,
  onClick,
  large = false,
}: {
  side: 'left' | 'right'
  label: string
  onClick: () => void
  large?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'absolute top-1/2 grid -translate-y-1/2 place-items-center rounded-full',
        'border border-white/15 bg-neutral-950/55 text-white backdrop-blur-md',
        'transition-colors hover:bg-neutral-950/80',
        large ? 'size-11' : 'size-9',
        side === 'left' ? 'left-3' : 'right-3',
      )}
    >
      {side === 'left' ? (
        <ChevronLeft className={large ? 'size-6' : 'size-5'} aria-hidden />
      ) : (
        <ChevronRight className={large ? 'size-6' : 'size-5'} aria-hidden />
      )}
    </button>
  )
}
