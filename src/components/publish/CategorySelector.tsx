'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { CategoryConfig } from '@/types/publish'

interface CategorySelectorProps {
  onSelect: (category: CategoryConfig) => void
  selectedCategory?: CategoryConfig | null
}

const categories: CategoryConfig[] = [
  {
    id: 'empleos',
    name: 'Empleos',
    icon: '/icons/empleos.svg',
    requiredFields: ['title', 'description', 'location', 'salary'],
    optionalFields: ['experience', 'education', 'benefits'],
    features: [
      {
        id: 'job_type',
        name: 'Tipo de Empleo',
        type: 'select',
        options: ['Tiempo Completo', 'Medio Tiempo', 'Por Proyecto', 'Prácticas'],
        validation: { required: true }
      },
      {
        id: 'modality',
        name: 'Modalidad',
        type: 'select',
        options: ['Presencial', 'Remoto', 'Híbrido'],
        validation: { required: true }
      }
    ],
    mediaRequirements: {
      minImages: 0,
      maxImages: 10,
      allowVideo: true,
      allow3D: false,
      allowDocuments: true,
      maxFileSize: 5242880, // 5MB
      recommendedDimensions: {
        width: 1200,
        height: 630
      }
    },
    pricingOptions: {
      allowNegotiation: true,
      allowRange: true,
      allowPricePerUnit: false,
      requirePrice: true,
      supportedCurrencies: ['USD', 'EUR', 'COP']
    }
  },
  {
    id: 'inmuebles',
    name: 'Inmuebles',
    icon: '/icons/inmuebles.svg',
    requiredFields: ['title', 'description', 'location', 'price'],
    optionalFields: ['amenities', 'year_built', 'parking'],
    features: [
      {
        id: 'property_type',
        name: 'Tipo de Propiedad',
        type: 'select',
        options: ['Casa', 'Apartamento', 'Local', 'Oficina', 'Terreno'],
        validation: { required: true }
      },
      {
        id: 'operation',
        name: 'Operación',
        type: 'select',
        options: ['Venta', 'Alquiler', 'Alquiler Temporal'],
        validation: { required: true }
      }
    ],
    mediaRequirements: {
      minImages: 3,
      maxImages: 50,
      allowVideo: true,
      allow3D: true,
      allowDocuments: true,
      maxFileSize: 10485760, // 10MB
      recommendedDimensions: {
        width: 1920,
        height: 1080
      }
    },
    pricingOptions: {
      allowNegotiation: true,
      allowRange: false,
      allowPricePerUnit: true,
      requirePrice: true,
      supportedCurrencies: ['USD', 'EUR', 'COP']
    }
  },
  {
    id: 'vehiculos',
    name: 'Vehículos',
    icon: '/icons/vehiculos.svg',
    requiredFields: ['title', 'description', 'location', 'price'],
    optionalFields: ['color', 'mileage', 'features'],
    features: [
      {
        id: 'vehicle_type',
        name: 'Tipo de Vehículo',
        type: 'select',
        options: ['Carro', 'Moto', 'Camión', 'Barco', 'Otro'],
        validation: { required: true }
      },
      {
        id: 'condition',
        name: 'Condición',
        type: 'select',
        options: ['Nuevo', 'Usado - Como nuevo', 'Usado - Buen estado', 'Usado - Regular'],
        validation: { required: true }
      }
    ],
    mediaRequirements: {
      minImages: 5,
      maxImages: 30,
      allowVideo: true,
      allow3D: true,
      allowDocuments: true,
      maxFileSize: 8388608, // 8MB
      recommendedDimensions: {
        width: 1920,
        height: 1080
      }
    },
    pricingOptions: {
      allowNegotiation: true,
      allowRange: true,
      allowPricePerUnit: false,
      requirePrice: true,
      supportedCurrencies: ['USD', 'EUR', 'COP']
    }
  }
  // Más categorías...
]

export default function CategorySelector({ onSelect, selectedCategory }: CategorySelectorProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <motion.div
          key={category.id}
          className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all ${
            selectedCategory?.id === category.id
              ? 'ring-4 ring-primary-500 ring-offset-4 ring-offset-white'
              : 'hover:shadow-2xl'
          }`}
          onHoverStart={() => setHoveredCategory(category.id)}
          onHoverEnd={() => setHoveredCategory(null)}
          onClick={() => onSelect(category)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative aspect-[4/3] bg-gradient-to-br from-primary-900 to-primary-800">
            <Image
              src={category.icon}
              alt={category.name}
              fill
              className="object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 to-transparent" />
            
            <div className="absolute inset-x-0 bottom-0 p-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                {category.name}
              </h3>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: hoveredCategory === category.id ? 'auto' : 0,
                  opacity: hoveredCategory === category.id ? 1 : 0
                }}
                className="overflow-hidden"
              >
                <ul className="space-y-2 text-primary-200">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-2" />
                    Hasta {category.mediaRequirements.maxImages} fotos
                  </li>
                  {category.mediaRequirements.allowVideo && (
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mr-2" />
                      Soporte para videos
                    </li>
                  )}
                  {category.mediaRequirements.allow3D && (
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mr-2" />
                      Modelos 3D permitidos
                    </li>
                  )}
                </ul>
              </motion.div>
            </div>
          </div>

          {selectedCategory?.id === category.id && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 right-4 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  )
} 