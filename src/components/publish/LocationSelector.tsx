'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Location } from '@/types/publish'
import { 
  MapPinIcon,
  MagnifyingGlassIcon,
  MapIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface LocationSelectorProps {
  value: Location
  onChange: (location: Location) => void
  className?: string
}

export default function LocationSelector({
  value,
  onChange,
  className = ''
}: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)

  // Simular búsqueda de ubicaciones
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSuggestions([])
      return
    }

    const searchTimeout = setTimeout(async () => {
      setIsLoading(true)
      // Aquí implementaremos la búsqueda real con un servicio de geocodificación
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuggestions([
        {
          address: 'Calle Principal 123',
          city: 'Bogotá',
          state: 'Bogotá D.C.',
          country: 'Colombia',
          postalCode: '110111',
          coordinates: {
            latitude: 4.710989,
            longitude: -74.072092
          }
        },
        {
          address: 'Avenida Central 456',
          city: 'Medellín',
          state: 'Antioquia',
          country: 'Colombia',
          postalCode: '050022',
          coordinates: {
            latitude: 6.244203,
            longitude: -75.581212
          }
        }
      ])
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(searchTimeout)
  }, [searchQuery])

  const handleSelectLocation = (location: Location) => {
    onChange(location)
    setSearchQuery('')
    setSuggestions([])
  }

  const handleUseCurrentLocation = () => {
    setIsLoading(true)
    // Aquí implementaremos la geolocalización real
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Aquí implementaremos la geocodificación inversa
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const location: Location = {
          address: 'Tu ubicación actual',
          city: 'Ciudad Actual',
          state: 'Estado Actual',
          country: 'País Actual',
          postalCode: '000000',
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        }
        
        onChange(location)
        setIsLoading(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        setIsLoading(false)
      }
    )
  }

  return (
    <div className={className}>
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar ubicación..."
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <MagnifyingGlassIcon className="w-5 h-5 text-primary-500" />
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {(suggestions.length > 0 || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-lg overflow-hidden z-10"
          >
            {isLoading ? (
              <div className="p-4 text-center text-primary-600">
                <ArrowPathIcon className="w-5 h-5 animate-spin mx-auto mb-2" />
                Buscando ubicaciones...
              </div>
            ) : (
              suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectLocation(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors"
                >
                  <div className="font-medium text-primary-900">
                    {suggestion.address}
                  </div>
                  <div className="text-sm text-primary-600">
                    {suggestion.city}, {suggestion.state}, {suggestion.country}
                  </div>
                </button>
              ))
            )}
          </motion.div>
        )}
      </div>

      {/* Current Location Button */}
      <button
        onClick={handleUseCurrentLocation}
        disabled={isLoading}
        className="w-full flex items-center justify-center px-4 py-3 bg-primary-100 text-primary-700 rounded-xl hover:bg-primary-200 transition-colors mb-4"
      >
        <MapPinIcon className="w-5 h-5 mr-2" />
        Usar mi ubicación actual
      </button>

      {/* Selected Location */}
      {value && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border-2 border-primary-100 p-4"
        >
          <div className="flex items-start">
            <MapPinIcon className="w-5 h-5 text-primary-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <div className="font-medium text-primary-900 mb-1">
                {value.address}
              </div>
              <div className="text-sm text-primary-600">
                {value.city}, {value.state}
              </div>
              <div className="text-sm text-primary-600">
                {value.country} {value.postalCode}
              </div>
            </div>
          </div>

          {/* Map Toggle */}
          <button
            onClick={() => setShowMap(!showMap)}
            className="flex items-center text-primary-600 hover:text-primary-700 mt-4"
          >
            <MapIcon className="w-5 h-5 mr-2" />
            {showMap ? 'Ocultar mapa' : 'Ver en mapa'}
          </button>

          {/* Map View */}
          {showMap && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              className="mt-4 overflow-hidden"
            >
              <div className="aspect-[16/9] bg-primary-100 rounded-lg">
                {/* Aquí implementaremos el mapa real */}
                <div className="w-full h-full flex items-center justify-center text-primary-600">
                  Mapa de la ubicación
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
} 