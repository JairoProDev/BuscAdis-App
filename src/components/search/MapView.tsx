'use client'

import React, { useState, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api'
import { Publication } from '@/types/publication'
import { EmptyState } from '@/components/ui/Empty-state'
import { Spinner } from '@/components/ui/spinner'
import { useTheme } from 'next-themes'

// Map styles for dark and light theme
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
]

// Default map center (Cusco, Peru)
const defaultCenter = {
  lat: -13.5319,
  lng: -71.9675
}

interface MapViewProps {
  publications: Publication[]
  selectedPublicationId?: string | null
  onSelectPublication: (publication: Publication) => void
  loading?: boolean
  className?: string
}

export function MapView({
  publications,
  selectedPublicationId,
  onSelectPublication,
  loading = false,
  className,
}: MapViewProps) {
  const { theme } = useTheme()
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  
  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    // Add any required libraries here
    // libraries: ['places']
  })

  // Determine the center based on publications
  const getMapCenter = useCallback(() => {
    if (publications && publications.length > 0) {
      // Try to use the selected publication first
      if (selectedPublicationId) {
        const selected = publications.find(p => p.id === selectedPublicationId)
        if (selected?.location?.coordinates) {
          return {
            lat: selected.location.coordinates.lat,
            lng: selected.location.coordinates.lng
          }
        }
      }
      
      // Otherwise, try to use the first publication with coordinates
      for (const pub of publications) {
        if (pub.location?.coordinates) {
          return {
            lat: pub.location.coordinates.lat,
            lng: pub.location.coordinates.lng
          }
        }
      }
    }
    
    // Fallback to default center (Cusco, Peru)
    return defaultCenter
  }, [publications, selectedPublicationId])

  // Callback for when the map loads
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  // Handle map errors
  if (loadError) {
    return (
      <EmptyState
        title="Error al cargar el mapa"
        description="No se pudo cargar el mapa de Google. Por favor, inténtalo de nuevo más tarde."
        className={className}
      />
    )
  }

  if (mapError) {
    return (
      <EmptyState
        title="Error en el mapa"
        description={mapError}
        className={className}
      />
    )
  }

  // Show loading state
  if (!isLoaded || loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Spinner className="w-12 h-12" />
      </div>
    )
  }

  // Show empty state when no publications
  if (!publications || publications.length === 0) {
    return (
      <EmptyState
        title="No hay ubicaciones para mostrar"
        description="No hay publicaciones con ubicación para mostrar en el mapa."
        className={className}
      />
    )
  }

  // Check if any publication has coordinates
  const hasCoordinates = publications.some(pub => 
    pub.location && pub.location.coordinates && 
    pub.location.coordinates.lat && pub.location.coordinates.lng
  )

  if (!hasCoordinates) {
    return (
      <EmptyState
        title="Sin coordenadas"
        description="Las publicaciones no tienen coordenadas para mostrar en el mapa."
        className={className}
      />
    )
  }

  // Format marker label for publication
  const getMarkerLabel = (publication: Publication): string => {
    if (publication.price) {
      return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: publication.currency || 'PEN',
        maximumFractionDigits: 0
      }).format(publication.price)
    }
    return ''
  }

  return (
    <div className={className || 'h-full w-full'}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={getMapCenter()}
        zoom={14}
        onLoad={onMapLoad}
        options={{
          styles: theme === 'dark' ? darkMapStyle : [],
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {publications.map((publication) => {
          if (
            publication.location?.coordinates?.lat &&
            publication.location?.coordinates?.lng
          ) {
            return (
              <MarkerF
                key={publication.id}
                position={{
                  lat: publication.location.coordinates.lat,
                  lng: publication.location.coordinates.lng
                }}
                onClick={() => onSelectPublication(publication)}
                animation={
                  selectedPublicationId === publication.id
                    ? google.maps.Animation.BOUNCE
                    : undefined
                }
                label={getMarkerLabel(publication)}
                icon={{
                  url: selectedPublicationId === publication.id
                    ? '/images/markers/selected-marker.png'
                    : '/images/markers/default-marker.png',
                  scaledSize: new google.maps.Size(30, 40)
                }}
              />
            )
          }
          return null
        })}
      </GoogleMap>
    </div>
  )
} 