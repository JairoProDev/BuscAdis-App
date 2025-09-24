import React from 'react'

interface PublicationAttributesProps {
  attributes?: Record<string, unknown> | null
  className?: string
}

// Label map for common attribute keys across categories
const LABELS: Record<string, string> = {
  // Jobs
  salary: 'Salario',
  salary_min: 'Salario mínimo',
  salary_max: 'Salario máximo',
  contract_type: 'Tipo de contrato',
  experience: 'Experiencia',
  modality: 'Modalidad',
  schedule: 'Horario',
  // Real estate
  rooms: 'Habitaciones',
  bedrooms: 'Dormitorios',
  bathrooms: 'Baños',
  area_total: 'Área total (m²)',
  area_built: 'Área construida (m²)',
  pet_friendly: 'Acepta mascotas',
  furnished: 'Amoblado',
  parking_slots: 'Estacionamientos',
  // Vehicles
  brand: 'Marca',
  model: 'Modelo',
  year: 'Año',
  mileage: 'Kilometraje',
  fuel: 'Combustible',
  transmission: 'Transmisión',
  // Services/Products
  condition: 'Condición',
  warranty: 'Garantía',
  // Generic
  color: 'Color',
  size: 'Talla/Tamaño',
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.filter(v => v !== null && v !== undefined).map(v => String(v)).join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  return String(value)
}

export default function PublicationAttributes({ attributes, className = '' }: PublicationAttributesProps) {
  if (!attributes || Object.keys(attributes).length === 0) {
    return null
  }

  const entries = Object.entries(attributes)
    .filter(([, v]) => v !== null && v !== undefined && formatValue(v) !== '')

  if (entries.length === 0) return null

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${className}`}>
      {entries.map(([key, value]) => {
        const label = LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        return (
          <div key={key} className="bg-slate-50 dark:bg-slate-800/50 rounded-md p-3 border border-slate-100 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400">{label}:</div>
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{formatValue(value)}</div>
          </div>
        )
      })}
    </div>
  )
}
