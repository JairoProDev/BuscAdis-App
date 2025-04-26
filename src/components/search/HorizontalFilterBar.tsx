import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { FilterOption, FilterValue } from '@/types/filters';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/switch';
import { filtersByCategory } from '@/data/filterConfig';

interface HorizontalFilterBarProps {
  category: string;
  activeFilters: FilterValue;
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
      newFilters[filterId] = value;
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
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            hasActiveValue 
              ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50'
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700'
          }`}
          onClick={() => setOpenFilter(isActive ? null : filterId)}
        >
          <span>{label}</span>
          {hasActiveValue && (
            <span className="flex items-center justify-center bg-blue-500 text-white w-5 h-5 rounded-full text-xs font-medium">
              ✓
            </span>
          )}
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${isActive ? 'rotate-180' : ''}`} />
        </Button>
        
        {isActive && (
          <div 
            className="absolute z-30 top-full left-0 mt-1 min-w-[250px] max-w-[350px] bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </div>
        )}
      </div>
    );
  };

  // Render filter content based on type
  const renderFilterContent = (filter: any) => {
    const value = activeFilters[filter.id];
    
    switch (filter.type) {
      case 'range':
        return (
          <div className="space-y-4 min-w-[200px]">
            <div className="flex justify-between">
              <span className="text-sm text-slate-800 dark:text-white font-medium">{filter.label}</span>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {filter.format ? filter.format(value?.[0] || filter.min || 0) : value?.[0] || filter.min || 0} - 
                {filter.format ? filter.format(value?.[1] || filter.max || 100) : value?.[1] || filter.max || 100}
              </span>
            </div>
            <Slider
              defaultValue={[value?.[0] || filter.min || 0, value?.[1] || filter.max || 100]}
              min={filter.min || 0}
              max={filter.max || 100}
              step={filter.step || 1}
              onValueChange={(newValue) => handleFilterChange(filter.id, newValue)}
            />
            <div className="pt-2 flex justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setOpenFilter(null)}
              >
                Cerrar
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  handleFilterChange(filter.id, [filter.min || 0, filter.max || 100]);
                  setOpenFilter(null);
                }}
              >
                Aplicar
              </Button>
            </div>
          </div>
        );
        
      case 'select':
        return (
          <div className="space-y-4 min-w-[200px]">
            <Select
              value={value || ''}
              onValueChange={(newValue) => handleFilterChange(filter.id, newValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {filter.options?.map((option: FilterOption) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="pt-2 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setOpenFilter(null)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        );
        
      case 'multiselect':
        const selectedValues = value || [];
        return (
          <div className="space-y-4 min-w-[200px]">
            <div className="flex flex-wrap gap-2">
              {filter.options?.map((option: FilterOption) => (
                <Badge
                  key={option.value}
                  variant={selectedValues.includes(option.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    const newValues = selectedValues.includes(option.value)
                      ? selectedValues.filter((v: string) => v !== option.value)
                      : [...selectedValues, option.value];
                    handleFilterChange(filter.id, newValues);
                  }}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
            <div className="pt-2 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setOpenFilter(null)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        );
        
      case 'toggle':
        return (
          <div className="space-y-4 min-w-[200px]">
            <div className="flex items-center justify-between space-x-2">
              <span className="text-sm text-slate-800 dark:text-white font-medium">{filter.label}</span>
              <Switch
                checked={!!value}
                onCheckedChange={(checked) => handleFilterChange(filter.id, checked)}
              />
            </div>
            <div className="pt-2 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setOpenFilter(null)}
              >
                Cerrar
              </Button>
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
    <div 
      className={`w-full overflow-x-auto py-2 ${className}`}
      onClick={() => setOpenFilter(null)}
    >
      <div className="flex items-center space-x-2 min-w-max">
        {/* Ordenar filter (always first) */}
        {filters.find(f => f.id === 'sortBy' || f.id === 'orderBy') && 
          renderFilterDropdown(
            'sortBy', 
            'Ordenar', 
            renderFilterContent(filters.find(f => f.id === 'sortBy' || f.id === 'orderBy'))
          )
        }
        
        {/* Show all other filters */}
        {filters.filter(f => f.id !== 'sortBy' && f.id !== 'orderBy').map(filter => 
          renderFilterDropdown(filter.id, filter.label, renderFilterContent(filter))
        )}
        
        {/* Clear filters button (if any active) */}
        {filterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              clearAllFilters();
            }}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Limpiar filtros ({filterCount})
          </Button>
        )}
      </div>
    </div>
  );
} 