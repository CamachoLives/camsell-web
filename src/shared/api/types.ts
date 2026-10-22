/**
 * Contrato del backend. Los tipos reflejan los DTOs de camsell-api y son la
 * unica fuente de verdad que usan las capas de datos y de interfaz.
 */

export type UserRole = 'USER' | 'DEALER' | 'ADMIN'

export interface User {
  id: number
  email: string
  fullName: string
  phone?: string | null
  cityCode?: string | null
  avatarUrl?: string | null
  role: UserRole
  active: boolean
  createdAt?: string | null
}

export interface Session {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface Page<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

/* ── Parametros ─────────────────────────────────────────────────────────── */

export type ParameterDataType = 'OPTION' | 'TEXT' | 'NUMBER' | 'BOOLEAN'
export type ParameterScope = 'LISTING' | 'NEWS' | 'GENERAL'

export interface ParameterOption {
  id: number
  code: string
  label: string
  iconName?: string | null
  colorHex?: string | null
  sortOrder: number
  active: boolean
}

/**
 * Describe un campo configurable del sistema. El frontend lee estos grupos y
 * genera con ellos los filtros de busqueda y los campos del formulario de
 * publicacion, por lo que un grupo nuevo aparece en la interfaz sin cambios en
 * este repositorio.
 */
export interface ParameterGroup {
  id: number
  code: string
  name: string
  description?: string | null
  dataType: ParameterDataType
  scope: ParameterScope
  multiValued: boolean
  filterable: boolean
  requiredForListing: boolean
  showInSpecs: boolean
  sortOrder: number
  active: boolean
  options: ParameterOption[]
}

/* ── Marcas y modelos ───────────────────────────────────────────────────── */

export interface VehicleModel {
  id: number
  brandId: number
  brandName: string
  name: string
  slug: string
  bodyTypeCode?: string | null
  active: boolean
}

export interface Brand {
  id: number
  name: string
  slug: string
  countryOfOrigin?: string | null
  logoUrl?: string | null
  active: boolean
  modelCount: number
  models: VehicleModel[]
}

/* ── Catalogo ───────────────────────────────────────────────────────────── */

export type ListingStatus = 'DRAFT' | 'PUBLISHED' | 'RESERVED' | 'SOLD' | 'ARCHIVED'

export interface ListingSummary {
  id: number
  reference: string
  slug: string
  title: string
  brandId: number
  brandName: string
  modelId: number
  modelName: string
  year: number
  mileageKm: number
  price: number
  currency: string
  negotiable: boolean
  cityCode?: string | null
  status: ListingStatus
  featured: boolean
  viewCount: number
  coverImageUrl?: string | null
  sellerName: string
  publishedAt?: string | null
}

export interface ListingImage {
  id: number
  url: string
  alt?: string | null
  position: number
}

export interface ListingAttribute {
  groupCode: string
  optionCode?: string | null
  textValue?: string | null
  numberValue?: number | null
  boolValue?: boolean | null
  displayValue: string
}

export interface ListingDetail extends ListingSummary {
  sellerId: number
  description: string
  favorite: boolean
  favoriteCount: number
  createdAt?: string | null
  images: ListingImage[]
  attributes: ListingAttribute[]
}

export interface CatalogStats {
  publishedListings: number
  soldListings: number
  reservedListings: number
  brandsWithListings: number
}

/** Valor de un parametro enviado al publicar o editar un vehiculo. */
export interface AttributeInput {
  groupCode: string
  optionCode?: string | null
  textValue?: string | null
  numberValue?: number | null
  boolValue?: boolean | null
}

export interface SaveListingInput {
  brandId?: number | null
  modelId: number
  title?: string | null
  year: number
  mileageKm: number
  price: number
  currency?: string
  negotiable: boolean
  description: string
  cityCode?: string | null
  publishNow: boolean
  images: { url: string; alt?: string | null; position?: number | null }[]
  attributes: AttributeInput[]
}

export interface ListingSearchParams {
  text?: string
  brandIds?: number[]
  modelIds?: number[]
  minYear?: number
  maxYear?: number
  minPrice?: number
  maxPrice?: number
  maxMileage?: number
  cityCode?: string
  negotiable?: boolean
  featured?: boolean
  /** Filtros por parametros, en formato `GRUPO:OPCION`. */
  attr?: string[]
  page?: number
  size?: number
  sort?: string
  direction?: 'asc' | 'desc'
}

/* ── Compra ─────────────────────────────────────────────────────────────── */

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'

export interface Offer {
  id: number
  listingId: number
  listingReference: string
  listingTitle: string
  sellerId: number
  buyerId: number
  buyerName: string
  buyerPhone?: string | null
  amount: number
  currency: string
  message?: string | null
  status: OfferStatus
  createdAt?: string | null
  respondedAt?: string | null
}

/* ── Noticias ───────────────────────────────────────────────────────────── */

export type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface ArticleSummary {
  id: number
  slug: string
  title: string
  excerpt?: string | null
  coverImageUrl?: string | null
  categoryCode?: string | null
  tags: string[]
  authorName: string
  status: ArticleStatus
  featured: boolean
  readingMinutes: number
  viewCount: number
  publishedAt?: string | null
}

export interface Article extends ArticleSummary {
  body: string
  authorId: number
  createdAt?: string | null
}

export interface SaveArticleInput {
  title: string
  excerpt?: string | null
  body: string
  coverImageUrl?: string | null
  categoryCode?: string | null
  tags: string[]
  featured: boolean
  publishNow: boolean
}
