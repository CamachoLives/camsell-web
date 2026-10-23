import { useMemo } from 'react'

import { useParameterDictionary, useParameterGroups } from '@/features/parameters/hooks'
import type { ListingAttribute, ListingDetail } from '@/shared/api/types'
import { formatNumber } from '@/shared/lib/format'

interface SpecsTableProps {
  listing: ListingDetail
}

/**
 * Ficha técnica construida desde el esquema de parámetros: respeta el orden y
 * las etiquetas que definió el administrador, y los grupos multivalor se
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

  const specs = rows.filter((row) => row.code !== 'CITY' && row.code !== 'FEATURE')
  const features = rows.find((row) => row.code === 'FEATURE')

  return (
    <div className="flex flex-col gap-8">
      {/*
        Celdas en rejilla en lugar de filas de tabla: cada dato queda como una
        unidad legible de un vistazo, y en móvil se reordena en una columna sin
        que el valor se separe de su etiqueta.
      */}
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-surface bg-[var(--surface-border)] sm:grid-cols-3 lg:grid-cols-4">
        <Cell label="Marca" value={listing.brandName} />
        <Cell label="Modelo" value={listing.modelName} />
        <Cell label="Año" value={String(listing.year)} numeric />
        <Cell label="Kilometraje" value={`${formatNumber(listing.mileageKm)} km`} numeric />
        {listing.cityCode ? (
          <Cell label="Ciudad" value={dictionary.valueLabel('CITY', listing.cityCode)} />
        ) : null}
        {specs.map((row) => (
          <Cell key={row.code} label={row.label} value={row.values.join(', ')} />
        ))}
        <Cell label="Referencia" value={listing.reference} numeric />
        <Cell label="Visitas" value={formatNumber(listing.viewCount)} numeric />
      </dl>

      {features && features.values.length > 0 ? (
        <section>
          <h3 className="text-strong mb-3 text-sm font-semibold">{features.label}</h3>
          <ul className="flex flex-wrap gap-2">
            {features.values.map((value) => (
              <li
                key={value}
                className="surface-flat text-base rounded-full px-3.5 py-1.5 text-xs font-medium"
              >
                {value}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

function Cell({
  label,
  value,
  numeric = false,
}: {
  label: string
  value: string
  numeric?: boolean
}) {
  return (
    <div className="bg-surface-raised px-4 py-3.5">
      <dt className="text-muted text-[0.65rem] font-semibold tracking-widest uppercase">
        {label}
      </dt>
      <dd
        className={
          numeric
            ? 'numeric text-strong mt-1 text-sm font-medium'
            : 'text-strong mt-1 text-sm font-medium'
        }
      >
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
