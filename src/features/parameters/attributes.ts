import type { AttributeInput, ParameterGroup } from '@/shared/api/types'

/** Valor de un campo dinámico, según el tipo de dato de su grupo. */
export type DynamicValue = string | string[] | boolean | number | undefined

export type DynamicValues = Record<string, DynamicValue>

/** Traduce los valores del formulario al contrato que espera la API. */
export function toAttributeInputs(
  groups: ParameterGroup[],
  values: DynamicValues,
): AttributeInput[] {
  const result: AttributeInput[] = []

  for (const group of groups) {
    const value = values[group.code]
    if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      continue
    }

    switch (group.dataType) {
      case 'OPTION':
        for (const code of Array.isArray(value) ? value : [String(value)]) {
          result.push({ groupCode: group.code, optionCode: code })
        }
        break
      case 'BOOLEAN':
        result.push({ groupCode: group.code, boolValue: Boolean(value) })
        break
      case 'NUMBER':
        result.push({ groupCode: group.code, numberValue: Number(value) })
        break
      case 'TEXT':
        result.push({ groupCode: group.code, textValue: String(value) })
        break
    }
  }

  return result
}

/**
 * Valida en el cliente lo mismo que exige el backend al publicar, para que la
 * persona lo vea junto al campo y no como un error global al enviar.
 */
export function validateRequired(
  groups: ParameterGroup[],
  values: DynamicValues,
): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const group of groups) {
    if (!group.requiredForListing) {
      continue
    }
    const value = values[group.code]
    const empty =
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      value === false
    if (empty) {
      errors[group.code] = `${group.name} es obligatorio para publicar`
    }
  }

  return errors
}
