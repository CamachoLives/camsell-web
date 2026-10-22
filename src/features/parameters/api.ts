import { apiGet } from '@/shared/api/client'
import type { Brand, ParameterGroup, ParameterOption, VehicleModel } from '@/shared/api/types'

export const parametersApi = {
  groups: (includeInactive = false) =>
    apiGet<ParameterGroup[]>('/api/v1/parameters/groups', { params: { includeInactive } }),

  group: (code: string) => apiGet<ParameterGroup>(`/api/v1/parameters/groups/${code}`),

  options: (code: string, includeInactive = false) =>
    apiGet<ParameterOption[]>(`/api/v1/parameters/groups/${code}/options`, {
      params: { includeInactive },
    }),

  brands: (withModels = true) => apiGet<Brand[]>('/api/v1/brands', { params: { withModels } }),

  models: (brandId: number) => apiGet<VehicleModel[]>(`/api/v1/brands/${brandId}/models`),
}
