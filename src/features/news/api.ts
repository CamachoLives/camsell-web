import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '@/shared/api/client'
import type {
  Article,
  ArticleStatus,
  ArticleSummary,
  Page,
  SaveArticleInput,
} from '@/shared/api/types'

export interface NewsFeedParams {
  text?: string
  categoryCode?: string
  tag?: string
  page?: number
  size?: number
}

export const newsApi = {
  feed: (params: NewsFeedParams) =>
    apiGet<Page<ArticleSummary>>('/api/v1/news', { params: { size: 9, ...params } }),

  featured: (limit = 3) =>
    apiGet<ArticleSummary[]>('/api/v1/news/featured', { params: { limit } }),

  tags: () => apiGet<string[]>('/api/v1/news/tags'),

  bySlug: (slug: string) => apiGet<Article>(`/api/v1/news/${slug}`),

  related: (slug: string, limit = 3) =>
    apiGet<ArticleSummary[]>(`/api/v1/news/${slug}/related`, { params: { limit } }),

  /* Administración editorial */
  adminList: (params: NewsFeedParams) =>
    apiGet<Page<ArticleSummary>>('/api/v1/admin/news', { params: { size: 20, ...params } }),

  create: (input: SaveArticleInput) => apiPost<Article>('/api/v1/admin/news', input),

  update: (id: number, input: SaveArticleInput) =>
    apiPut<Article>(`/api/v1/admin/news/${id}`, input),

  changeStatus: (id: number, status: ArticleStatus) =>
    apiPatch<Article>(`/api/v1/admin/news/${id}/status`, { status }),

  remove: (id: number) => apiDelete(`/api/v1/admin/news/${id}`),
}
