import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { FilterOption, FilterValue } from '@/types/filters';
import { Badge } from '@/components/ui/Badge';

// Tipos de filtros
interface FilterChipsProps {
  activeFilters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  className?: string;
}

export default function FilterChips({
  activeFilters,
  onFilterChange,
  className = '',
}: FilterChipsProps) {
  // Estado para el filtro actualmente abierto
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  
  // Opciones predefinidas de filtros para el ejemplo
  const filterOptions = [
    { id: 'salario', label: 'Salario', type: 'range', min: 0, max: 10000, step: 100, format: (val: number) => `${val}€` },
    { id: 'tipoEmpleo', label: 'Tipo de empleo', type: 'select', options: [
      { value: 'fulltime', label: 'Tiempo completo' },
      { value: 'parttime', label: 'Tiempo parcial' },
      { value: 'freelance', label: 'Freelance' },
      { value: 'contract', label: 'Contrato' }
    ]},
    { id: 'modalidad', label: 'Modalidad', type: 'select', options: [
      { value: 'presencial', label: 'Presencial' },
      { value: 'remoto', label: 'Remoto' },
      { value: 'hibrido', label: 'Híbrido' }
    ]},
    { id: 'experiencia', label: 'Experiencia', type: 'select', options: [
      { value: 'junior', label: 'Junior' },
      { value: 'mid', label: 'Mid' },
      { value: 'senior', label: 'Senior' }
    ]},
    { id: 'educacion', label: 'Educación', type: 'select', options: [
      { value: 'secundaria', label: 'Secundaria' },
      { value: 'universidad', label: 'Universidad' },
      { value: 'master', label: 'Máster' },
      { value: 'doctorado', label: 'Doctorado' }
    ]},
    { id: 'habilidades', label: 'Habilidades', type: 'multiselect', options: [
      { value: 'javascript', label: 'JavaScript' },
      { value: 'react', label: 'React' },
      { value: 'nodejs', label: 'Node.js' },
      { value: 'python', label: 'Python' },
      { value: 'java', label: 'Java' }
    ]},
  ];

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
    setOpenFilterId(null); // Cerrar el diálogo después de aplicar
  };

  // Renderizar contenido del filtro según su tipo
  const renderFilterContent = (filter: typeof filterOptions[0]) => {
    const value = activeFilters[filter.id];
    
    switch (filter.type) {
      case 'range':
        return (
          <div className="space-y-4 p-4">
            <div className="flex justify-between">
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
              step={filter.step}
              onValueChange={(newValue) => handleFilterChange(filter.id, newValue)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setOpenFilterId(null)}
              >
                Cancelar
              </Button>
              <Button 
                size="sm"
                onClick={() => {
                  handleFilterChange(filter.id, [filter.min, filter.max]);
                }}
              >
                Aplicar
              </Button>
            </div>
          </div>
        );
        
      case 'select':
        return (
          <div className="space-y-4 p-4">
            <Select
              value={value || ''}
              onValueChange={(newValue) => handleFilterChange(filter.id, newValue)}
            >
              <SelectTrigger className="border-slate-700 bg-slate-800 text-white">
                <SelectValue placeholder={`Selecciona ${filter.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {filter.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setOpenFilterId(null)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        );
        
      case 'multiselect':
        const selectedValues = value || [];
        return (
          <div className="space-y-4 p-4">
            <div className="flex flex-wrap gap-2">
              {filter.options?.map((option) => (
                <Badge
                  key={option.value}
                  variant={selectedValues.includes(option.value) ? "default" : "outline"}
                  className="cursor-pointer text-sm py-1 px-3"
                  onClick={() => {
                    const newValues = selectedValues.includes(option.value)
                      ? selectedValues.filter((v: string) => v !== option.value)
                      : [...selectedValues, option.value];
                    handleFilterChange(filter.id, newValues.length ? newValues : null);
                  }}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm"
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

  return (
    <div className={`w-full ${className}`}>
      {/* Barra horizontal de chips de filtros */}
      <div className="flex items-center space-x-2 overflow-x-auto py-2 px-0.5">
        {filterOptions.map((filter) => {
          const isActive = activeFilters[filter.id] !== undefined;
          
          return (
            <React.Fragment key={filter.id}>
              <button
                className={`flex items-center gap-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive 
                    ? 'bg-teal-500 text-white' 
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
                onClick={() => setOpenFilterId(filter.id)}
              >
                <span>{filter.label}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              
              {/* Diálogo para este filtro */}
              <Dialog open={openFilterId === filter.id} onOpenChange={(open) => !open && setOpenFilterId(null)}>
                <DialogContent className="bg-slate-900 text-white border-slate-700">
                  <DialogHeader>
                    <DialogTitle>Filtrar por {filter.label}</DialogTitle>
                  </DialogHeader>
                  {renderFilterContent(filter)}
                </DialogContent>
              </Dialog>
            </React.Fragment>
          );
        })}
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
              const option = filter.options?.find(o => o.value === value);
              displayValue = option ? option.label : value;
            } else if (filter.type === 'multiselect' && Array.isArray(value)) {
              displayValue = `${value.length} seleccionados`;
            } else if (filter.type === 'range' && Array.isArray(value)) {
              displayValue = `${filter.format ? filter.format(value[0]) : value[0]} - ${filter.format ? filter.format(value[1]) : value[1]}`;
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
                  ✕
                </button>
              </Badge>
            );
          })}
          
          {Object.keys(activeFilters).length > 1 && (
            <Button 
              variant="link" 
              size="sm" 
              className="text-teal-400 hover:text-teal-300"
              onClick={() => onFilterChange({})}
            >
              Limpiar todos
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 