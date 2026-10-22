import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '@/shared/api/client'
import type {
  CatalogStats,
  ListingDetail,
  ListingSearchParams,
  ListingStatus,
  ListingSummary,
  Page,
  SaveListingInput,
} from '@/shared/api/types'

/** Quita del objeto lo que no aporta a la URL, para no enviar params vacíos. */
function clean(params: ListingSearchParams): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue
    }
    if (Array.isArray(value) && value.length === 0) {
      continue
    }
    result[key] = value
  }
  return result
}

export const listingsApi = {
  search: (params: ListingSearchParams) =>
    apiGet<Page<ListingSummary>>('/api/v1/listings', { params: clean(params) }),

  featured: (limit = 8) =>
    apiGet<ListingSummary[]>('/api/v1/listings/featured', { params: { limit } }),

  bySlug: (slug: string) => apiGet<ListingDetail>(`/api/v1/listings/${slug}`),

  mine: (params: ListingSearchParams) =>
    apiGet<Page<ListingSummary>>('/api/v1/listings/mine', { params: clean(params) }),

  create: (input: SaveListingInput) => apiPost<ListingDetail>('/api/v1/listings', input),

  update: (id: number, input: SaveListingInput) =>
    apiPut<ListingDetail>(`/api/v1/listings/${id}`, input),

  changeStatus: (id: number, status: ListingStatus) =>
    apiPatch<ListingDetail>(`/api/v1/listings/${id}/status`, { status }),

  setFeatured: (id: number, featured: boolean) =>
    apiPut<ListingDetail>(`/api/v1/listings/${id}/featured`, null, { params: { featured } }),

  remove: (id: number) => apiDelete(`/api/v1/listings/${id}`),

  stats: () => apiGet<CatalogStats>('/api/v1/stats/catalog'),
}
