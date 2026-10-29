import { BadgeCheck, Car, Handshake, Newspaper, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { SmartLink } from '@/shared/ui/SmartLink'

const STORAGE_KEY = 'camsell.welcomed'

const STEPS = [
  {
    icon: <Car className="size-7" aria-hidden />,
    title: 'Explora el catálogo',
    body: 'Filtra por marca, tipo de carrocería, combustible, precio y más. Los filtros se adaptan solos según lo que hay en venta.',
  },
  {
    icon: <Handshake className="size-7" aria-hidden />,
    title: 'Negocia directo',
    body: 'Envía una oferta al vendedor. Si la acepta, el vehículo queda reservado para ti. Sin intermediarios ni comisiones.',
  },
  {
    icon: <BadgeCheck className="size-7" aria-hidden />,
    title: 'Publica gratis',
    body: 'Tres pasos, cero costo. Crea tu cuenta, sube fotos y fija tu precio. Las ofertas llegan a tu cuenta.',
  },
  {
    icon: <Newspaper className="size-7" aria-hidden />,
    title: 'Mantente informado',
    body: 'Camsell Informa te trae noticias del mercado automotor colombiano para que decidas con datos.',
  },
]

export function WelcomeModal() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        // Short delay so the page paints first
        const timer = window.setTimeout(() => setOpen(true), 900)
        return () => window.clearTimeout(timer)
      }
    } catch {
      // Private mode or quota — skip
    }
  }, [])

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore
    }
    setOpen(false)
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      dismiss()
    }
  }

  if (!open) return null

  const current = STEPS[step]

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={dismiss}
        className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Bienvenido a Camsell"
        className="surface-glass animate-pop relative w-full max-w-md overflow-hidden rounded-panel shadow-2xl"
      >
        <button
          type="button"
          aria-label="Cerrar"
          onClick={dismiss}
          className="text-muted hover:text-strong absolute top-4 right-4 grid size-8 place-items-center rounded-xl transition-colors"
        >
          <X className="size-4" aria-hidden />
        </button>

        <div className="p-8 pb-6">
          <div className="bg-brand-500/12 text-brand-600 dark:text-brand-300 mb-5 grid size-14 place-items-center rounded-2xl">
            {current.icon}
          </div>

          <h2 className="text-xl font-semibold">{current.title}</h2>
          <p className="text-muted mt-2 text-sm leading-relaxed">{current.body}</p>

          {/* Dot indicators */}
          <div className="mt-6 flex justify-center gap-1.5" aria-hidden>
            {STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStep(i)}
                className={cn(
                  'rounded-full transition-all duration-300',
                  i === step
                    ? 'bg-brand-500 w-5 h-1.5'
                    : 'bg-surface-sunken w-1.5 h-1.5',
                )}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-surface p-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={dismiss}
            className="text-muted hover:text-strong text-sm transition-colors"
          >
            Saltar
          </button>
          <div className="flex gap-2">
            {step > 0 ? (
              <Button variant="secondary" size="sm" onClick={() => setStep((s) => s - 1)}>
                Anterior
              </Button>
            ) : null}
            {step < STEPS.length - 1 ? (
              <Button size="sm" onClick={next}>
                Siguiente
              </Button>
            ) : (
              <SmartLink to="/vehiculos" prefetchPage="listings" onClick={dismiss}>
                <Button size="sm">Explorar el catálogo</Button>
              </SmartLink>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
