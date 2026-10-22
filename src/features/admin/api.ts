import { apiDelete, apiGet, apiPost, apiPut } from '@/shared/api/client'
import type {
  Brand,
  ParameterDataType,
  ParameterGroup,
  ParameterOption,
  ParameterScope,
  VehicleModel,
} from '@/shared/api/types'

export interface GroupPayload {
  code: string
  name: string
  description?: string | null
  dataType: ParameterDataType
  scope: ParameterScope
  multiValued: boolean
  filterable: boolean
  requiredForListing: boolean
  showInSpecs: boolean
  sortOrder?: number | null
  active?: boolean
}

export interface OptionPayload {
  code: string
  label: string
  iconName?: string | null
  colorHex?: string | null
  sortOrder?: number | null
  active?: boolean
}

export interface BrandPayload {
  name: string
  countryOfOrigin?: string | null
  logoUrl?: string | null
  active?: boolean
}

export interface ModelPayload {
  name: string
  bodyTypeCode?: string | null
  active?: boolean
}

export const adminApi = {
  /* Parámetros */
  groups: () => apiGet<ParameterGroup[]>('/api/v1/admin/parameters/groups'),

  createGroup: (payload: GroupPayload) =>
    apiPost<ParameterGroup>('/api/v1/admin/parameters/groups', payload),

  updateGroup: (code: string, payload: GroupPayload) =>
    apiPut<ParameterGroup>(`/api/v1/admin/parameters/groups/${code}`, payload),

  deleteGroup: (code: string) => apiDelete(`/api/v1/admin/parameters/groups/${code}`),

  createOption: (code: string, payload: OptionPayload) =>
    apiPost<ParameterOption>(`/api/v1/admin/parameters/groups/${code}/options`, payload),

  updateOption: (code: string, optionId: number, payload: OptionPayload) =>
    apiPut<ParameterOption>(
      `/api/v1/admin/parameters/groups/${code}/options/${optionId}`,
      payload,
    ),

  deleteOption: (code: string, optionId: number) =>
    apiDelete(`/api/v1/admin/parameters/groups/${code}/options/${optionId}`),

  /* Marcas y modelos */
  brands: () => apiGet<Brand[]>('/api/v1/admin/brands'),

  createBrand: (payload: BrandPayload) => apiPost<Brand>('/api/v1/admin/brands', payload),

  updateBrand: (id: number, payload: BrandPayload) =>
    apiPut<Brand>(`/api/v1/admin/brands/${id}`, payload),

  deleteBrand: (id: number) => apiDelete(`/api/v1/admin/brands/${id}`),

  createModel: (brandId: number, payload: ModelPayload) =>
    apiPost<VehicleModel>(`/api/v1/admin/brands/${brandId}/models`, payload),

  deleteModel: (modelId: number) => apiDelete(`/api/v1/admin/brands/models/${modelId}`),
}
