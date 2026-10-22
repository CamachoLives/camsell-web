import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { offersApi, type SubmitOfferInput } from '@/features/offers/api'
import { queryKeys } from '@/shared/api/queryClient'

export function useOffersSent(page = 0) {
  return useQuery({
    queryKey: queryKeys.offersSent(page),
    queryFn: () => offersApi.sent(page),
  })
}

export function useOffersReceived(page = 0) {
  return useQuery({
    queryKey: queryKeys.offersReceived(page),
    queryFn: () => offersApi.received(page),
  })
}

export function useListingOffers(listingId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.listingOffers(listingId),
    queryFn: () => offersApi.byListing(listingId),
    enabled: enabled && listingId > 0,
  })
}

export function useSubmitOffer(listingId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: SubmitOfferInput) => offersApi.submit(listingId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['offers'] })
    },
  })
}

type OfferAction = 'accept' | 'reject' | 'withdraw'

/**
 * Responder una oferta cambia el estado del vehiculo (aceptar lo reserva), por
 * eso se invalida tambien el catalogo y las publicaciones propias.
 */
export function useOfferAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ offerId, action }: { offerId: number; action: OfferAction }) =>
      offersApi[action](offerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['offers'] })
      void queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
  })
}
