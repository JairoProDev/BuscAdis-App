'use client'

import { motion } from 'framer-motion'
import { AdisoType } from '@/types/marketplace'

interface CategoryFiltersProps {
  selectedType: AdisoType | null
  onSelectType: (type: AdisoType | null) => void
}

const ADISO_TYPES: { type: AdisoType; icon: string }[] = [
  { type: 'Empleos', icon: '💼' },
  { type: 'Inmuebles', icon: '🏠' },
  { type: 'Vehículos', icon: '🚗' },
  { type: 'Servicios', icon: '🛠' },
  { type: 'Productos', icon: '🛍' },
  { type: 'Eventos', icon: '🎉' },
  { type: 'Educación', icon: '📚' },
  { type: 'Turismo', icon: '✈️' },
  { type: 'Mascotas', icon: '🐾' }
]

export default function CategoryFilters({ selectedType, onSelectType }: CategoryFiltersProps) {
  return (
    <div className="mt-4 -mb-2">
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-4">
        <motion.button
          onClick={() => onSelectType(null)}
          className={`flex-none px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedType === null
              ? 'bg-white text-primary-900'
              : 'bg-primary-800 text-white hover:bg-primary-700'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🌟 Todos
        </motion.button>
        
        {ADISO_TYPES.map(({ type, icon }) => (
          <motion.button
            key={type}
            onClick={() => onSelectType(type)}
            className={`flex-none px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedType === type
                ? 'bg-white text-primary-900'
                : 'bg-primary-800 text-white hover:bg-primary-700'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {icon} {type}
          </motion.button>
        ))}
      </div>
    </div>
  )
} 