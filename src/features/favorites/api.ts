import { apiGet, apiPost } from '@/shared/api/client'
import type { ListingSummary } from '@/shared/api/types'

export const favoritesApi = {
  mine: () => apiGet<ListingSummary[]>('/api/v1/favorites'),
  toggle: (listingId: number) =>
    apiPost<{ favorite: boolean }>(`/api/v1/favorites/${listingId}/toggle`),
}
