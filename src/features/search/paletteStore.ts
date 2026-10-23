import { create } from 'zustand'

interface PaletteState {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

/**
 * Estado de apertura de la paleta de comandos.
 *
 * <p>Vive en un store y no en el shell porque la abren tres cosas distintas: el
 * atajo de teclado, el botón de la barra y los estados vacíos que invitan a
 * buscar. Pasar el control por props obligaría a atravesar media aplicación.
 */
export const usePaletteStore = create<PaletteState>((set, get) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set({ open: !get().open }),
}))
