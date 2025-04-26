export type FilterType = 'range' | 'select' | 'multiselect' | 'toggle'

export interface FilterOption {
  label: string
  value: string
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

export interface FilterValue {
  [filterId: string]: any
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