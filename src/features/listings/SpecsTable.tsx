import { useMemo } from 'react'

import { useParameterDictionary, useParameterGroups } from '@/features/parameters/hooks'
import type { ListingAttribute, ListingDetail } from '@/shared/api/types'
import { formatMileage, formatNumber } from '@/shared/lib/format'

interface SpecsTableProps {
  listing: ListingDetail
}

/**
 * Ficha tecnica construida desde el esquema de parametros: respeta el orden y
 * las etiquetas que definio el administrador, y los grupos multivalor se
 * agrupan en una sola fila.
 */
export function SpecsTable({ listing }: SpecsTableProps) {
  const dictionary = useParameterDictionary()
  const { data: groups } = useParameterGroups()

  const rows = useMemo(() => {
    const byGroup = new Map<string, ListingAttribute[]>()
    for (const attribute of listing.attributes) {
      byGroup.set(attribute.groupCode, [...(byGroup.get(attribute.groupCode) ?? []), attribute])
    }

    const ordered = (groups ?? [])
      .filter((group) => group.showInSpecs && byGroup.has(group.code))
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((group) => ({
        code: group.code,
        label: group.name,
        values: (byGroup.get(group.code) ?? []).map((attribute) =>
          dictionary.valueLabel(group.code, rawValue(attribute)),
        ),
      }))

    // Si el esquema aún no cargó, igual se muestra lo que trae la publicación.
    if (ordered.length === 0 && byGroup.size > 0) {
      return [...byGroup.entries()].map(([code, attributes]) => ({
        code,
        label: dictionary.groupLabel(code),
        values: attributes.map((attribute) => attribute.displayValue),
      }))
    }
    return ordered
  }, [listing.attributes, groups, dictionary])

  return (
    <div className="flex flex-col gap-6">
      <dl className="grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
        <Row label="Marca" value={listing.brandName} />
        <Row label="Modelo" value={listing.modelName} />
        <Row label="Año" value={String(listing.year)} />
        <Row label="Kilometraje" value={formatMileage(listing.mileageKm)} />
        {listing.cityCode ? (
          <Row label="Ciudad" value={dictionary.valueLabel('CITY', listing.cityCode)} />
        ) : null}
        <Row label="Referencia" value={listing.reference} mono />
        <Row label="Visitas" value={formatNumber(listing.viewCount)} />

        {rows
          .filter((row) => row.code !== 'CITY' && row.code !== 'FEATURE')
          .map((row) => (
            <Row key={row.code} label={row.label} value={row.values.join(', ')} />
          ))}
      </dl>

      {rows
        .filter((row) => row.code === 'FEATURE')
        .map((row) => (
          <section key={row.code}>
            <h3 className="text-strong mb-2.5 text-sm font-semibold">{row.label}</h3>
            <ul className="flex flex-wrap gap-1.5">
              {row.values.map((value) => (
                <li
                  key={value}
                  className="bg-surface-sunken text-muted rounded-full px-3 py-1 text-xs font-medium"
                >
                  {value}
                </li>
              ))}
            </ul>
          </section>
        ))}
    </div>
  )
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-surface pb-3">
      <dt className="text-muted shrink-0 text-sm">{label}</dt>
      <dd className={mono ? 'text-strong font-mono text-sm' : 'text-strong text-sm font-medium'}>
        {value}
      </dd>
    </div>
  )
}

/** Lleva el atributo a su representación en texto, según el campo que use. */
function rawValue(attribute: ListingAttribute): string {
  if (attribute.optionCode) {
    return attribute.optionCode
  }
  if (attribute.textValue) {
    return attribute.textValue
  }
  if (attribute.numberValue !== null && attribute.numberValue !== undefined) {
    return formatNumber(attribute.numberValue)
  }
  if (attribute.boolValue !== null && attribute.boolValue !== undefined) {
    return String(attribute.boolValue)
  }
  return attribute.displayValue
}
