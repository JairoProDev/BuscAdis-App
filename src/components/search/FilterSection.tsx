'use client'

import React from 'react'
import { Filter, FilterValue } from '@/types/filters'
import { Slider } from '@/components/ui/slider'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface FilterSectionProps {
  filters: Filter[]
  activeFilters: FilterValue
  onFilterChange: (filterId: string, value: any) => void
}

export default function FilterSection({
  filters,
  activeFilters,
  onFilterChange
}: FilterSectionProps) {
  // Render different filter types
  const renderFilter = (filter: Filter) => {
    const value = activeFilters[filter.id]
    
    switch (filter.type) {
      case 'range':
        return (
          <div className="space-y-2" key={filter.id}>
            <div className="flex justify-between">
              <Label htmlFor={filter.id} className="text-sm font-medium">{filter.label}</Label>
              <span className="text-sm text-gray-500">
                {filter.format(value?.[0] || filter.min)} - {filter.format(value?.[1] || filter.max)}
              </span>
            </div>
            <Slider
              id={filter.id}
              defaultValue={[value?.[0] || filter.min, value?.[1] || filter.max]}
              min={filter.min}
              max={filter.max}
              step={filter.step}
              onValueChange={(newValue) => onFilterChange(filter.id, newValue)}
              className="mt-2"
            />
          </div>
        )
        
      case 'select':
        return (
          <div className="space-y-1" key={filter.id}>
            <Label htmlFor={filter.id} className="text-sm font-medium">{filter.label}</Label>
            <Select
              value={value || ''}
              onValueChange={(newValue) => onFilterChange(filter.id, newValue)}
            >
              <SelectTrigger id={filter.id} className="w-full">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
        
      case 'multiselect':
        const selectedValues = value || []
        return (
          <div className="space-y-2" key={filter.id}>
            <Label className="text-sm font-medium">{filter.label}</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {filter.options.map((option) => (
                <Badge
                  key={option.value}
                  variant={selectedValues.includes(option.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    const newValues = selectedValues.includes(option.value)
                      ? selectedValues.filter(v => v !== option.value)
                      : [...selectedValues, option.value]
                    onFilterChange(filter.id, newValues)
                  }}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>
        )
        
      case 'toggle':
        return (
          <div className="flex items-center justify-between space-x-2" key={filter.id}>
            <Label htmlFor={filter.id} className="text-sm font-medium">{filter.label}</Label>
            <Switch
              id={filter.id}
              checked={!!value}
              onCheckedChange={(checked) => onFilterChange(filter.id, checked)}
              aria-label={filter.label}
            />
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {filters.map(renderFilter)}
    </div>
  )
} 