'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { cn } from '@/lib/utils'
import { Publication } from '@/types/publication'
import EmptyState from '../ui/Empty-state'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/spinner'

// Constant for map marker colors
const MARKER_COLORS = {
  DEFAULT: '#3b82f6', // Blue
  SELECTED: '#ef4444', // Red
}

// Cusco, Peru coordinates
const CUSCO_COORDINATES = { lat: -13.5319, lng: -71.9675 }

interface MapViewProps {
  publications: Publication[]
  selectedPublicationId?: string
  onSelectPublication: (publication: Publication | null) => void
  className?: string
}

export function MapView({
  publications,
  selectedPublicationId,
  onSelectPublication,
  className,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current) return
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      setError('Google Maps API key is missing')
      setIsLoading(false)
      return
    }
    
    const loader = new Loader({
      apiKey,
      version: 'weekly',
    })
    
    loader.load()
      .then(() => {
        if (!mapRef.current) return
        
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: CUSCO_COORDINATES, // Default to Cusco, Peru
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        })
        
        setMap(mapInstance)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Failed to load Google Maps:', err)
        setError('Failed to load Google Maps')
        setIsLoading(false)
      })
  }, [])
  
  // Update markers when publications change
  useEffect(() => {
    if (!map || !publications.length) return
    
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null))
    
    const bounds = new google.maps.LatLngBounds()
    const newMarkers: google.maps.Marker[] = []
    
    publications.forEach(publication => {
      if (!publication.location?.latitude || !publication.location?.longitude) return
      
      const position = {
        lat: parseFloat(publication.location.latitude),
        lng: parseFloat(publication.location.longitude)
      }
      
      const marker = new google.maps.Marker({
        position,
        map,
        title: publication.title,
        icon: {
          url: selectedPublicationId === publication.id 
            ? '/images/marker-selected.png' 
            : '/images/marker.png',
          scaledSize: new google.maps.Size(30, 40)
        }
      })
      
      marker.addListener('click', () => {
        onSelectPublication(publication)
      })
      
      newMarkers.push(marker)
      bounds.extend(position)
    })
    
    setMarkers(newMarkers)
    
    // Only adjust bounds if we have markers
    if (newMarkers.length > 0) {
      map.fitBounds(bounds)
      
      // Don't zoom in too far on small data sets
      if (map.getZoom()! > 15) {
        map.setZoom(15)
      }
    } else {
      // If no markers, center on Cusco
      map.setCenter(CUSCO_COORDINATES)
      map.setZoom(13)
    }
  }, [map, publications, selectedPublicationId, onSelectPublication])
  
  // Update selected marker
  useEffect(() => {
    if (!map || !markers.length) return
    
    markers.forEach((marker, index) => {
      const publication = publications[index]
      if (!publication) return
      
      marker.setIcon({
        url: selectedPublicationId === publication.id 
          ? '/images/marker-selected.png' 
          : '/images/marker.png',
        scaledSize: new google.maps.Size(30, 40)
      })
    })
  }, [map, markers, publications, selectedPublicationId])
  
  // Center map on selected publication
  useEffect(() => {
    if (!map) return
    
    const selectedPublication = publications.find(pub => pub.id === selectedPublicationId)
    
    if (selectedPublication && 
        selectedPublication.location?.latitude && 
        selectedPublication.location?.longitude) {
      const position = {
        lat: parseFloat(selectedPublication.location.latitude),
        lng: parseFloat(selectedPublication.location.longitude)
      }
      
      map.panTo(position)
      map.setZoom(15)
    }
  }, [map, publications, selectedPublicationId])
  
  if (error) {
    return (
      <div className={cn("h-full flex items-center justify-center", className)}>
        <EmptyState
          title="Error loading map"
          description={error}
          action={<Button onClick={() => window.location.reload()}>Try Again</Button>}
        />
      </div>
    )
  }
  
  if (isLoading) {
    return (
      <div className={cn("h-full flex items-center justify-center", className)}>
        <Spinner size="lg" />
      </div>
    )
  }
  
  return (
    <div 
      ref={mapRef} 
      className={cn("h-full w-full", className)}
    />
  )
} 