import { RotateCcw } from 'lucide-react'

import type { ListingFilters } from '@/features/listings/useListingFilters'
import { useBrands, useFilterableGroups } from '@/features/parameters/hooks'
import type { ParameterGroup } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { CheckboxField, SelectField, TextField } from '@/shared/ui/Field'
import { Skeleton } from '@/shared/ui/Feedback'

interface FilterPanelProps {
  filters: ListingFilters
}

/**
 * Panel de filtros generado a partir del esquema de parametros. No hay una
 * lista de filtros escrita a mano: cada grupo marcado como filtrable se
 * renderiza segun su tipo de dato, asi que un grupo nuevo en el backend
 * aparece aqui sin cambios en este archivo.
 */
export function FilterPanel({ filters }: FilterPanelProps) {
  const { groups, isLoading } = useFilterableGroups()
  const { data: brands } = useBrands()

  const selectedBrandId = filters.params.brandIds?.[0]
  const selectedBrand = brands?.find((brand) => brand.id === selectedBrandId)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">
          Filtros
          {filters.activeCount > 0 ? (
            <span className="bg-brand-600 ml-2 rounded-full px-2 py-0.5 text-xs font-semibold text-white">
              {filters.activeCount}
            </span>
          ) : null}
        </h2>
        {filters.activeCount > 0 ? (
          <Button
            size="sm"
            variant="ghost"
            icon={<RotateCcw className="size-3.5" />}
            onClick={filters.reset}
          >
            Limpiar
          </Button>
        ) : null}
      </header>

      <Section title="Marca y modelo">
        <SelectField
          label="Marca"
          value={selectedBrandId ?? ''}
          onChange={(event) =>
            filters.setBrand(event.target.value ? Number(event.target.value) : undefined)
          }
        >
          <option value="">Todas las marcas</option>
          {brands?.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </SelectField>

        {selectedBrand && selectedBrand.models.length > 0 ? (
          <SelectField
            label="Modelo"
            value={filters.params.modelIds?.[0] ?? ''}
            onChange={(event) =>
              filters.setModel(event.target.value ? Number(event.target.value) : undefined)
            }
          >
            <option value="">Todos los modelos</option>
            {selectedBrand.models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </SelectField>
        ) : null}
      </Section>

      <Section title="Precio">
        <div className="grid grid-cols-2 gap-2.5">
          <TextField
            label="Desde"
            type="number"
            inputMode="numeric"
            min={0}
            step={1_000_000}
            placeholder="0"
            value={filters.params.minPrice ?? ''}
            onChange={(event) =>
              filters.setNumber('minPrice', toNumber(event.target.value))
            }
          />
          <TextField
            label="Hasta"
            type="number"
            inputMode="numeric"
            min={0}
            step={1_000_000}
            placeholder="Sin límite"
            value={filters.params.maxPrice ?? ''}
            onChange={(event) =>
              filters.setNumber('maxPrice', toNumber(event.target.value))
            }
          />
        </div>
      </Section>

      <Section title="Año y kilometraje">
        <div className="grid grid-cols-2 gap-2.5">
          <TextField
            label="Año desde"
            type="number"
            inputMode="numeric"
            min={1950}
            placeholder="1950"
            value={filters.params.minYear ?? ''}
            onChange={(event) => filters.setNumber('minYear', toNumber(event.target.value))}
          />
          <TextField
            label="Año hasta"
            type="number"
            inputMode="numeric"
            placeholder="Actual"
            value={filters.params.maxYear ?? ''}
            onChange={(event) => filters.setNumber('maxYear', toNumber(event.target.value))}
          />
        </div>
        <TextField
          label="Kilometraje máximo"
          type="number"
          inputMode="numeric"
          min={0}
          step={10_000}
          placeholder="Sin límite"
          value={filters.params.maxMileage ?? ''}
          onChange={(event) => filters.setNumber('maxMileage', toNumber(event.target.value))}
        />
      </Section>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      ) : (
        groups.map((group) => (
          <GroupFilter key={group.code} group={group} filters={filters} />
        ))
      )}

      <Section title="Negociación">
        <CheckboxField
          label="Solo precio negociable"
          hint="Vendedores abiertos a recibir ofertas"
          checked={filters.params.negotiable === true}
          onChange={(event) => filters.setNegotiable(event.target.checked)}
        />
      </Section>
    </div>
  )
}

/** Un grupo del esquema se dibuja según su tipo de dato. */
function GroupFilter({ group, filters }: { group: ParameterGroup; filters: ListingFilters }) {
  const selected = filters.attrByGroup.get(group.code) ?? []

  if (group.dataType === 'OPTION') {
    if (group.options.length === 0) {
      return null
    }
    // Los catálogos largos (ciudad) se leen mejor en un select que en chips.
    if (group.options.length > 8) {
      return (
        <Section title={group.name} hint={group.description}>
          <SelectField
            label={`Elige ${group.name.toLowerCase()}`}
            value={selected[0] ?? ''}
            onChange={(event) => filters.setAttrValue(group.code, event.target.value || undefined)}
          >
            <option value="">Cualquiera</option>
            {group.options.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </SelectField>
        </Section>
      )
    }

    return (
      <Section title={group.name} hint={group.description}>
        <div className="flex flex-wrap gap-1.5">
          {group.options.map((option) => {
            const active = selected.includes(option.code)
            return (
              <button
                key={option.code}
                type="button"
                aria-pressed={active}
                onClick={() => filters.toggleAttr(group.code, option.code)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  active
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-surface text-muted hover:border-brand-400 hover:text-strong',
                )}
              >
                {option.colorHex ? (
                  <span
                    aria-hidden
                    className="size-3 rounded-full border border-black/15"
                    style={{ backgroundColor: option.colorHex }}
                  />
                ) : null}
                {option.label}
              </button>
            )
          })}
        </div>
      </Section>
    )
  }

  if (group.dataType === 'BOOLEAN') {
    return (
      <Section title={group.name} hint={group.description}>
        <CheckboxField
          label={`Solo con ${group.name.toLowerCase()}`}
          checked={selected.includes('true')}
          onChange={(event) =>
            filters.setAttrValue(group.code, event.target.checked ? 'true' : undefined)
          }
        />
      </Section>
    )
  }

  if (group.dataType === 'NUMBER') {
    return (
      <Section title={group.name} hint={group.description}>
        <TextField
          label={group.name}
          type="number"
          inputMode="numeric"
          placeholder="Cualquiera"
          value={selected[0] ?? ''}
          onChange={(event) =>
            filters.setAttrValue(group.code, event.target.value || undefined)
          }
        />
      </Section>
    )
  }

  return (
    <Section title={group.name} hint={group.description}>
      <TextField
        label={group.name}
        placeholder="Cualquiera"
        value={selected[0] ?? ''}
        onChange={(event) => filters.setAttrValue(group.code, event.target.value || undefined)}
      />
    </Section>
  )
}

function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string | null
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2.5 border-t border-surface pt-5 first:border-0 first:pt-0">
      <div>
        <h3 className="text-strong text-sm font-semibold">{title}</h3>
        {hint ? <p className="text-muted mt-0.5 text-xs">{hint}</p> : null}
      </div>
      {children}
    </section>
  )
}

function toNumber(raw: string): number | undefined {
  if (raw.trim() === '') {
    return undefined
  }
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : undefined
}
