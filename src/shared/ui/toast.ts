import { create } from 'zustand'

export type ToastTone = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  tone: ToastTone
  message: string
}

interface ToastState {
  toasts: Toast[]
  push: (tone: ToastTone, message: string) => void
  dismiss: (id: number) => void
}

let nextId = 1

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (tone, message) => {
    const id = nextId++
    set((state) => ({ toasts: [...state.toasts, { id, tone, message }] }))
    // Los avisos se retiran solos; el de error también, pero se puede cerrar antes.
    window.setTimeout(
      () => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
      tone === 'error' ? 8000 : 4500,
    )
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))

/** Avisos efímeros del resultado de una acción. */
export function useToast() {
  const push = useToastStore((state) => state.push)
  return {
    success: (message: string) => push('success', message),
    error: (message: string) => push('error', message),
    info: (message: string) => push('info', message),
  }
}
