import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { newsApi, type NewsFeedParams } from '@/features/news/api'
import { queryKeys } from '@/shared/api/queryClient'
import type { ArticleStatus, SaveArticleInput } from '@/shared/api/types'

export function useNewsFeed(params: NewsFeedParams) {
  return useQuery({
    queryKey: queryKeys.news(params),
    queryFn: () => newsApi.feed(params),
    placeholderData: (previous) => previous,
  })
}

export function useFeaturedNews(limit = 3) {
  return useQuery({
    queryKey: queryKeys.featuredNews(limit),
    queryFn: () => newsApi.featured(limit),
    staleTime: 5 * 60_000,
  })
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: queryKeys.newsBySlug(slug),
    queryFn: () => newsApi.bySlug(slug),
    enabled: Boolean(slug),
  })
}

export function useRelatedNews(slug: string) {
  return useQuery({
    queryKey: queryKeys.relatedNews(slug),
    queryFn: () => newsApi.related(slug),
    enabled: Boolean(slug),
  })
}

export function useNewsTags() {
  return useQuery({
    queryKey: queryKeys.newsTags,
    queryFn: () => newsApi.tags(),
    staleTime: 10 * 60_000,
  })
}

export function useAdminNews(params: NewsFeedParams) {
  return useQuery({
    queryKey: queryKeys.adminNews(params),
    queryFn: () => newsApi.adminList(params),
    placeholderData: (previous) => previous,
  })
}

/** Toda escritura editorial invalida el feed publico y la lista de administracion. */
export function useArticleMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['news'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'news'] })
  }

  return {
    create: useMutation({
      mutationFn: (input: SaveArticleInput) => newsApi.create(input),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: number; input: SaveArticleInput }) =>
        newsApi.update(id, input),
      onSuccess: invalidate,
    }),
    changeStatus: useMutation({
      mutationFn: ({ id, status }: { id: number; status: ArticleStatus }) =>
        newsApi.changeStatus(id, status),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: number) => newsApi.remove(id),
      onSuccess: invalidate,
    }),
  }
}
