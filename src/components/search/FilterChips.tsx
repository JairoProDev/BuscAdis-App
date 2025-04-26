import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/Badge';
import { filtersByCategory } from '@/data/filterConfig';

interface FilterChipsProps {
  category: string;
  activeFilters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  className?: string;
}

export default function FilterChips({
  category,
  activeFilters,
  onFilterChange,
  className = '',
}: FilterChipsProps) {
  // Estado para el filtro actualmente abierto
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<any[]>([]);
  
  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openFilterId && !(event.target as Element).closest('.filter-dropdown')) {
        setOpenFilterId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openFilterId]);

  // Obtener filtros para la categoría actual
  useEffect(() => {
    if (!category || !filtersByCategory[category]) {
      setFilterOptions([]);
      return;
    }
    
    const allFilters = [];
    // Obtener todos los filtros de todas las secciones para esta categoría
    for (const section of filtersByCategory[category].sections) {
      for (const filter of section.filters) {
        allFilters.push(filter);
      }
    }
    setFilterOptions(allFilters);
  }, [category]);

  // Manejar cambio de filtro
  const handleFilterChange = (filterId: string, value: any) => {
    const newFilters = { ...activeFilters };
    
    // Remover valores vacíos
    if (value === '' || value === null || value === undefined || 
        (Array.isArray(value) && value.length === 0)) {
      delete newFilters[filterId];
    } else {
      newFilters[filterId] = value;
    }
    
    onFilterChange(newFilters);
  };

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    const newFilters = {};
    onFilterChange(newFilters);
  };

  // Renderizar contenido del filtro según su tipo
  const renderFilterContent = (filter: any) => {
    const value = activeFilters[filter.id];
    
    switch (filter.type) {
      case 'range':
        return (
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-lg min-w-[250px]">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-300 font-medium">{filter.label}</span>
              <span className="text-sm text-slate-400">
                {filter.format ? filter.format(value?.[0] || filter.min) : value?.[0] || filter.min} - 
                {filter.format ? filter.format(value?.[1] || filter.max) : value?.[1] || filter.max}
              </span>
            </div>
            <Slider
              defaultValue={[value?.[0] || filter.min, value?.[1] || filter.max]}
              min={filter.min}
              max={filter.max}
              step={filter.step || 1}
              onValueChange={(newValue) => handleFilterChange(filter.id, newValue)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setOpenFilterId(null)}
              >
                Cerrar
              </Button>
              <Button 
                size="sm"
                onClick={() => {
                  handleFilterChange(filter.id, [filter.min, filter.max]);
                  setOpenFilterId(null);
                }}
              >
                Aplicar
              </Button>
            </div>
          </div>
        );
        
      case 'select':
        return (
          <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 shadow-lg min-w-[200px]">
            <div className="flex flex-col gap-1">
              {[{value: "", label: "Todos"}].concat(filter.options || []).map((option) => (
                <div 
                  key={option.value} 
                  className={`px-3 py-1.5 rounded cursor-pointer flex items-center justify-between ${
                    value === option.value ? 'bg-teal-600 text-white' : 'hover:bg-slate-700 text-slate-300'
                  }`}
                  onClick={() => {
                    handleFilterChange(filter.id, option.value);
                    setOpenFilterId(null);
                  }}
                >
                  <span>{option.label}</span>
                  {option.count !== undefined && (
                    <span className="text-xs bg-slate-700 px-1.5 py-0.5 rounded-full">
                      {option.count}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'multiselect':
        const selectedValues = value || [];
        return (
          <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 shadow-lg min-w-[200px] max-h-[300px] overflow-y-auto">
            <div className="flex flex-col gap-1">
              {filter.options?.map((option: any) => (
                <div 
                  key={option.value} 
                  className={`px-3 py-1.5 rounded cursor-pointer flex items-center justify-between ${
                    selectedValues.includes(option.value) ? 'bg-teal-600 text-white' : 'hover:bg-slate-700 text-slate-300'
                  }`}
                  onClick={() => {
                    const newValues = selectedValues.includes(option.value)
                      ? selectedValues.filter((v: string) => v !== option.value)
                      : [...selectedValues, option.value];
                    handleFilterChange(filter.id, newValues.length ? newValues : null);
                  }}
                >
                  <span>{option.label}</span>
                  {option.count !== undefined && (
                    <span className="text-xs bg-slate-700 px-1.5 py-0.5 rounded-full">
                      {option.count}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-3">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setOpenFilterId(null)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        );
        
      case 'location':
        // Filtro especializado para lugares (similar a Computrabajo)
        return (
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-lg w-[350px]">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-300">Modalidad</h4>
                {filter.modes?.map((mode: any) => (
                  <div 
                    key={mode.value} 
                    className="flex items-center gap-2"
                  >
                    <Switch
                      checked={value?.modes?.includes(mode.value) || false}
                      onCheckedChange={(checked) => {
                        const currentModes = value?.modes || [];
                        const newModes = checked
                          ? [...currentModes, mode.value]
                          : currentModes.filter((m: string) => m !== mode.value);
                        
                        handleFilterChange(filter.id, {
                          ...value,
                          modes: newModes
                        });
                      }}
                    />
                    <span className="text-sm text-slate-300">{mode.label}</span>
                    {mode.count && (
                      <span className="text-xs bg-slate-700 px-1.5 py-0.5 rounded-full">
                        {mode.count}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-300">Lugares</h4>
                <div className="max-h-[200px] overflow-y-auto space-y-1">
                  {filter.locations?.map((location: any) => (
                    <div 
                      key={location.value} 
                      className={`px-3 py-1.5 rounded cursor-pointer flex items-center justify-between ${
                        value?.locations?.includes(location.value) ? 'bg-teal-600 text-white' : 'hover:bg-slate-700 text-slate-300'
                      }`}
                      onClick={() => {
                        const currentLocations = value?.locations || [];
                        const newLocations = currentLocations.includes(location.value)
                          ? currentLocations.filter((l: string) => l !== location.value)
                          : [...currentLocations, location.value];
                        
                        handleFilterChange(filter.id, {
                          ...value,
                          locations: newLocations
                        });
                      }}
                    >
                      <span>{location.label}</span>
                      {location.count && (
                        <span className="text-xs bg-slate-700 px-1.5 py-0.5 rounded-full">
                          {location.count}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setOpenFilterId(null)}
              >
                Cerrar
              </Button>
              <Button 
                size="sm"
                onClick={() => setOpenFilterId(null)}
              >
                Aplicar
              </Button>
            </div>
          </div>
        );
        
      case 'toggle':
        return (
          <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 shadow-lg min-w-[200px]">
            <div className="flex items-center justify-between space-x-2">
              <span className="text-sm text-slate-300 font-medium">{filter.label}</span>
              <Switch
                checked={!!value}
                onCheckedChange={(checked) => {
                  handleFilterChange(filter.id, checked);
                  setOpenFilterId(null);
                }}
              />
            </div>
            <div className="flex justify-end mt-3">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setOpenFilterId(null)}
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

  // Si no hay categoría o filtros, no mostrar nada
  if (!category || !filtersByCategory[category] || filterOptions.length === 0) {
    // Si es la categoría empleos pero no hay configuración, mostrar un conjunto de filtros por defecto
    if (category === 'empleos') {
      return (
        <div className={`w-full ${className}`}>
          {/* Barra horizontal de chips de filtros específicos para empleos */}
          <div className="flex items-center space-x-2 overflow-x-auto py-2 px-0.5">
            {/* Filtro: Salario */}
            <div className="relative filter-dropdown">
              <button
                className={`flex items-center gap-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap bg-slate-800 text-white hover:bg-slate-700`}
                onClick={() => {}}
              >
                <span>Salario</span>
                <ChevronDownIcon className="h-4 w-4 transition-transform" />
              </button>
            </div>
            
            {/* Filtro: Tipo de empleo */}
            <div className="relative filter-dropdown">
              <button
                className={`flex items-center gap-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap bg-slate-800 text-white hover:bg-slate-700`}
                onClick={() => {}}
              >
                <span>Tipo de empleo</span>
                <ChevronDownIcon className="h-4 w-4 transition-transform" />
              </button>
            </div>
            
            {/* Filtro: Modalidad */}
            <div className="relative filter-dropdown">
              <button
                className={`flex items-center gap-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap bg-slate-800 text-white hover:bg-slate-700`}
                onClick={() => {}}
              >
                <span>Modalidad</span>
                <ChevronDownIcon className="h-4 w-4 transition-transform" />
              </button>
            </div>
            
            {/* Filtro: Experiencia */}
            <div className="relative filter-dropdown">
              <button
                className={`flex items-center gap-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap bg-slate-800 text-white hover:bg-slate-700`}
                onClick={() => {}}
              >
                <span>Experiencia</span>
                <ChevronDownIcon className="h-4 w-4 transition-transform" />
              </button>
            </div>
            
            {/* Filtro: Educación */}
            <div className="relative filter-dropdown">
              <button
                className={`flex items-center gap-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap bg-slate-800 text-white hover:bg-slate-700`}
                onClick={() => {}}
              >
                <span>Educación</span>
                <ChevronDownIcon className="h-4 w-4 transition-transform" />
              </button>
            </div>
            
            {/* Filtro: Habilidades */}
            <div className="relative filter-dropdown">
              <button
                className={`flex items-center gap-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap bg-slate-800 text-white hover:bg-slate-700`}
                onClick={() => {}}
              >
                <span>Habilidades</span>
                <ChevronDownIcon className="h-4 w-4 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Barra horizontal de chips de filtros */}
      <div className="flex items-center space-x-2 overflow-x-auto py-2 px-0.5">
        {filterOptions.map((filter) => {
          const isActive = activeFilters[filter.id] !== undefined;
          const isOpen = openFilterId === filter.id;
          
          return (
            <div className="relative filter-dropdown" key={filter.id}>
              <button
                className={`flex items-center gap-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive 
                    ? 'bg-teal-500 text-white' 
                    : isOpen
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
                onClick={() => setOpenFilterId(isOpen ? null : filter.id)}
              >
                <span>{filter.label}</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Menú desplegable para este filtro */}
              {isOpen && (
                <div className="absolute z-40 left-0 mt-1 filter-content">
                  {renderFilterContent(filter)}
                </div>
              )}
            </div>
          );
        })}
        
        {/* Botón de limpiar filtros */}
        {Object.keys(activeFilters).length > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-teal-400 hover:text-teal-300 bg-slate-800 border-slate-700"
            onClick={clearAllFilters}
          >
            Limpiar filtros ({Object.keys(activeFilters).length})
          </Button>
        )}
      </div>

      {/* Mostrar chips de filtros activos */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {Object.entries(activeFilters).map(([key, value]) => {
            const filter = filterOptions.find(f => f.id === key);
            if (!filter) return null;
            
            // Determinar valor a mostrar
            let displayValue = value;
            if (filter.type === 'select') {
              const option = filter.options?.find((o: any) => o.value === value);
              displayValue = option ? option.label : value;
            } else if (filter.type === 'multiselect' && Array.isArray(value)) {
              displayValue = `${value.length} seleccionados`;
            } else if (filter.type === 'range' && Array.isArray(value)) {
              displayValue = `${filter.format ? filter.format(value[0]) : value[0]} - ${filter.format ? filter.format(value[1]) : value[1]}`;
            } else if (filter.type === 'location' && typeof value === 'object') {
              const modesCount = value.modes?.length || 0;
              const locationsCount = value.locations?.length || 0;
              const parts = [];
              if (modesCount > 0) parts.push(`${modesCount} modalidad${modesCount > 1 ? 'es' : ''}`);
              if (locationsCount > 0) parts.push(`${locationsCount} lugar${locationsCount > 1 ? 'es' : ''}`);
              displayValue = parts.length > 0 ? parts.join(', ') : 'Seleccionado';
            } else if (filter.type === 'toggle') {
              displayValue = value ? 'Sí' : 'No';
            }
            
            return (
              <Badge 
                key={key}
                variant="outline"
                className="bg-slate-800 border-teal-600/30 text-white flex items-center gap-1 py-1.5 px-3"
              >
                <span className="font-medium">{filter.label}:</span> 
                <span>{displayValue}</span>
                <button
                  onClick={() => handleFilterChange(key, null)}
                  className="ml-2 hover:text-red-400"
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