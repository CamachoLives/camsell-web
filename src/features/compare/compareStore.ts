import { create } from 'zustand'

import type { ListingSummary } from '@/shared/api/types'

const MAX_COMPARE = 3

interface CompareState {
  items: ListingSummary[]
  add: (listing: ListingSummary) => void
  remove: (id: number) => void
  clear: () => void
  has: (id: number) => boolean
}

export const useCompareStore = create<CompareState>((set, get) => ({
  items: [],
  add: (listing) => {
    if (get().items.length >= MAX_COMPARE) return
    if (get().has(listing.id)) return
    set((state) => ({ items: [...state.items, listing] }))
  },
  remove: (id) => set((state) => ({ items: state.items.filter((l) => l.id !== id) })),
  clear: () => set({ items: [] }),
  has: (id) => get().items.some((l) => l.id === id),
}))
