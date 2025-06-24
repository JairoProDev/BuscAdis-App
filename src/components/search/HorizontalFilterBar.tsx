import React, { useState } from 'react';
import { ChevronDownIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { FilterOption, FilterSelectOption, FilterValue } from '@/types/filters';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/switch';
import { filtersByCategory } from '@/data/filterConfig';

interface HorizontalFilterBarProps {
  category: string;
  activeFilters: Record<string, FilterValue>;
  onFilterChange: (filters: Record<string, unknown>) => void;
  className?: string;
}

export default function HorizontalFilterBar({
  category,
  activeFilters,
  onFilterChange,
  className = '',
}: HorizontalFilterBarProps) {
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  // Get available filters for the current category
  const getAvailableFilters = () => {
    if (!category || !filtersByCategory[category]) return [];
    
    // Extract all filters from all sections for this category
    const filters = [];
    for (const section of filtersByCategory[category].sections) {
      for (const filter of section.filters) {
        filters.push(filter);
      }
    }
    return filters;
  };

  // Handle filter change
  const handleFilterChange = (filterId: string, value: unknown) => {
    const newFilters = { ...activeFilters };
    
    // Remove empty values
    if (value === '' || value === null || value === undefined || 
        (Array.isArray(value) && value.length === 0)) {
      delete newFilters[filterId];
    } else {
      newFilters[filterId] = value as FilterValue;
    }
    
    onFilterChange(newFilters);
  };

  // Count active filters
  const getFilterCount = () => {
    return Object.keys(activeFilters).filter(key => 
      key !== 'category' && key !== 'subcategory' && key !== 'subsubcategory'
    ).length;
  };

  // Clear all filters
  const clearAllFilters = () => {
    const newFilters = { ...activeFilters };
    
    // Keep only category/subcategory/subsubcategory
    Object.keys(newFilters).forEach(key => {
      if (key !== 'category' && key !== 'subcategory' && key !== 'subsubcategory') {
        delete newFilters[key];
      }
    });
    
    onFilterChange(newFilters);
  };

  // Render a single filter dropdown
  const renderFilterDropdown = (filterId: string, label: string, content: React.ReactNode) => {
    const isActive = openFilter === filterId;
    const hasActiveValue = activeFilters[filterId] !== undefined;
    
    return (
      <div className="relative" key={filterId}>
        <button
          className={`flex items-center gap-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            isActive || hasActiveValue
              ? 'bg-teal-500 text-white' 
              : 'bg-slate-800 text-white hover:bg-slate-700'
          }`}
          onClick={() => setOpenFilter(isActive ? null : filterId)}
        >
          <span>{label}</span>
          <ChevronDownIcon className={`h-4 w-4 transition-transform ml-1 ${isActive ? 'rotate-180' : ''}`} />
        </button>
        
        {isActive && (
          <div 
            className="absolute z-40 top-full left-0 mt-1 min-w-[220px] bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-3"
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </div>
        )}
      </div>
    );
  };

  // Render filter content based on type
  const renderFilterContent = (filter: FilterOption) => {
    const value = activeFilters[filter.id];
    
    switch (filter.type) {
      case 'range':
        const rangeValue = Array.isArray(value) ? value : [filter.min || 0, filter.max || 100];
        return (
          <div className="space-y-3 min-w-[180px]">
            <div className="flex justify-between">
              <span className="text-xs text-slate-300 font-medium">{filter.label}</span>
              <span className="text-xs text-slate-400">
                {filter.format ? filter.format(Number(rangeValue[0])) : rangeValue[0]} - 
                {filter.format ? filter.format(Number(rangeValue[1])) : rangeValue[1]}
              </span>
            </div>
            <Slider
              defaultValue={rangeValue.map(Number)}
              min={filter.min || 0}
              max={filter.max || 100}
              step={filter.step || 1}
              onValueChange={(newValue) => handleFilterChange(filter.id, newValue)}
            />
            <div className="pt-2 flex justify-between">
              <button 
                className="text-xs text-slate-400 hover:text-slate-300"
                onClick={() => setOpenFilter(null)}
              >
                Cerrar
              </button>
              <button 
                className="text-xs text-teal-400 hover:text-teal-300 font-medium"
                onClick={() => {
                  handleFilterChange(filter.id, [filter.min || 0, filter.max || 100]);
                  setOpenFilter(null);
                }}
              >
                Aplicar
              </button>
            </div>
          </div>
        );
        
      case 'select':
        return (
          <div className="space-y-3 min-w-[180px]">
            <Select
              value={String(value) || ''}
              onValueChange={(newValue) => handleFilterChange(filter.id, newValue)}
            >
              <SelectTrigger className="border-slate-700 bg-slate-800 text-white text-sm">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {filter.options?.map((option: FilterSelectOption) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="pt-1 flex justify-end">
              <button 
                className="text-xs text-slate-400 hover:text-slate-300"
                onClick={() => setOpenFilter(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        );
        
      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-3 min-w-[180px]">
            <div className="flex flex-wrap gap-1">
              {filter.options?.map((option: FilterSelectOption) => (
                <Badge
                  key={option.value}
                  variant={selectedValues.includes(option.value) ? "default" : "outline"}
                  className="cursor-pointer text-xs py-0.5 px-2"
                  onClick={() => {
                    const newValues = selectedValues.includes(option.value)
                      ? selectedValues.filter((v: string | number) => v !== option.value)
                      : [...selectedValues, option.value];
                    handleFilterChange(filter.id, newValues);
                  }}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
            <div className="pt-1 flex justify-end">
              <button 
                className="text-xs text-slate-400 hover:text-slate-300"
                onClick={() => setOpenFilter(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        );
        
      case 'toggle':
        return (
          <div className="space-y-3 min-w-[180px]">
            <div className="flex items-center justify-between space-x-2">
              <span className="text-xs text-slate-300 font-medium">{filter.label}</span>
              <Switch
                checked={!!value}
                onCheckedChange={(checked) => handleFilterChange(filter.id, checked)}
              />
            </div>
            <div className="pt-1 flex justify-end">
              <button 
                className="text-xs text-slate-400 hover:text-slate-300"
                onClick={() => setOpenFilter(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const filters = getAvailableFilters();
  const filterCount = getFilterCount();

  // If no filters available or no category selected, don't render anything
  if (filters.length === 0 || !category) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Título y etiqueta de "Filtros" */}
      <div className="flex items-center mb-2 px-1">
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-4 w-4 text-teal-500" />
          <h3 className="text-sm font-medium text-white">Filtros de {filtersByCategory[category]?.title || category}</h3>
        </div>
      </div>
      
      {/* Barra de filtros principal - diseño horizontal con scroll */}
      <div 
        className="w-full overflow-x-auto py-2"
        onClick={() => setOpenFilter(null)}
      >
        <div className="flex items-center space-x-2 min-w-max px-1">
          {/* Ordenar filter (siempre primero) */}
          {filters.find(f => f.id === 'sortBy' || f.id === 'orderBy') && 
            renderFilterDropdown(
              'sortBy', 
              'Ordenar', 
              renderFilterContent(filters.find(f => f.id === 'sortBy' || f.id === 'orderBy') as FilterOption)
            )
          }
          
          {/* Mostrar otros filtros importantes */}
          {filters
            .filter(f => f.id !== 'sortBy' && f.id !== 'orderBy')
            .map(filter => renderFilterDropdown(filter.id, filter.label, renderFilterContent(filter as FilterOption)))}
          
          {/* Botón para limpiar filtros - solo visible si hay filtros activos */}
          {filterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="ml-2 text-xs text-teal-400 hover:text-teal-300 bg-slate-800 border-slate-700"
              onClick={clearAllFilters}
            >
              Limpiar filtros ({filterCount})
            </Button>
          )}
        </div>
      </div>
      
      {/* Lista de filtros activos */}
      {filterCount > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {Object.entries(activeFilters)
            .filter(([key]) => key !== 'category' && key !== 'subcategory' && key !== 'subsubcategory')
            .map(([key, value]) => {
              // Find filter config to get proper label
              const filter = filters.find(f => f.id === key);
              if (!filter) return null;
              
              // Determine display value based on filter type
              let displayValue = value;
              if (filter.type === 'select' && typeof value === 'string') {
                const option = filter.options?.find((o: FilterSelectOption) => o.value === value);
                if (option) displayValue = option.label;
              } else if (filter.type === 'multiselect' && Array.isArray(value)) {
                displayValue = value.map((v: string | number) => {
                  const option = filter.options?.find((o: FilterSelectOption) => o.value === v);
                  return option ? option.label : v;
                }).join(', ');
              } else if (filter.type === 'range' && Array.isArray(value)) {
                displayValue = `${filter.format ? filter.format(Number(value[0])) : value[0]} - ${filter.format ? filter.format(Number(value[1])) : value[1]}`;
              } else if (filter.type === 'toggle') {
                displayValue = value ? 'Sí' : 'No';
              } else if (typeof value === 'object') {
                displayValue = JSON.stringify(value);
              }
              
              return (
                <Badge 
                  key={key}
                  variant="outline"
                  className="bg-slate-800/80 border-teal-800/50 text-teal-200 flex items-center gap-1"
                >
                  <span className="font-medium text-xs">{filter.label}:</span> 
                  <span className="text-white">{displayValue}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFilterChange(key, null);
                    }}
                    className="ml-1 hover:bg-slate-700 rounded-full p-0.5"
                    aria-label={`Eliminar filtro ${filter.label}`}
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
        </div>
      )}
    </div>
  );
} 