import { QueryClient } from '@tanstack/react-query'

import { ApiError } from '@/shared/api/client'

/**
 * Configuracion global de cache. No se reintenta lo que ya sabemos que va a
 * fallar igual (404, 401, 403 y errores de validacion), para no castigar al
 * backend ni hacer esperar a la persona sin motivo.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof ApiError) {
          if (error.status >= 400 && error.status < 500) {
            return false
          }
        }
        return failureCount < 2
      },
    },
    mutations: {
      retry: false,
    },
  },
})

/** Claves de cache centralizadas, para invalidar sin adivinar strings. */
export const queryKeys = {
  parameters: ['parameters'] as const,
  parameterGroups: (includeInactive = false) => ['parameters', 'groups', includeInactive] as const,
  brands: (withModels = true) => ['brands', withModels] as const,
  listings: (params: unknown) => ['listings', params] as const,
  listingBySlug: (slug: string) => ['listings', 'slug', slug] as const,
  featuredListings: (limit: number) => ['listings', 'featured', limit] as const,
  myListings: (params: unknown) => ['listings', 'mine', params] as const,
  catalogStats: ['stats', 'catalog'] as const,
  news: (params: unknown) => ['news', params] as const,
  newsBySlug: (slug: string) => ['news', 'slug', slug] as const,
  featuredNews: (limit: number) => ['news', 'featured', limit] as const,
  relatedNews: (slug: string) => ['news', 'related', slug] as const,
  newsTags: ['news', 'tags'] as const,
  adminNews: (params: unknown) => ['admin', 'news', params] as const,
  session: ['session'] as const,
  favorites: ['favorites'] as const,
  offersSent: (page: number) => ['offers', 'sent', page] as const,
  offersReceived: (page: number) => ['offers', 'received', page] as const,
  listingOffers: (listingId: number) => ['offers', 'listing', listingId] as const,
}
