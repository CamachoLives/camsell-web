import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { parametersApi } from '@/features/parameters/api'
import { queryKeys } from '@/shared/api/queryClient'
import type { ParameterGroup } from '@/shared/api/types'

/**
 * Esquema de parametros del sistema. Es la base de los filtros de busqueda, de
 * los campos del formulario de publicacion y de la ficha tecnica, por lo que se
 * cachea con vida larga: cambia solo cuando un administrador lo edita.
 */
export function useParameterGroups(includeInactive = false) {
  return useQuery({
    queryKey: queryKeys.parameterGroups(includeInactive),
    queryFn: () => parametersApi.groups(includeInactive),
    staleTime: 10 * 60_000,
  })
}

export function useBrands(withModels = true) {
  return useQuery({
    queryKey: queryKeys.brands(withModels),
    queryFn: () => parametersApi.brands(withModels),
    staleTime: 10 * 60_000,
  })
}

/** Grupos que aplican al catalogo de vehiculos, en orden de presentacion. */
export function useListingGroups() {
  const query = useParameterGroups()
  const groups = useMemo(
    () => (query.data ?? []).filter((group) => group.scope !== 'NEWS'),
    [query.data],
  )
  return { ...query, groups }
}

/** Grupos que el catalogo expone como filtros. */
export function useFilterableGroups() {
  const { groups, ...rest } = useListingGroups()
  const filterable = useMemo(() => groups.filter((group) => group.filterable), [groups])
  return { ...rest, groups: filterable }
}

/** Grupos que el formulario de publicacion debe pedir. */
export function usePublishableGroups() {
  const { groups, ...rest } = useListingGroups()
  return { ...rest, groups }
}

export interface ParameterDictionary {
  /** Etiqueta legible de un grupo por su codigo. */
  groupLabel: (groupCode: string) => string
  /** Etiqueta legible de un valor dentro de su grupo. */
  valueLabel: (groupCode: string, value?: string | null) => string
  /** Color asociado a una opcion, cuando el administrador lo definio. */
  valueColor: (groupCode: string, value?: string | null) => string | null
  byCode: Map<string, ParameterGroup>
}

/**
 * Traduce codigos a etiquetas. El backend devuelve codigos estables y el
 * diccionario los convierte en texto para la persona, sin que cada componente
 * tenga que recorrer el esquema.
 */
export function useParameterDictionary(): ParameterDictionary {
  const { data } = useParameterGroups()

  return useMemo(() => {
    const byCode = new Map<string, ParameterGroup>()
    const labels = new Map<string, string>()
    const colors = new Map<string, string>()

    for (const group of data ?? []) {
      byCode.set(group.code, group)
      for (const option of group.options) {
        labels.set(`${group.code}:${option.code}`, option.label)
        if (option.colorHex) {
          colors.set(`${group.code}:${option.code}`, option.colorHex)
        }
      }
    }

    return {
      byCode,
      groupLabel: (groupCode) => byCode.get(groupCode)?.name ?? humanize(groupCode),
      valueLabel: (groupCode, value) => {
        if (value === null || value === undefined || value === '') {
          return '—'
        }
        if (value === 'true') {
          return 'Sí'
        }
        if (value === 'false') {
          return 'No'
        }
        return labels.get(`${groupCode}:${value}`) ?? value
      },
      valueColor: (groupCode, value) =>
        value ? (colors.get(`${groupCode}:${value}`) ?? null) : null,
    }
  }, [data])
}

/** Último recurso cuando el código no está en el esquema cargado. */
function humanize(code: string): string {
  const lower = code.replace(/_/g, ' ').toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}
