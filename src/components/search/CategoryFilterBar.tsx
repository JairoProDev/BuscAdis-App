'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { FilterOption, FilterSelectOption, FilterValue } from '@/types/filters';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/switch';
import { filtersByCategory } from '@/data/filterConfig';
import { cn } from '@/lib/utils';

interface CategoryFilterBarProps {
  selectedCategory: string;
  activeFilters: Record<string, FilterValue>;
  onFilterChange: (filters: Record<string, FilterValue>) => void;
  className?: string;
}

export default function CategoryFilterBar({
  selectedCategory,
  activeFilters,
  onFilterChange,
  className = '',
}: CategoryFilterBarProps) {
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [temporaryFilters, setTemporaryFilters] = useState<Record<string, FilterValue>>(activeFilters);

  // Reset temporary filters when active filters change
  useEffect(() => {
    setTemporaryFilters(activeFilters);
  }, [activeFilters]);

  // Debug logging to track component lifecycle
  useEffect(() => {
    console.log('CategoryFilterBar mounted/updated for category:', selectedCategory);
    return () => {
      console.log('CategoryFilterBar unmounting for category:', selectedCategory);
    };
  }, [selectedCategory]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openFilter && !(event.target as Element).closest('[data-filter-dropdown]')) {
        setOpenFilter(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openFilter]);

  // Get available filters for the current category
  const getAvailableFilters = (): FilterOption[] => {
    if (!selectedCategory || !filtersByCategory[selectedCategory]) return [];
    
    // Extract all filters from all sections for this category
    const filters: FilterOption[] = [];
    for (const section of filtersByCategory[selectedCategory].sections) {
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
    setOpenFilter(null);
  };

  // Handle temporary filter change (for dropdowns)
  const handleTempFilterChange = (filterId: string, value: unknown) => {
    setTemporaryFilters(prev => ({
      ...prev,
      [filterId]: value as FilterValue
    }));
  };

  // Apply temporary filter
  const applyFilter = (filterId: string) => {
    handleFilterChange(filterId, temporaryFilters[filterId]);
  };

  // Count active filters
  const getFilterCount = (): number => {
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

  // Check if filter has active value
  const isFilterActive = (filterId: string): boolean => {
    const value = activeFilters[filterId];
    if (!value) return false;
    
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    
    return value !== '' && value !== null && value !== undefined;
  };

  // Get display value for filter
  const getDisplayValue = (filter: FilterOption, value: FilterValue): string => {
    if (!value) return filter.label;
    
    if (filter.type === 'range' && Array.isArray(value)) {
      return `${filter.format ? filter.format(Number(value[0])) : value[0]} - ${filter.format ? filter.format(Number(value[1])) : value[1]}`;
    }
    
    if (filter.type === 'select' && value) {
      const option = filter.options?.find((o: FilterSelectOption) => o.value === value);
      return option ? option.label : String(value);
    }
    
    if (filter.type === 'multiselect' && Array.isArray(value)) {
      if (value.length === 1) {
        const option = filter.options?.find((o: FilterSelectOption) => o.value === value[0]);
        return option ? option.label : String(value[0]);
      }
      return `${value.length} seleccionados`;
    }
    
    if (filter.type === 'toggle' && value === true) {
      return filter.label;
    }
    
    return filter.label;
  };

  // Render filter content based on type
  const renderFilterContent = (filter: FilterOption): React.ReactNode => {
    const value = temporaryFilters[filter.id];
    
    switch (filter.type) {
      case 'range': {
        const rangeValue = Array.isArray(value) ? value : [filter.min || 0, filter.max || 100];
        return (
          <div className="space-y-4 w-full p-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{filter.label}</span>
              <span className="font-medium">
                {filter.format ? filter.format(Number(rangeValue[0])) : rangeValue[0]} - 
                {filter.format ? filter.format(Number(rangeValue[1])) : rangeValue[1]}
              </span>
            </div>
            
            <Slider
              value={rangeValue.map(Number)}
              min={filter.min || 0}
              max={filter.max || 100}
              step={filter.step || 1}
              onValueChange={(newValue) => handleTempFilterChange(filter.id, newValue)}
              className="w-full"
            />
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenFilter(null)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={() => applyFilter(filter.id)}
              >
                Aplicar
              </Button>
            </div>
          </div>
        );
      }
        
      case 'select':
        return (
          <div className="space-y-3 w-full p-4">
            <Select
              value={String(value) || ''}
              onValueChange={(newValue) => handleTempFilterChange(filter.id, newValue)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`Seleccionar ${filter.label.toLowerCase()}`} />
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
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenFilter(null)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={() => applyFilter(filter.id)}
              >
                Aplicar
              </Button>
            </div>
          </div>
        );
        
      case 'multiselect': {
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-4 w-full p-4">
            <div className="text-sm font-medium text-gray-700">{filter.label}</div>
            <div className="flex flex-wrap gap-2">
              {filter.options?.map((option: FilterSelectOption) => (
                <Badge
                  key={option.value}
                  variant={selectedValues.includes(option.value) ? "default" : "outline"}
                  className="cursor-pointer text-xs py-1 px-2"
                  onClick={() => {
                    const newValues = selectedValues.includes(option.value)
                      ? selectedValues.filter((v: string | number) => v !== option.value)
                      : [...selectedValues, option.value];
                    handleTempFilterChange(filter.id, newValues);
                  }}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenFilter(null)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={() => applyFilter(filter.id)}
              >
                Aplicar
              </Button>
            </div>
          </div>
        );
      }
        
      case 'toggle':
        return (
          <div className="space-y-4 w-full p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{filter.label}</span>
              <Switch
                checked={!!value}
                onCheckedChange={(checked) => handleTempFilterChange(filter.id, checked)}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenFilter(null)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={() => applyFilter(filter.id)}
              >
                Aplicar
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Render a single filter dropdown
  const renderFilterDropdown = (filter: FilterOption) => {
    const isActive = openFilter === filter.id;
    const hasActiveValue = isFilterActive(filter.id);
    const displayValue = getDisplayValue(filter, activeFilters[filter.id]);
    
    return (
      <div key={filter.id} className="relative flex-shrink-0" data-filter-dropdown>
        <Button
          variant={hasActiveValue ? "default" : "outline"}
          size="sm"
          className={cn(
            "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
            hasActiveValue && "bg-teal-500 hover:bg-teal-600 text-white",
            !hasActiveValue && "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
          )}
          onClick={() => setOpenFilter(isActive ? null : filter.id)}
        >
          <span className="truncate max-w-[120px]">{displayValue}</span>
          <ChevronDownIcon className={`h-4 w-4 transition-transform flex-shrink-0 ${isActive ? 'rotate-180' : ''}`} />
        </Button>
        
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 top-full left-0 mt-1 min-w-[280px] bg-white rounded-lg shadow-xl border border-gray-200"
              data-filter-dropdown
            >
              {renderFilterContent(filter)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const filters = getAvailableFilters();
  const filterCount = getFilterCount();

  // If no filters available or no category selected, don't render anything
  if (filters.length === 0 || !selectedCategory) {
    return null;
  }

  return (
    <div className={cn("w-full bg-white border-t border-gray-200 py-4", className)}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Filter Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-teal-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Filtros de {filtersByCategory[selectedCategory]?.title || selectedCategory}
            </h3>
            {filterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filterCount} aplicados
              </Badge>
            )}
          </div>
          
          {filterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Limpiar filtros
            </Button>
          )}
        </div>
        
        {/* Filter Bar - Single row with horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pb-2">
          {filters.map(filter => renderFilterDropdown(filter))}
        </div>
        
        {/* Active Filters Display */}
        {filterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 font-medium">Filtros activos:</span>
              {Object.entries(activeFilters)
                .filter(([key]) => key !== 'category' && key !== 'subcategory' && key !== 'subsubcategory')
                .map(([key, value]) => {
                  const filter = filters.find(f => f.id === key);
                  if (!filter) return null;
                  
                  const displayValue = getDisplayValue(filter, value);
                  
                  return (
                    <Badge
                      key={key}
                      variant="secondary"
                      className="flex items-center gap-1 bg-teal-100 text-teal-800"
                    >
                      <span className="font-medium">{displayValue}</span>
                      <button
                        onClick={() => handleFilterChange(key, null)}
                        className="ml-1 hover:bg-teal-200 rounded-full p-0.5"
                        aria-label={`Eliminar filtro ${filter.label}`}
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
