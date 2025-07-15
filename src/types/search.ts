import type { FilterValue, FilterOption } from './filters'

/**
 * Tipo de categoría válido según las keys de filtersByCategory.
 */
export type CategoryFilters = string

/**
 * Re-exportamos tipos de filters para facilitar su uso
 */
export { FilterValue, FilterOption }

/**
 * Interface para resultados de búsqueda
 */
export interface SearchResult {
  id: string
  title: string
  description?: string
  price?: number
  location?: string
  imageUrl?: string
  category?: string
  subcategory?: string
  createdAt?: string
  [key: string]: unknown
}

/**
 * Opciones para filtros de búsqueda
 */
export interface SearchOptions {
  query?: string
  category?: string
  subcategory?: string
  subsubcategory?: string
  filters?: Record<string, FilterValue>
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

/**
 * Respuesta de búsqueda
 */
export interface SearchResponse {
  results: SearchResult[]
  total: number
  page: number
  limit: number
  hasMore: boolean
} 