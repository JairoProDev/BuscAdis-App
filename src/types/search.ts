import type { filtersByCategory } from '@/data/filterConfig'

/**
 * Tipo de categoría válido según las keys de filtersByCategory.
 */
export type CategoryFilters = keyof typeof filtersByCategory

/**
 * Valor que puede tener un filtro:
 * - string: para selects
 * - number: para inputs numéricos
 * - boolean: para toggles
 * - Array<string|number>: para rangos o multiselects
 * - null: sin valor
 */
export type FilterValue = string | number | boolean | Array<string | number> | null 