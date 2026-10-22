import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import type { ListingSearchParams } from '@/shared/api/types'

const NUMBER_KEYS = ['minYear', 'maxYear', 'minPrice', 'maxPrice', 'maxMileage'] as const
type NumberKey = (typeof NUMBER_KEYS)[number]

export interface ListingFilters {
  /** Criterios listos para enviar a la API. */
  params: ListingSearchParams
  /** Mapa `GRUPO -> valores` de los filtros por parametros activos. */
  attrByGroup: Map<string, string[]>
  activeCount: number
  setText: (value: string) => void
  setNumber: (key: NumberKey, value: number | undefined) => void
  setCity: (value: string | undefined) => void
  setBrand: (brandId: number | undefined) => void
  setModel: (modelId: number | undefined) => void
  setNegotiable: (value: boolean) => void
  setSort: (value: string) => void
  setPage: (page: number) => void
  /** Agrega o quita un valor de un grupo de parametros. */
  toggleAttr: (groupCode: string, value: string) => void
  /** Reemplaza el valor unico de un grupo (usado por numeros y texto). */
  setAttrValue: (groupCode: string, value: string | undefined) => void
  clearGroup: (groupCode: string) => void
  reset: () => void
}

/**
 * La URL es la fuente de verdad de los filtros: cualquier busqueda se puede
 * compartir, guardar en marcadores y recuperar con el boton atras del
 * navegador.
 */
export function useListingFilters(): ListingFilters {
  const [searchParams, setSearchParams] = useSearchParams()

  const attrByGroup = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const entry of searchParams.getAll('attr')) {
      const separator = entry.indexOf(':')
      if (separator <= 0) {
        continue
      }
      const group = entry.slice(0, separator)
      const value = entry.slice(separator + 1)
      if (!value) {
        continue
      }
      map.set(group, [...(map.get(group) ?? []), value])
    }
    return map
  }, [searchParams])

  const params = useMemo<ListingSearchParams>(() => {
    const sort = searchParams.get('sort') ?? undefined
    const result: ListingSearchParams = {
      text: searchParams.get('text') ?? undefined,
      cityCode: searchParams.get('cityCode') ?? undefined,
      attr: searchParams.getAll('attr'),
      page: numberOrUndefined(searchParams.get('page')) ?? 0,
      size: 12,
      sort,
      direction: sortDirection(sort),
    }

    for (const key of NUMBER_KEYS) {
      const value = numberOrUndefined(searchParams.get(key))
      if (value !== undefined) {
        result[key] = value
      }
    }

    const brandId = numberOrUndefined(searchParams.get('brandId'))
    if (brandId !== undefined) {
      result.brandIds = [brandId]
    }
    const modelId = numberOrUndefined(searchParams.get('modelId'))
    if (modelId !== undefined) {
      result.modelIds = [modelId]
    }
    if (searchParams.get('negotiable') === 'true') {
      result.negotiable = true
    }
    return result
  }, [searchParams])

  const activeCount = useMemo(() => {
    let count = attrByGroup.size
    for (const key of [...NUMBER_KEYS, 'cityCode', 'brandId', 'modelId', 'negotiable']) {
      if (searchParams.get(key)) {
        count += 1
      }
    }
    return count
  }, [attrByGroup, searchParams])

  /** Toda escritura vuelve a la primera página: el resultado cambió. */
  const update = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(searchParams)
      mutate(next)
      next.delete('page')
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const setParam = useCallback(
    (key: string, value: string | undefined) => {
      update((next) => {
        if (value === undefined || value === '') {
          next.delete(key)
        } else {
          next.set(key, value)
        }
      })
    },
    [update],
  )

  return {
    params,
    attrByGroup,
    activeCount,

    setText: (value) => setParam('text', value.trim() || undefined),
    setNumber: (key, value) => setParam(key, value === undefined ? undefined : String(value)),
    setCity: (value) => setParam('cityCode', value),
    setBrand: (brandId) =>
      update((next) => {
        if (brandId === undefined) {
          next.delete('brandId')
        } else {
          next.set('brandId', String(brandId))
        }
        // Cambiar de marca invalida el modelo elegido.
        next.delete('modelId')
      }),
    setModel: (modelId) => setParam('modelId', modelId === undefined ? undefined : String(modelId)),
    setNegotiable: (value) => setParam('negotiable', value ? 'true' : undefined),
    setSort: (value) => setParam('sort', value || undefined),

    setPage: (page) => {
      const next = new URLSearchParams(searchParams)
      if (page <= 0) {
        next.delete('page')
      } else {
        next.set('page', String(page))
      }
      setSearchParams(next, { replace: false })
    },

    toggleAttr: (groupCode, value) =>
      update((next) => {
        const entry = `${groupCode}:${value}`
        const current = next.getAll('attr')
        next.delete('attr')
        const exists = current.includes(entry)
        for (const item of current) {
          if (item !== entry) {
            next.append('attr', item)
          }
        }
        if (!exists) {
          next.append('attr', entry)
        }
      }),

    setAttrValue: (groupCode, value) =>
      update((next) => {
        const current = next.getAll('attr').filter((item) => !item.startsWith(`${groupCode}:`))
        next.delete('attr')
        for (const item of current) {
          next.append('attr', item)
        }
        if (value) {
          next.append('attr', `${groupCode}:${value}`)
        }
      }),

    clearGroup: (groupCode) =>
      update((next) => {
        const current = next.getAll('attr').filter((item) => !item.startsWith(`${groupCode}:`))
        next.delete('attr')
        for (const item of current) {
          next.append('attr', item)
        }
      }),

    reset: () => {
      const next = new URLSearchParams()
      const text = searchParams.get('text')
      // Limpiar filtros no debe borrar lo que la persona escribió al buscar.
      if (text) {
        next.set('text', text)
      }
      setSearchParams(next, { replace: true })
    },
  }
}

function numberOrUndefined(raw: string | null): number | undefined {
  if (raw === null || raw.trim() === '') {
    return undefined
  }
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : undefined
}

/** El precio y el kilometraje se leen mejor de menor a mayor. */
function sortDirection(sort?: string): 'asc' | 'desc' {
  return sort === 'priceAmount' || sort === 'mileageKm' ? 'asc' : 'desc'
}
