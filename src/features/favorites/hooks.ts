import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuthStore } from '@/features/auth/store'
import { favoritesApi } from '@/features/favorites/api'
import { queryKeys } from '@/shared/api/queryClient'

export function useFavorites() {
  const user = useAuthStore((state) => state.user)

  return useQuery({
    queryKey: queryKeys.favorites,
    queryFn: () => favoritesApi.mine(),
    // Sin sesión no hay favoritos que pedir; evita un 401 innecesario.
    enabled: Boolean(user),
  })
}

export function useToggleFavorite(slug?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (listingId: number) => favoritesApi.toggle(listingId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites })
      if (slug) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.listingBySlug(slug) })
      }
    },
  })
}
