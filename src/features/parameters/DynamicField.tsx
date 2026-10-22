import type { DynamicValue } from '@/features/parameters/attributes'
import type { ParameterGroup } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { CheckboxField, SelectField, TextField } from '@/shared/ui/Field'

interface DynamicFieldProps {
  group: ParameterGroup
  value: DynamicValue
  onChange: (value: DynamicValue) => void
  error?: string
}

/**
 * Renderiza un campo de formulario a partir de un grupo de parametros. Es la
 * contraparte de escritura del esquema configurable: el formulario de
 * publicacion no declara ningun campo de caracteristicas a mano.
 */
export function DynamicField({ group, value, onChange, error }: DynamicFieldProps) {
  const required = group.requiredForListing

  if (group.dataType === 'OPTION') {
    if (group.multiValued) {
      const selected = Array.isArray(value) ? value : []
      return (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-strong text-sm font-medium">
            {group.name}
            {required ? (
              <span className="ml-0.5 text-red-600" aria-hidden>
                *
              </span>
            ) : null}
          </legend>
          {group.description ? <p className="text-muted text-xs">{group.description}</p> : null}
          <div className="flex flex-wrap gap-1.5">
            {group.options.map((option) => {
              const active = selected.includes(option.code)
              return (
                <button
                  key={option.code}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    onChange(
                      active
                        ? selected.filter((item) => item !== option.code)
                        : [...selected, option.code],
                    )
                  }
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    active
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-surface text-muted hover:border-brand-400 hover:text-strong',
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
          {error ? (
            <p role="alert" className="text-xs font-medium text-red-600">
              {error}
            </p>
          ) : null}
        </fieldset>
      )
    }

    return (
      <SelectField
        label={group.name}
        hint={group.description ?? undefined}
        required={required}
        error={error}
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value || undefined)}
      >
        <option value="">Selecciona una opción</option>
        {group.options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </SelectField>
    )
  }

  if (group.dataType === 'BOOLEAN') {
    return (
      <div className="flex flex-col gap-1.5">
        <CheckboxField
          label={group.name}
          hint={group.description ?? undefined}
          checked={value === true}
          onChange={(event) => onChange(event.target.checked ? true : undefined)}
        />
        {error ? (
          <p role="alert" className="text-xs font-medium text-red-600">
            {error}
          </p>
        ) : null}
      </div>
    )
  }

  if (group.dataType === 'NUMBER') {
    return (
      <TextField
        label={group.name}
        type="number"
        inputMode="numeric"
        hint={group.description ?? undefined}
        required={required}
        error={error}
        value={typeof value === 'number' || typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value === '' ? undefined : Number(event.target.value))}
      />
    )
  }

  return (
    <TextField
      label={group.name}
      hint={group.description ?? undefined}
      required={required}
      error={error}
      maxLength={500}
      value={typeof value === 'string' ? value : ''}
      onChange={(event) => onChange(event.target.value || undefined)}
    />
  )
}
