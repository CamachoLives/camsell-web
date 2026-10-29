import { useCallback, useEffect, useState } from 'react'

import type { ListingSummary } from '@/shared/api/types'

const KEY = 'camsell.recentlyViewed'
const MAX = 6

function read(): ListingSummary[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ListingSummary[]) : []
  } catch {
    return []
  }
}

function write(items: ListingSummary[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    // storage quota exceeded — silently ignore
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<ListingSummary[]>(read)

  // Sync across tabs
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === KEY) setItems(read())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const track = useCallback((listing: ListingSummary) => {
    setItems((prev) => {
      const next = [listing, ...prev.filter((l) => l.id !== listing.id)].slice(0, MAX)
      write(next)
      return next
    })
  }, [])

  const clear = useCallback(() => {
    localStorage.removeItem(KEY)
    setItems([])
  }, [])

  return { items, track, clear }
}
