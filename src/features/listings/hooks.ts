import { useQuery } from '@tanstack/react-query'

import { listingsApi } from '@/features/listings/api'
import { queryKeys } from '@/shared/api/queryClient'
import type { ListingSearchParams } from '@/shared/api/types'

export function useListingSearch(params: ListingSearchParams) {
  return useQuery({
    queryKey: queryKeys.listings(params),
    queryFn: () => listingsApi.search(params),
    // Al cambiar de página se conservan los resultados anteriores, para que la
    // lista no colapse a un esqueleto en cada paso.
    placeholderData: (previous) => previous,
  })
}

export function useFeaturedListings(limit = 8) {
  return useQuery({
    queryKey: queryKeys.featuredListings(limit),
    queryFn: () => listingsApi.featured(limit),
    staleTime: 5 * 60_000,
  })
}

export function useListing(slug: string) {
  return useQuery({
    queryKey: queryKeys.listingBySlug(slug),
    queryFn: () => listingsApi.bySlug(slug),
    enabled: Boolean(slug),
  })
}

export function useCatalogStats() {
  return useQuery({
    queryKey: queryKeys.catalogStats,
    queryFn: () => listingsApi.stats(),
    staleTime: 5 * 60_000,
  })
}
