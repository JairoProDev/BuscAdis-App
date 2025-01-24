export interface FilterOption {
  value: string
  label: string
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

export type FilterValue = {
  [key: string]: any
} 