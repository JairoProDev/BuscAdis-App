'use client'

import React, { useState, useCallback } from 'react'
import { Publication } from '@/types/publication'
import { EmptyState } from '@/components/ui/Empty-state'
// Create a simple local spinner component instead of importing one with casing issues
// import { Spinner } from '@/components/ui/Spinner'

// Simple local spinner component to avoid casing issues
const Spinner = ({ className = "" }: { className?: string }) => (
  <div className={`animate-spin rounded-full border-4 border-t-transparent border-teal-500 ${className}`}></div>
);

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
  const [mapError] = useState<string | null>(null)
  
  // Simplified mock implementation until we fix Google Maps API integration
  const isLoaded = true
  const loadError = null

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

  // Count publications with valid coordinates
  const publicationsWithCoordinates = publications.filter(p => 
    p?.location?.coordinates?.lat && p?.location?.coordinates?.lng
  ).length

  // Create a placeholder map that shows selected publication info
  const selectedPublication = selectedPublicationId 
    ? publications.find(p => p.id === selectedPublicationId)
    : null

  return (
    <div className={className || 'h-full w-full relative'}>
      <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-400">
        <div className="text-center p-8">
          <p className="mb-4 text-lg font-semibold">Vista de mapa - Implementación pendiente</p>
          <p className="text-sm">Se implementará usando Google Maps API</p>
          <p className="text-sm mt-4">Centro del mapa: {getMapCenter().lat.toFixed(4)}, {getMapCenter().lng.toFixed(4)}</p>
          <p className="text-sm mt-2">Publicaciones con coordenadas: {publicationsWithCoordinates}</p>
          
          {selectedPublication && (
            <div className="mt-4 p-4 bg-slate-700 rounded-lg text-left">
              <p className="font-semibold text-white">{selectedPublication.title}</p>
              {selectedPublication.amount && (
                <p className="text-teal-300 font-bold">
                  {new Intl.NumberFormat('es-PE', {
                    style: 'currency',
                    currency: selectedPublication.currency || 'PEN',
                    maximumFractionDigits: 0
                  }).format(selectedPublication.amount)}
                </p>
              )}
              <button 
                onClick={() => onSelectPublication(selectedPublication)}
                className="mt-2 px-3 py-1 bg-teal-500 text-white text-sm rounded-md hover:bg-teal-600"
              >
                Ver detalles
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 