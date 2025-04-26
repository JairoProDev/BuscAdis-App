import { ReactNode } from 'react'

// Tipos de filtros disponibles
export enum FilterType {
  RANGE = 'range',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  TOGGLE = 'toggle'
}

// Opción para filtros de tipo select/multiselect
export interface FilterSelectOption {
  value: string
  label: string
}

// Configuración base de un filtro
export interface FilterOption {
  id: string
  type: FilterType | string // Permitimos tipo como string para compatibilidad
  label: string
  min?: number // Para filtros de rango
  max?: number // Para filtros de rango
  step?: number // Para filtros de rango
  unit?: string // Unidad de medida opcional (m², km, €, etc.)
  options?: FilterSelectOption[] // Para filtros select/multiselect
  format?: (value: number) => string // Formateador opcional para valores numéricos
}

// Valor de un filtro
export type FilterValue = string | number | boolean | Array<string | number> | null

// Sección de filtros
export interface FilterSection {
  title: string
  filters: FilterOption[]
}

// Filtros para una categoría
export interface CategoryFilters {
  title: string
  sections: FilterSection[]
}

// Filtros por categoría
export interface FiltersByCategory {
  [key: string]: CategoryFilters
}

// Para usarse en componentes que muestran filtros
export interface FilterContainerProps {
  category: string
  activeFilters: Record<string, FilterValue>
  onFilterChange: (filters: Record<string, unknown>) => void
  className?: string
  children?: ReactNode
}

// Props específicos para chips de filtros
export interface FilterChipsProps {
  category: string
  activeFilters: Record<string, FilterValue>
  onFilterChange: (key: string, value: FilterValue) => void
  className?: string
}

export interface Filter {
  id: string
  label: string
  type: FilterType
  // For range filters
  min?: number
  max?: number
  step?: number
  format?: (value: number) => string
  // For select and multiselect filters
  options?: FilterOption[]
}

export interface CategoryFilter {
  category: string
  filters: Filter[]
}

export interface BaseFilter {
  id: string
  type: string
  label: string
}

export interface RangeFilter extends BaseFilter {
  type: 'range'
  min: number
  max: number
  step: number
  format: (value: number) => string
}

export interface SelectFilter extends BaseFilter {
  type: 'select'
  options: FilterOption[]
}

export interface MultiSelectFilter extends BaseFilter {
  type: 'multiselect'
  options: FilterOption[]
}

export interface ToggleFilter extends BaseFilter {
  type: 'toggle'
}

export interface LocationFilter extends BaseFilter {
  type: 'location'
  defaultLocation?: {
    lat: number
    lng: number
  }
}

export interface RadiusFilter extends BaseFilter {
  type: 'radius'
  min: number
  max: number
  step: number
}

export type Filter =
  | RangeFilter
  | SelectFilter
  | MultiSelectFilter
  | ToggleFilter
  | LocationFilter
  | RadiusFilter

export interface FilterSection {
  title: string
  filters: Filter[]
}

export interface CategoryFilters {
  title: string
  sections: FilterSection[]
}

export interface FiltersByCategory {
  [key: string]: CategoryFilters
} 