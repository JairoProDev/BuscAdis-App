import { filtersByCategory } from '@/data/filterConfig'
import type { FilterOption } from '@/types/filters'

/**
 * Obtiene todos los filtros disponibles para una categoría específica.
 * Extrae y aplana los filtros de todas las secciones en un único array.
 * 
 * @param category Categoría para la que obtener filtros
 * @returns Array de opciones de filtro
 */
export function getFiltersForCategory(category: string): FilterOption[] {
  // Si la categoría no existe en la configuración, devolver array vacío
  if (!category || !filtersByCategory[category]) {
    return []
  }
  
  // Extraer todas las secciones y aplanar sus filtros
  const filters: FilterOption[] = []
  const categoryConfig = filtersByCategory[category]
  
  for (const section of categoryConfig.sections) {
    for (const filter of section.filters) {
      filters.push(filter)
    }
  }
  
  return filters
}

/**
 * Encuentra un filtro específico por su ID dentro de una categoría.
 * 
 * @param category Categoría en la que buscar
 * @param filterId ID del filtro a buscar
 * @returns La opción de filtro o undefined si no se encuentra
 */
export function findFilterById(category: string, filterId: string): FilterOption | undefined {
  const filters = getFiltersForCategory(category)
  return filters.find(filter => filter.id === filterId)
}

/**
 * Verifica si un filtro está activo según su valor actual.
 * 
 * @param filter El filtro a verificar
 * @param value El valor actual del filtro
 * @returns true si el filtro está activo (tiene un valor no predeterminado)
 */
export function isFilterActive(filter: FilterOption, value: any): boolean {
  if (value === undefined || value === null) {
    return false
  }
  
  if (filter.type === 'range' && Array.isArray(value)) {
    // Un filtro de rango está activo si alguno de sus valores es diferente del mínimo o máximo
    return value[0] !== (filter.min || 0) || value[1] !== (filter.max || 100)
  }
  
  if (filter.type === 'multiselect' && Array.isArray(value)) {
    // Un multiselect está activo si tiene al menos una opción seleccionada
    return value.length > 0
  }
  
  if (filter.type === 'toggle') {
    // Un toggle está activo solo si es true
    return value === true
  }
  
  // Para select y otros tipos, está activo si tiene algún valor
  return value !== ''
} 