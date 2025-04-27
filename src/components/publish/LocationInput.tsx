'use client'

import { useState, useEffect, useMemo } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { Loader } from '@googlemaps/js-api-loader'
import { geocodeAddress, LocationCoordinates } from '@/utils/maps'
import { MapPinIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface LocationInputProps {
  initialAddress?: string
  initialCoordinates?: LocationCoordinates
  onLocationChange: (location: { address: string; coordinates: LocationCoordinates | null }) => void
  className?: string
}

export default function LocationInput({
  initialAddress = '',
  initialCoordinates,
  onLocationChange,
  className,
}: LocationInputProps) {
  const [address, setAddress] = useState(initialAddress)
  const [coordinates, setCoordinates] = useState<LocationCoordinates | null>(initialCoordinates || null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Debounce the address to avoid too many geocoding requests
  const debouncedAddress = useDebounce(address, 800)
  
  // Generate a unique ID for the map container
  const mapContainerId = useMemo(() => `map-container-${Math.random().toString(36).substring(2, 9)}`, [])
  
  // Load Google Maps API
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      setError('Google Maps API key is missing')
      return
    }
    
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places'],
    })
    
    loader.load()
      .then(() => {
        setMapLoaded(true)
      })
      .catch(err => {
        console.error('Error loading Google Maps:', err)
        setError('Failed to load Google Maps')
      })
  }, [])
  
  // Initialize map after API is loaded
  useEffect(() => {
    if (!mapLoaded) return
    
    const mapElement = document.getElementById(mapContainerId)
    if (!mapElement) return
    
    // Initialize with default location or user's coordinates if available
    const initialLocation = coordinates || { lat: 40.416775, lng: -3.703790 } // Madrid, Spain as default
    
    const mapInstance = new google.maps.Map(mapElement, {
      center: initialLocation,
      zoom: coordinates ? 15 : 6, // Zoom in if we have coordinates, otherwise show country view
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
    })
    
    // Create marker if we have coordinates
    let markerInstance: google.maps.Marker | null = null
    if (coordinates) {
      markerInstance = new google.maps.Marker({
        position: coordinates,
        map: mapInstance,
        draggable: true,
      })
      
      // Update coordinates when marker is dragged
      markerInstance.addListener('dragend', () => {
        const position = markerInstance?.getPosition()
        if (position) {
          const newCoords = { lat: position.lat(), lng: position.lng() }
          setCoordinates(newCoords)
          onLocationChange({ address, coordinates: newCoords })
          
          // Reverse geocode to get address
          reverseGeocode(newCoords)
        }
      })
    }
    
    // Allow clicking on map to set marker
    mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
      const position = e.latLng
      if (position) {
        const newCoords = { lat: position.lat(), lng: position.lng() }
        
        // Update or create marker
        if (markerInstance) {
          markerInstance.setPosition(newCoords)
        } else {
          markerInstance = new google.maps.Marker({
            position: newCoords,
            map: mapInstance,
            draggable: true,
            animation: google.maps.Animation.DROP,
          })
          
          // Add dragend listener to new marker
          markerInstance.addListener('dragend', () => {
            const position = markerInstance?.getPosition()
            if (position) {
              const newCoords = { lat: position.lat(), lng: position.lng() }
              setCoordinates(newCoords)
              onLocationChange({ address, coordinates: newCoords })
              
              // Reverse geocode to get address
              reverseGeocode(newCoords)
            }
          })
        }
        
        setCoordinates(newCoords)
        onLocationChange({ address, coordinates: newCoords })
        
        // Reverse geocode to get address
        reverseGeocode(newCoords)
      }
    })
    
    setMap(mapInstance)
    setMarker(markerInstance)
    
    return () => {
      // Clean up
      google.maps.event.clearInstanceListeners(mapInstance)
      if (markerInstance) {
        google.maps.event.clearInstanceListeners(markerInstance)
      }
    }
  }, [mapLoaded, mapContainerId, coordinates, address, onLocationChange])
  
  // Geocode when address changes
  useEffect(() => {
    if (!debouncedAddress || debouncedAddress.length < 3) return
    
    const performGeocoding = async () => {
      setIsGeocoding(true)
      setError(null)
      
      try {
        const result = await geocodeAddress(debouncedAddress)
        
        if (result) {
          setCoordinates(result)
          onLocationChange({ address, coordinates: result })
          
          // Update map and marker
          if (map) {
            map.setCenter(result)
            map.setZoom(15)
            
            if (marker) {
              marker.setPosition(result)
            } else {
              const newMarker = new google.maps.Marker({
                position: result,
                map,
                draggable: true,
                animation: google.maps.Animation.DROP,
              })
              
              // Add dragend listener
              newMarker.addListener('dragend', () => {
                const position = newMarker.getPosition()
                if (position) {
                  const newCoords = { lat: position.lat(), lng: position.lng() }
                  setCoordinates(newCoords)
                  onLocationChange({ address, coordinates: newCoords })
                  
                  // Reverse geocode to get address
                  reverseGeocode(newCoords)
                }
              })
              
              setMarker(newMarker)
            }
          }
        } else {
          setError('No se encontró la dirección. Intenta ser más específico o marca la ubicación en el mapa.')
        }
      } catch (err) {
        console.error('Error geocoding:', err)
        setError('Error al buscar la dirección. Intenta nuevamente.')
      } finally {
        setIsGeocoding(false)
      }
    }
    
    performGeocoding()
  }, [debouncedAddress, map, marker, address, onLocationChange])
  
  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (coords: LocationCoordinates) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      console.error('Google Maps API key is missing')
      return
    }
    
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${apiKey}`
      )
      
      if (!response.ok) {
        throw new Error('Geocoding API error')
      }
      
      const data = await response.json()
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const formattedAddress = data.results[0].formatted_address
        setAddress(formattedAddress)
        onLocationChange({ address: formattedAddress, coordinates: coords })
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
    }
  }
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center space-x-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Introduce una dirección o ubicación"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          {isGeocoding && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                  }
                  setCoordinates(coords)
                  
                  if (map) {
                    map.setCenter(coords)
                    map.setZoom(15)
                    
                    if (marker) {
                      marker.setPosition(coords)
                    } else {
                      const newMarker = new google.maps.Marker({
                        position: coords,
                        map,
                        draggable: true,
                      })
                      setMarker(newMarker)
                    }
                  }
                  
                  // Reverse geocode to get address
                  reverseGeocode(coords)
                },
                (err) => {
                  console.error('Error getting location:', err)
                  setError('No se pudo obtener tu ubicación. Revisa los permisos de tu navegador.')
                }
              )
            } else {
              setError('Tu navegador no soporta geolocalización.')
            }
          }}
          className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          title="Usar mi ubicación actual"
        >
          <MapPinIcon className="h-5 w-5" />
        </button>
      </div>
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      
      <div 
        id={mapContainerId} 
        className="w-full h-64 bg-slate-100 rounded-md relative"
      >
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
      
      <p className="text-sm text-slate-500">
        Puedes ajustar la ubicación arrastrando el marcador o haciendo clic en el mapa.
      </p>
    </div>
  )
} 