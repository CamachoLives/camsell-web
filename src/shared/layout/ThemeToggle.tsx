import { Moon, Sun } from 'lucide-react'

import { useThemeStore } from '@/shared/lib/theme'

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme)
  const toggle = useThemeStore((state) => state.toggle)

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      className="text-muted hover:bg-surface-sunken hover:text-strong grid size-9 place-items-center rounded-xl transition-colors"
    >
      {theme === 'dark' ? (
        <Sun className="size-[1.1rem]" aria-hidden />
      ) : (
        <Moon className="size-[1.1rem]" aria-hidden />
      )}
    </button>
  )
}
