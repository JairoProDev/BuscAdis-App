import { filtersByCategory } from '@/data/filterConfig'
import type { FilterOption } from '@/types/filters'

/**
 * Devuelve todas las definiciones de filtros (flattened) para una categoría dada.
 */
export function getFiltersForCategory(category: keyof typeof filtersByCategory): FilterOption[] {
  const categoryConfig = filtersByCategory[category]
  if (!categoryConfig) return []
  // Aplanamos todas las secciones en un único array de filtros
  return categoryConfig.sections.flatMap(section => section.filters)
} 