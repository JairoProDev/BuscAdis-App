'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { MapPinIcon, MapIcon } from '@heroicons/react/24/outline'
import { Logger } from '@/services/logging.service'
import DynamicField from './DynamicField'

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

interface Location {
  city: string
  country: string
  coordinates?: {
    lat: number
    lng: number
  }
}

interface LocationSelectorProps {
  value: Location
  onChange: (location: Location) => void
  apiKey?: string
}

export default function LocationSelector({
  value,
  onChange,
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
}: LocationSelectorProps) {
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [autocomplete, setAutocomplete] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const loadGoogleMapsScript = useCallback(() => {
    if (!apiKey) {
      setError('API key no configurada')
      Logger.error('Google Maps API key no configurada')
      return
    }

    if (window.google) {
      initializeMap()
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      Logger.info('Google Maps cargado exitosamente')
      initializeMap()
    }
    script.onerror = () => {
      setError('Error al cargar el mapa')
      Logger.error('Error al cargar Google Maps')
    }
    document.head.appendChild(script)
  }, [apiKey])

  useEffect(() => {
    loadGoogleMapsScript()
  }, [loadGoogleMapsScript])

  const initializeMap = () => {
    try {
      // Coordenadas por defecto (Perú)
      const defaultLocation = { lat: -12.0464, lng: -77.0428 }
      const mapInstance = new window.google.maps.Map(document.getElementById('map'), {
        center: value.coordinates || defaultLocation,
        zoom: 12,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })

      const markerInstance = new window.google.maps.Marker({
        position: value.coordinates || defaultLocation,
        map: mapInstance,
        draggable: true,
        animation: window.google.maps.Animation.DROP
      })

      const autocompleteInstance = new window.google.maps.places.Autocomplete(
        document.getElementById('location-input') as HTMLInputElement,
        {
          types: ['(cities)']
        }
      )

      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace()
        if (!place.geometry) {
          Logger.warning('No se encontró la ubicación seleccionada')
          return
        }

        const location = {
          city: place.address_components.find((c: any) => c.types.includes('locality'))?.long_name || '',
          country: place.address_components.find((c: any) => c.types.includes('country'))?.long_name || '',
          coordinates: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          }
        }

        updateLocation(location)
        mapInstance.setCenter(place.geometry.location)
        markerInstance.setPosition(place.geometry.location)
        Logger.success('Ubicación actualizada desde autocompletado')
      })

      markerInstance.addListener('dragend', () => {
        const position = markerInstance.getPosition()
        reverseGeocode(position.lat(), position.lng())
        Logger.info('Marcador movido manualmente')
      })

      setMap(mapInstance)
      setMarker(markerInstance)
      setAutocomplete(autocompleteInstance)
      setIsLoading(false)
      Logger.success('Mapa inicializado correctamente')
    } catch (error) {
      setError('Error al inicializar el mapa')
      Logger.error('Error al inicializar el mapa:', error)
    }
  }

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const geocoder = new window.google.maps.Geocoder()
      const result = await new Promise((resolve, reject) => {
        geocoder.geocode(
          { location: { lat, lng } },
          (results: any[], status: string) => {
            if (status === 'OK') {
              resolve(results[0])
            } else {
              reject(status)
            }
          }
        )
      })

      const place: any = result
      const location = {
        city: place.address_components.find((c: any) => c.types.includes('locality'))?.long_name || '',
        country: place.address_components.find((c: any) => c.types.includes('country'))?.long_name || '',
        coordinates: { lat, lng }
      }

      updateLocation(location)
      Logger.success('Geocodificación inversa exitosa')
    } catch (error) {
      Logger.error('Error en geocodificación inversa:', error)
    }
  }

  const updateLocation = (location: Location) => {
    onChange(location)
  }

  return (
    <div className="space-y-6">
      <DynamicField
        type="text"
        label="Ubicación"
        name="location"
        value={`${value.city}${value.city && value.country ? ', ' : ''}${value.country}`}
        placeholder="Busca tu ciudad"
        helperText="Escribe el nombre de tu ciudad o mueve el marcador en el mapa"
        required
        id="location-input"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-xl overflow-hidden"
        style={{ height: '400px' }}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-red-50 flex items-center justify-center p-4">
            <div className="text-center text-red-600">
              <MapIcon className="w-12 h-12 mx-auto mb-2" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <div id="map" className="w-full h-full" />

        {!isLoading && !error && (
          <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPinIcon className="w-5 h-5 text-primary-500" />
              <span>Arrastra el marcador para ajustar la ubicación</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
} 