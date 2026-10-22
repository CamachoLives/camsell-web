import { apiGet, apiPost } from '@/shared/api/client'
import type { Offer, Page } from '@/shared/api/types'

export interface SubmitOfferInput {
  amount: number
  currency?: string
  message?: string
  contactPhone?: string
}

export const offersApi = {
  submit: (listingId: number, input: SubmitOfferInput) =>
    apiPost<Offer>(`/api/v1/listings/${listingId}/offers`, input),

  byListing: (listingId: number) => apiGet<Offer[]>(`/api/v1/listings/${listingId}/offers`),

  sent: (page = 0, size = 10) =>
    apiGet<Page<Offer>>('/api/v1/offers/sent', { params: { page, size } }),

  received: (page = 0, size = 10) =>
    apiGet<Page<Offer>>('/api/v1/offers/received', { params: { page, size } }),

  pendingCount: () => apiGet<number>('/api/v1/offers/pending-count'),

  accept: (offerId: number) => apiPost<Offer>(`/api/v1/offers/${offerId}/accept`),
  reject: (offerId: number) => apiPost<Offer>(`/api/v1/offers/${offerId}/reject`),
  withdraw: (offerId: number) => apiPost<Offer>(`/api/v1/offers/${offerId}/withdraw`),
}
