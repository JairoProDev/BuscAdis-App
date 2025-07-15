import React, { useRef, useState, useEffect, MouseEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/Checkbox'
import { FilterValue } from '@/types/search'
import { cn } from '@/lib/utils'
import { getFiltersForCategory, findFilterById, isFilterActive } from '@/utils/filterUtils'
import { X, ChevronDown } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { createPortal } from 'react-dom'

// Importaciones de tipos
import { FilterOption } from '@/types/filters'

interface FilterChipsProps {
  category: string
  activeFilters: Record<string, FilterValue>
  onFilterChange: (key: string, value: FilterValue) => void
  className?: string
}

export default function FilterChips({
  category,
  activeFilters,
  onFilterChange,
  className
}: FilterChipsProps) {
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [temporaryFilters, setTemporaryFilters] = useState<Record<string, FilterValue>>(activeFilters)
  const filterContainerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null)

  // Reset temporary filters when active filters change
  useEffect(() => {
    setTemporaryFilters(activeFilters)
  }, [activeFilters])

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (openFilter && filterContainerRef.current) {
        const target = event.target as Node
        
        // Check if click was inside the current open dropdown
        const currentDropdownRef = dropdownRefs.current[openFilter]
        const currentButtonRef = buttonRefs.current[openFilter]
        
        if (
          currentDropdownRef && 
          !currentDropdownRef.contains(target) && 
          currentButtonRef && 
          !currentButtonRef.contains(target)
        ) {
          setOpenFilter(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside as unknown as EventListener)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside as unknown as EventListener)
    }
  }, [openFilter])

  const toggleDropdown = (filterId: string) => {
    if (openFilter === filterId) {
      setOpenFilter(null)
      setDropdownPosition(null)
    } else {
      setOpenFilter(filterId)
      // Calcular posición del botón
      const btn = buttonRefs.current[filterId]
      if (btn) {
        const rect = btn.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        })
      }
    }
  }

  const handleTempFilterChange = (key: string, value: FilterValue) => {
    setTemporaryFilters((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  const applyFilter = (key: string) => {
    onFilterChange(key, temporaryFilters[key])
    setOpenFilter(null)
  }

  const clearFilter = (key: string) => {
    const filter = findFilterById(category, key)
    
    if (filter) {
      const defaultValue = filter.type === 'range' 
        ? [filter.min || 0, filter.max || 100] 
        : filter.type === 'toggle' 
          ? false 
          : null
          
      onFilterChange(key, defaultValue)
    }
  }

  const isFilterActiveCheck = (key: string): boolean => {
    if (!activeFilters[key]) return false
    
    const filter = findFilterById(category, key)
    if (!filter) return false
    
    return isFilterActive(filter, activeFilters[key])
  }

  const getFilterLabel = (filter: FilterOption, value: FilterValue): string => {
    if (!value) return filter.label || filter.id
    
    if (filter.type === 'range' && Array.isArray(value)) {
      const unit = filter.unit || ''
      return `${filter.label}: ${value[0]}${unit} - ${value[1]}${unit}`
    }
    
    if (filter.type === 'select' && value) {
      const option = filter.options?.find((opt) => opt.value === value)
      return `${filter.label}: ${option?.label || value}`
    }
    
    if (filter.type === 'multiselect' && Array.isArray(value) && value.length > 0) {
      if (value.length === 1) {
        const option = filter.options?.find((opt) => opt.value === value[0])
        return `${filter.label}: ${option?.label || value[0]}`
      }
      return `${filter.label}: ${value.length} seleccionados`
    }
    
    if (filter.type === 'toggle' && value === true) {
      return filter.label
    }
    
    return filter.label || filter.id
  }

  const renderFilterContent = (filter: FilterOption) => {
    const value = temporaryFilters[filter.id]
    
    switch (filter.type) {
      case 'range': {
        const rangeValue = (value as number[] || [filter.min || 0, filter.max || 100])
        return (
          <div className="space-y-4 w-full p-3">
            <div className="flex justify-between text-sm">
              <div>
                {filter.label} {rangeValue[0]}{filter.unit}
              </div>
              <div>
                {rangeValue[1]}{filter.unit}
              </div>
            </div>
            
            <Slider
              value={rangeValue}
              min={filter.min || 0}
              max={filter.max || 100}
              step={filter.step || 1}
              onValueChange={(newValue) => handleTempFilterChange(filter.id, newValue)}
            />
            
            <div className="flex justify-between gap-2">
              <Input
                type="number"
                min={filter.min || 0}
                max={filter.max || 100}
                value={rangeValue[0]}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const newValue = parseInt(e.target.value) || filter.min || 0
                  handleTempFilterChange(filter.id, [newValue, rangeValue[1]])
                }}
                className="w-full"
              />
              <Input
                type="number"
                min={filter.min || 0}
                max={filter.max || 100}
                value={rangeValue[1]}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const newValue = parseInt(e.target.value) || filter.max || 100
                  handleTempFilterChange(filter.id, [rangeValue[0], newValue])
                }}
                className="w-full"
              />
            </div>
            
            <div className="flex justify-end">
              <Button size="sm" onClick={() => applyFilter(filter.id)}>
                Aplicar
              </Button>
            </div>
          </div>
        )
      }
      
      case 'select':
        return (
          <div className="p-3 space-y-2 w-full min-w-[200px]">
            {filter.options?.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "cursor-pointer px-3 py-2 rounded hover:bg-slate-700 transition-colors",
                  value === option.value && "bg-slate-700"
                )}
                onClick={() => {
                  handleTempFilterChange(filter.id, option.value)
                  applyFilter(filter.id)
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )
      
      case 'multiselect':
        return (
          <div className="p-3 space-y-2 min-w-[200px]">
            {filter.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${filter.id}-${option.value}`}
                  checked={(value as string[] || []).includes(option.value)}
                  onCheckedChange={(checked) => {
                    const currentValues = (value as string[] || [])
                    const newValues = checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value)
                    handleTempFilterChange(filter.id, newValues)
                  }}
                />
                <label
                  htmlFor={`${filter.id}-${option.value}`}
                  className="text-sm cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
            
            <div className="flex justify-end mt-2">
              <Button size="sm" onClick={() => applyFilter(filter.id)}>
                Aplicar
              </Button>
            </div>
          </div>
        )
      
      case 'toggle':
        return (
          <div className="p-3 flex items-center justify-between min-w-[200px]">
            <span>{filter.label}</span>
            <Switch
              checked={!!value}
              onCheckedChange={(checked) => {
                handleTempFilterChange(filter.id, checked)
                applyFilter(filter.id)
              }}
            />
          </div>
        )
      
      default:
        return null
    }
  }

  const filters = getFiltersForCategory(category)

  return (
    <div 
      ref={filterContainerRef} 
      className={cn("flex flex-nowrap gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent relative", className)}
    >
      {filters.map((filter) => (
        <div key={filter.id} className="relative">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-1 h-8 px-4 rounded-lg text-sm font-medium transition-colors",
              isFilterActiveCheck(filter.id)
                ? "bg-teal-600 text-white hover:bg-teal-700"
                : "bg-slate-700 text-white hover:bg-teal-600 hover:text-white",
              isFilterActiveCheck(filter.id) && "font-medium"
            )}
            onClick={() => toggleDropdown(filter.id)}
            ref={(el) => {
              buttonRefs.current[filter.id] = el
            }}
          >
            {getFilterLabel(filter, activeFilters[filter.id])}
            <ChevronDown size={14} className={cn(
              "transition-transform", 
              openFilter === filter.id && "transform rotate-180"
            )} />
            
            {isFilterActiveCheck(filter.id) && (
              <X
                size={14}
                className="ml-1 opacity-70 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  clearFilter(filter.id)
                }}
              />
            )}
          </Button>
          
          {openFilter === filter.id && dropdownPosition && typeof window !== 'undefined' && createPortal(
            <div
              ref={(el) => {
                dropdownRefs.current[filter.id] = el
              }}
              className="z-[200] bg-slate-800 rounded-lg border border-slate-700 shadow-2xl"
              style={{
                position: 'fixed',
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                minWidth: dropdownPosition.width,
                maxWidth: 320
              }}
            >
              {renderFilterContent(filter)}
            </div>,
            document.body
          )}
        </div>
      ))}
      
      {Object.keys(activeFilters).length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-muted-foreground hover:text-foreground"
          onClick={() => {
            // Clear all filters
            const availableFilters = getFiltersForCategory(category)
            availableFilters.forEach(filter => clearFilter(filter.id))
          }}
        >
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}

// También exportamos como componente nombrado para mantener compatibilidad
export { FilterChips } 