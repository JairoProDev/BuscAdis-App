'use client'

import React, { useState, useCallback } from 'react'
import { LocationData } from '@/contexts/PublicationContext'
import { MapPinIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { Logger } from '@/services/logging.service'

interface LocationSelectorProps {
  value?: LocationData
  onChange: (location: LocationData) => void
  className?: string
}

const countries = [
  { code: 'PE', name: 'Perú' },
  { code: 'CO', name: 'Colombia' },
  { code: 'MX', name: 'México' },
  { code: 'CL', name: 'Chile' },
  { code: 'AR', name: 'Argentina' },
  { code: 'ES', name: 'España' }
]

const cities = {
  'PE': ['Lima', 'Arequipa', 'Trujillo', 'Cusco', 'Piura', 'Chiclayo', 'Iquitos', 'Huancayo'],
  'CO': ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'],
  'MX': ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana'],
  'CL': ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta'],
  'AR': ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata'],
  'ES': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza']
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  value,
  onChange,
  className = ''
}) => {
  const [location, setLocation] = useState<LocationData>(value || {
    city: '',
    country: 'PE'
  })

  const [useMap, setUseMap] = useState(false)

  const handleCountryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value
    const updatedLocation = {
      ...location,
      country: newCountry,
      city: '' // Reset city when country changes
    }
    setLocation(updatedLocation)
    onChange(updatedLocation)
    Logger.debug('Country changed', { country: newCountry })
  }, [location, onChange])

  const handleCityChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value
    const updatedLocation = {
      ...location,
      city: newCity
    }
    setLocation(updatedLocation)
    onChange(updatedLocation)
    Logger.debug('City changed', { city: newCity })
  }, [location, onChange])

  const handleCustomCityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newCity = e.target.value
    const updatedLocation = {
      ...location,
      city: newCity
    }
    setLocation(updatedLocation)
    onChange(updatedLocation)
  }, [location, onChange])

  const handleToggleMap = useCallback(() => {
    setUseMap(!useMap)
    Logger.debug('Map toggled', { useMap: !useMap })
  }, [useMap])

  const availableCities = location.country ? (cities[location.country as keyof typeof cities] || []) : []

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Ubicación de tu anuncio
        </h3>
        <button
          type="button"
          onClick={handleToggleMap}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {useMap ? (
            <>
              <GlobeAltIcon className="h-5 w-5 mr-1 text-gray-400" />
              Lista
            </>
          ) : (
            <>
              <MapPinIcon className="h-5 w-5 mr-1 text-gray-400" />
              Mapa
            </>
          )}
        </button>
      </div>

      {!useMap ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              País
            </label>
            <select
              id="country"
              name="country"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={location.country}
              onChange={handleCountryChange}
            >
              <option value="">Selecciona un país</option>
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {location.country && (
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                Ciudad
              </label>
              <select
                id="city"
                name="city"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={availableCities.includes(location.city) ? location.city : ''}
                onChange={handleCityChange}
              >
                <option value="">Selecciona una ciudad</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
                <option value="other">Otra ciudad...</option>
              </select>
            </div>
          )}

          {location.city === 'other' && (
            <div>
              <label htmlFor="customCity" className="block text-sm font-medium text-gray-700">
                Nombre de la ciudad
              </label>
              <input
                type="text"
                id="customCity"
                name="customCity"
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                placeholder="Nombre de la ciudad"
                onChange={handleCustomCityChange}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center">
          <div className="text-center p-6">
            <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Mapa no disponible</h3>
            <p className="mt-1 text-sm text-gray-500">
              La funcionalidad de mapa está en desarrollo.
            </p>
          </div>
        </div>
      )}

      {location.city && location.country && (
        <div className="bg-green-50 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <MapPinIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Ubicación seleccionada</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  {location.city}, {countries.find(c => c.code === location.country)?.name || location.country}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LocationSelector 