import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  adminApi,
  type BrandPayload,
  type GroupPayload,
  type ModelPayload,
  type OptionPayload,
} from '@/features/admin/api'
import { queryKeys } from '@/shared/api/queryClient'

export function useAdminGroups() {
  return useQuery({
    queryKey: ['admin', 'parameters', 'groups'],
    queryFn: () => adminApi.groups(),
  })
}

export function useAdminBrands() {
  return useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: () => adminApi.brands(),
  })
}

/**
 * Editar el esquema cambia lo que ve todo el sitio (filtros, formularios y
 * fichas tecnicas), por eso cada escritura invalida tambien las consultas
 * publicas de parametros y marcas.
 */
export function useParameterMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'parameters'] })
    void queryClient.invalidateQueries({ queryKey: queryKeys.parameters })
  }

  return {
    createGroup: useMutation({
      mutationFn: (payload: GroupPayload) => adminApi.createGroup(payload),
      onSuccess: invalidate,
    }),
    updateGroup: useMutation({
      mutationFn: ({ code, payload }: { code: string; payload: GroupPayload }) =>
        adminApi.updateGroup(code, payload),
      onSuccess: invalidate,
    }),
    deleteGroup: useMutation({
      mutationFn: (code: string) => adminApi.deleteGroup(code),
      onSuccess: invalidate,
    }),
    createOption: useMutation({
      mutationFn: ({ code, payload }: { code: string; payload: OptionPayload }) =>
        adminApi.createOption(code, payload),
      onSuccess: invalidate,
    }),
    updateOption: useMutation({
      mutationFn: ({
        code,
        optionId,
        payload,
      }: {
        code: string
        optionId: number
        payload: OptionPayload
      }) => adminApi.updateOption(code, optionId, payload),
      onSuccess: invalidate,
    }),
    deleteOption: useMutation({
      mutationFn: ({ code, optionId }: { code: string; optionId: number }) =>
        adminApi.deleteOption(code, optionId),
      onSuccess: invalidate,
    }),
  }
}

export function useBrandMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] })
    void queryClient.invalidateQueries({ queryKey: ['brands'] })
  }

  return {
    createBrand: useMutation({
      mutationFn: (payload: BrandPayload) => adminApi.createBrand(payload),
      onSuccess: invalidate,
    }),
    updateBrand: useMutation({
      mutationFn: ({ id, payload }: { id: number; payload: BrandPayload }) =>
        adminApi.updateBrand(id, payload),
      onSuccess: invalidate,
    }),
    deleteBrand: useMutation({
      mutationFn: (id: number) => adminApi.deleteBrand(id),
      onSuccess: invalidate,
    }),
    createModel: useMutation({
      mutationFn: ({ brandId, payload }: { brandId: number; payload: ModelPayload }) =>
        adminApi.createModel(brandId, payload),
      onSuccess: invalidate,
    }),
    deleteModel: useMutation({
      mutationFn: (modelId: number) => adminApi.deleteModel(modelId),
      onSuccess: invalidate,
    }),
  }
}
