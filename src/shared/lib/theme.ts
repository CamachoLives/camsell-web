import { create } from 'zustand'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'camsell.theme'

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
      return stored
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    // Ventana privada o almacenamiento bloqueado: el tema claro es el default.
    return 'light'
  }
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Si no se puede persistir, el tema sigue aplicado en esta sesión.
  }
}

interface ThemeState {
  theme: Theme
  toggle: () => void
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: readStoredTheme(),
  toggle: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    set({ theme: next })
  },
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
}))

// Si el usuario no tiene preferencia guardada, el tema sigue al sistema en tiempo real.
try {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (event) => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        useThemeStore.getState().setTheme(event.matches ? 'dark' : 'light')
      }
    } catch {
      useThemeStore.getState().setTheme(event.matches ? 'dark' : 'light')
    }
  })
} catch {
  // matchMedia no disponible (entorno sin window).
}
