import { lazy } from 'react'

/**
 * Módulos de página, declarados como importaciones diferidas.
 *
 * <p>Se exportan las funciones de importación además de los componentes porque
 * la misma función sirve para dos cosas: construir el componente diferido y
 * precargar el fragmento cuando alguien se posa sobre el enlace. Así el código
 * de la vista ya está descargado cuando llega el clic, y la navegación no
 * muestra un estado de carga.
 */
export const pageLoaders = {
  home: () => import('@/pages/HomePage'),
  listings: () => import('@/pages/ListingsPage'),
  listingDetail: () => import('@/pages/ListingDetailPage'),
  news: () => import('@/pages/NewsPage'),
  article: () => import('@/pages/ArticlePage'),
  login: () => import('@/pages/LoginPage'),
  register: () => import('@/pages/RegisterPage'),
  publish: () => import('@/pages/PublishListingPage'),
  account: () => import('@/pages/AccountPage'),
  admin: () => import('@/pages/AdminPage'),
  notFound: () => import('@/pages/NotFoundPage'),
  compare: () => import('@/pages/ComparePage'),
} as const

export type PageKey = keyof typeof pageLoaders

/** Función de carga de un fragmento, para precargarlo bajo demanda. */
export type PageLoader = () => Promise<unknown>

const preloaded = new Set<PageKey>();

/** Descarga el fragmento de una vista una sola vez. */
export function preloadPage(key: PageKey): void {
  if (preloaded.has(key)) {
    return
  }
  preloaded.add(key)
  // Un fallo de precarga no es un error de la aplicación: el import normal
  // volverá a intentarlo cuando haga falta.
  void pageLoaders[key]().catch(() => preloaded.delete(key))
}

export const HomePage = lazy(() => pageLoaders.home().then((m) => ({ default: m.HomePage })))
export const ListingsPage = lazy(() =>
  pageLoaders.listings().then((m) => ({ default: m.ListingsPage })),
)
export const ListingDetailPage = lazy(() =>
  pageLoaders.listingDetail().then((m) => ({ default: m.ListingDetailPage })),
)
export const NewsPage = lazy(() => pageLoaders.news().then((m) => ({ default: m.NewsPage })))
export const ArticlePage = lazy(() =>
  pageLoaders.article().then((m) => ({ default: m.ArticlePage })),
)
export const LoginPage = lazy(() => pageLoaders.login().then((m) => ({ default: m.LoginPage })))
export const RegisterPage = lazy(() =>
  pageLoaders.register().then((m) => ({ default: m.RegisterPage })),
)
export const PublishListingPage = lazy(() =>
  pageLoaders.publish().then((m) => ({ default: m.PublishListingPage })),
)
export const AccountPage = lazy(() =>
  pageLoaders.account().then((m) => ({ default: m.AccountPage })),
)
export const AdminPage = lazy(() => pageLoaders.admin().then((m) => ({ default: m.AdminPage })))
export const NotFoundPage = lazy(() =>
  pageLoaders.notFound().then((m) => ({ default: m.NotFoundPage })),
)
export const ComparePage = lazy(() =>
  pageLoaders.compare().then((m) => ({ default: m.ComparePage })),
)
