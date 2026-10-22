import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { listingsApi } from '@/features/listings/api'
import { queryKeys } from '@/shared/api/queryClient'
import type { ListingSearchParams, ListingStatus } from '@/shared/api/types'

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

export function useMyListings(page = 0) {
  const params = { page, size: 12, sort: 'createdAt' as const }
  return useQuery({
    queryKey: queryKeys.myListings(params),
    queryFn: () => listingsApi.mine(params),
    placeholderData: (previous) => previous,
  })
}

/** Cambiar el estado afecta tanto el panel propio como el catalogo publico. */
export function useChangeListingStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: ListingStatus }) =>
      listingsApi.changeStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['listings'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.catalogStats })
    },
  })
}

export function useDeleteListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => listingsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['listings'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.catalogStats })
    },
  })
}

export function useSetFeatured() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, featured }: { id: number; featured: boolean }) =>
      listingsApi.setFeatured(id, featured),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
  })
}
