import { Keyboard, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cn } from '@/shared/lib/cn'

interface Shortcut {
  keys: string[]
  description: string
  group: string
}

const isApple =
  typeof navigator !== 'undefined' &&
  (navigator.userAgentData?.platform
    ? /mac|iphone|ipad/i.test(navigator.userAgentData.platform)
    : /Mac|iPhone|iPad/.test(navigator.userAgent))

const mod = isApple ? '⌘' : 'Ctrl'

const SHORTCUTS: Shortcut[] = [
  { group: 'Navegación', keys: [mod, 'K'], description: 'Abrir la paleta de búsqueda' },
  { group: 'Navegación', keys: ['?'], description: 'Mostrar esta ventana de atajos' },
  { group: 'Navegación', keys: ['Esc'], description: 'Cerrar diálogos y menús' },
  { group: 'Navegación', keys: ['Alt', '←'], description: 'Volver a la página anterior' },
  { group: 'Catálogo', keys: ['F'], description: 'Buscar en la página (buscador del navegador)' },
  { group: 'Catálogo', keys: ['↑', '↓'], description: 'Navegar resultados en la paleta' },
  { group: 'Catálogo', keys: ['↵'], description: 'Abrir resultado seleccionado' },
  { group: 'Accesibilidad', keys: ['Tab'], description: 'Mover el foco al siguiente elemento' },
  { group: 'Accesibilidad', keys: ['Shift', 'Tab'], description: 'Mover el foco al elemento anterior' },
  { group: 'Accesibilidad', keys: ['Space'], description: 'Activar botón o casilla enfocados' },
]

export function ShortcutsDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Don't trigger when typing in inputs
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  // Group shortcuts
  const groups = [...new Set(SHORTCUTS.map((s) => s.group))]

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-neutral-950/55 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Atajos de teclado"
        className="surface-glass animate-pop relative w-full max-w-lg overflow-hidden rounded-panel shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-surface px-5 py-4">
          <Keyboard className="text-muted size-4 shrink-0" aria-hidden />
          <h2 className="flex-1 text-sm font-semibold">Atajos de teclado</h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setOpen(false)}
            className="text-muted hover:text-strong transition-colors"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5 space-y-5">
          {groups.map((group) => (
            <section key={group}>
              <h3 className="text-muted mb-2 text-[0.65rem] font-semibold tracking-widest uppercase">
                {group}
              </h3>
              <ul className="space-y-1.5">
                {SHORTCUTS.filter((s) => s.group === group).map((s) => (
                  <li key={s.description} className="flex items-center justify-between gap-4">
                    <span className="text-sm">{s.description}</span>
                    <div className="flex shrink-0 items-center gap-1">
                      {s.keys.map((key) => (
                        <kbd
                          key={key}
                          className={cn(
                            'surface-flat inline-flex items-center justify-center rounded-md',
                            'border border-surface px-1.5 py-0.5 font-mono text-[0.65rem]',
                            'min-w-[1.5rem]',
                          )}
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="text-muted border-t border-surface px-5 py-3 text-[0.65rem]">
          Presiona <kbd className="surface-flat rounded border border-surface px-1 font-mono">?</kbd> para
          abrir y cerrar esta ventana.
        </p>
      </div>
    </div>
  )
}
