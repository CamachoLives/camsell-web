import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { ListingImage } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'

interface ListingGalleryProps {
  images: ListingImage[]
  title: string
}

export function ListingGallery({ images, title }: ListingGalleryProps) {
  const [index, setIndex] = useState(0)
  const total = images.length

  // Las flechas del teclado recorren la galería cuando hay más de una foto.
  useEffect(() => {
    if (total <= 1) {
      return
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') {
        setIndex((value) => (value - 1 + total) % total)
      }
      if (event.key === 'ArrowRight') {
        setIndex((value) => (value + 1) % total)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [total])

  if (total === 0) {
    return (
      <div className="bg-surface-sunken text-muted grid aspect-[16/10] place-items-center rounded-2xl">
        <div className="flex flex-col items-center gap-2">
          <ImageOff className="size-8" aria-hidden />
          <p className="text-sm">Esta publicación no tiene imágenes</p>
        </div>
      </div>
    )
  }

  const current = images[index]

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-surface-sunken relative overflow-hidden rounded-2xl">
        <img
          src={current.url}
          alt={current.alt ?? `${title}, imagen ${index + 1} de ${total}`}
          className="aspect-[16/10] w-full object-cover"
        />

        {total > 1 ? (
          <>
            <GalleryArrow
              side="left"
              label="Imagen anterior"
              onClick={() => setIndex((value) => (value - 1 + total) % total)}
            />
            <GalleryArrow
              side="right"
              label="Imagen siguiente"
              onClick={() => setIndex((value) => (value + 1) % total)}
            />
            <span className="absolute right-3 bottom-3 rounded-full bg-neutral-950/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {index + 1} / {total}
            </span>
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
                  'bg-surface-sunken block w-full overflow-hidden rounded-lg border-2 transition-colors',
                  position === index ? 'border-brand-600' : 'border-transparent hover:border-surface',
                )}
              >
                <img
                  src={image.url}
                  alt=""
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function GalleryArrow({
  side,
  label,
  onClick,
}: {
  side: 'left' | 'right'
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'absolute top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-neutral-950/55 text-white backdrop-blur-sm transition-colors hover:bg-neutral-950/80',
        side === 'left' ? 'left-3' : 'right-3',
      )}
    >
      {side === 'left' ? (
        <ChevronLeft className="size-5" aria-hidden />
      ) : (
        <ChevronRight className="size-5" aria-hidden />
      )}
    </button>
  )
}
