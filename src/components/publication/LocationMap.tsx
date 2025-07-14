'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { cn } from '@/lib/utils'
import { MapPinIcon } from '@heroicons/react/24/outline'

// Temporary Google Maps type declarations for build
declare global {
  interface Google {
    maps: {
      MapStyle: {
        featureType: string;
        elementType: string;
        stylers: Array<{ visibility: string }>;
      }

      MapOptions: {
        center: { lat: number; lng: number };
        zoom: number;
        mapTypeControl?: boolean;
        fullscreenControl?: boolean;
        streetViewControl?: boolean;
        zoomControl?: boolean;
        scrollwheel?: boolean;
        draggable?: boolean;
        clickableIcons?: boolean;
        styles?: Google['maps']['MapStyle'][];
      }

      MarkerOptions: {
        position: { lat: number; lng: number };
        map: Google['maps']['Map'];
        icon?: {
          url: string;
          scaledSize: Google['maps']['Size'];
          anchor: Google['maps']['Point'];
        };
        optimized?: boolean;
      }

      MapEventHandler: (e?: Google['maps']['MapMouseEvent']) => void;

      Map: {
        new(element: HTMLElement, options: Google['maps']['MapOptions']): {
          addListener(event: string, handler: Google['maps']['MapEventHandler']): void;
          setCenter(position: { lat: number; lng: number }): void;
          setZoom(zoom: number): void;
        };
      };
      MapMouseEvent: {
        latLng: Google['maps']['LatLng'];
      };
      LatLng: {
        new(lat: number, lng: number): {
          lat(): number;
          lng(): number;
        };
      };
      Marker: {
        new(options: Google['maps']['MarkerOptions']): {
          addListener(event: string, handler: () => void): void;
          getPosition(): { lat(): number; lng(): number } | null;
          setPosition(position: { lat: number; lng: number }): void;
        };
      };
      Size: {
        new(width: number, height: number): {
          width: number;
          height: number;
        };
      };
      Point: {
        new(x: number, y: number): {
          x: number;
          y: number;
        };
      };
    }
  }
  
  interface Window {
    google: Google;
  }
}

interface LocationMapProps {
  latitude: number | string | undefined
  longitude: number | string | undefined
  address?: string
  className?: string
  height?: string
  zoom?: number
  interactive?: boolean
}

export default function LocationMap({
  latitude,
  longitude,
  address,
  className,
  height = '300px',
  zoom = 15,
  interactive = true,
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // Skip if no coordinates or no mapRef
    if (!latitude || !longitude || !mapRef.current) {
      setError('No location coordinates provided')
      setIsLoading(false)
      return
    }
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      setError('Google Maps API key is missing')
      setIsLoading(false)
      return
    }
    
    // Parse coordinates to numbers if they're strings
    const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude
    const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude
    
    // Load Google Maps API - optimize by limiting libraries to just what we need
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      // Only load the maps library for this simple display
      libraries: [],
    })
    
    loader.load()
      .then((google) => {
        const mapOptions: Google['maps']['MapOptions'] = {
          center: { lat, lng },
          zoom,
          mapTypeControl: false,
          fullscreenControl: true,
          streetViewControl: interactive,
          zoomControl: interactive,
          scrollwheel: interactive,
          draggable: interactive,
          clickableIcons: interactive,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        }
        
        const map = new google.maps.Map(mapRef.current!, mapOptions)
        
        // Add a marker at the location
        const markerSvg = `
          <svg viewBox="0 0 24 24" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
            <path 
              fill="#ef4444" 
              d="M12 0C7.802 0 4 3.403 4 7.602C4 11.8 7.469 16.812 12 24C16.531 16.812 20 11.8 20 7.602C20 3.403 16.199 0 12 0ZM12 11C10.343 11 9 9.657 9 8C9 6.343 10.343 5 12 5C13.657 5 15 6.343 15 8C15 9.657 13.657 11 12 11Z"
            />
          </svg>
        `
        
        // Convert SVG to URL
        const svgUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(markerSvg)
        
        new google.maps.Marker({
          position: { lat, lng },
          map,
          icon: {
            url: svgUrl,
            scaledSize: new google.maps.Size(36, 36),
            anchor: new google.maps.Point(18, 36),
          },
          optimized: true
        })
        
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Error loading Google Maps:', err)
        setError('Failed to load Google Maps')
        setIsLoading(false)
      })
  }, [latitude, longitude, zoom, interactive])
  
  return (
    <div 
      className={cn("relative rounded-lg overflow-hidden", className)}
      style={{ height }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 bg-opacity-80 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 p-4">
          <MapPinIcon className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-slate-700 text-sm text-center">{error}</p>
          {address && (
            <p className="text-slate-600 text-xs mt-2 text-center">{address}</p>
          )}
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="h-full w-full"
        style={{ display: isLoading || error ? 'none' : 'block' }}
      />
      
      {/* Display address caption if provided */}
      {address && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2 text-center">
          {address}
        </div>
      )}
    </div>
  )
} 