'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'
import { Slider } from '@/components/ui/slider'
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/Select'
import { Switch } from '@/components/ui/switch'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { FilterSelectOption, FilterType, FilterValue } from '@/types/filters'

interface FilterSectionProps {
  title: string
  description?: string
  type: FilterType
  options?: FilterSelectOption[]
  min?: number
  max?: number
  step?: number
  value: FilterValue
  onChange: (value: FilterValue) => void
  onApply?: () => void
  className?: string
  activeFilters?: FilterValue
}

export default function FilterSection({
  title,
  description,
  type,
  options = [],
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  onApply,
  className = '',
  // activeFilters, // Unused variable
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Determinar si hay valores seleccionados
  const hasSelection = () => {
    if (!value) return false
    
    switch (type) {
      case 'range':
        // Verificar si el rango está en su valor por defecto
        return Array.isArray(value) && (value[0] !== min || value[1] !== max)
      case 'select':
        return !!value
      case 'multiselect':
        return Array.isArray(value) && value.length > 0
      case 'toggle':
        return value === true
      default:
        return false
    }
  }
  
  // Renderizar el contenido basado en el tipo de filtro
  const renderFilterContent = () => {
    switch (type) {
      case 'range':
        return (
          <div className="pt-2 pb-4 px-2">
            <Slider
              min={min}
              max={max}
              step={step}
              value={Array.isArray(value) ? (value as number[]) : [min, max]}
              onValueChange={onChange}
              className="my-6"
            />
            <div className="flex justify-between text-sm text-slate-300 mt-1">
              <div>
                {value?.[0] !== undefined ? value[0].toLocaleString() : min.toLocaleString()}
              </div>
              <div>
                {value?.[1] !== undefined ? value[1].toLocaleString() : max.toLocaleString()}
              </div>
            </div>
          </div>
        )
        
      case 'select':
        return (
          <div className="p-3">
            <Select
              value={value || ''}
              onValueChange={onChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar opción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
        
      case 'multiselect':
        return (
          <div className="p-3 space-y-2">
            <div className="flex flex-wrap gap-2">
              {options.map((option) => {
                const isSelected = Array.isArray(value) && value.includes(option.value)
                
                return (
                  <Badge
                    key={option.value}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer ${
                      isSelected 
                        ? 'bg-teal-500 hover:bg-teal-600' 
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                    onClick={() => {
                      if (!Array.isArray(value)) {
                        onChange([option.value])
                        return
                      }
                      
                      if (isSelected) {
                        onChange(value.filter(v => v !== option.value))
                      } else {
                        onChange([...value, option.value])
                      }
                    }}
                  >
                    {option.label}
                  </Badge>
                )
              })}
            </div>
            
            {Array.isArray(value) && value.length > 0 && (
              <button
                onClick={() => onChange([])}
                className="text-xs text-slate-400 hover:text-slate-300"
              >
                Limpiar selección
              </button>
            )}
          </div>
        )
        
      case 'toggle':
        return (
          <div className="p-3 flex items-center justify-between">
            <span className="text-sm text-slate-300">
              {description || 'Activar/Desactivar'}
            </span>
            <Switch
              checked={!!value}
              onCheckedChange={onChange}
              className="data-[state=checked]:bg-teal-500"
            />
          </div>
        )
        
      default:
        return null
    }
  }
  
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <div className="flex items-center">
          <span className="font-medium text-white">{title}</span>
          {hasSelection() && (
            <Badge className="ml-2 bg-teal-500 text-xs py-0.5">Activo</Badge>
          )}
        </div>
        
        {isOpen ? (
          <ChevronUpIcon className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-slate-400" />
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-800"
          >
            {renderFilterContent()}
            
            {onApply && (
              <div className="px-3 pb-3 flex justify-end">
                <button
                  onClick={onApply}
                  className="bg-teal-500 hover:bg-teal-600 text-white py-1.5 px-3 rounded-md text-sm transition-colors"
                >
                  Aplicar
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 