'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MapView } from './MapView'
import { Publication } from '@/types/publication'
import { formatCurrency } from '@/utils/format'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { X, ChevronDown, ChevronUp } from 'lucide-react'

// Panel state for mobile view
type PanelState = 'closed' | 'half' | 'full'

interface SplitLayoutProps {
  children: React.ReactNode
  publications: Publication[]
  selectedPublication: Publication | null
  onSelectPublication: (publication: Publication | null) => void
  loading?: boolean
  isMapView: boolean
  toggleMapView: () => void
  className?: string
}

export function SplitLayout({
  children,
  publications,
  selectedPublication,
  onSelectPublication,
  loading = false,
  isMapView,
  toggleMapView,
  className,
}: SplitLayoutProps) {
  const [panelState, setPanelState] = useState<PanelState>('closed')
  const [isMobile, setIsMobile] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const startY = useRef<number | null>(null)
  const lastY = useRef<number | null>(null)
  const dragHandleRef = useRef<HTMLDivElement>(null)

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Reset panel state when selected publication changes
  useEffect(() => {
    if (selectedPublication && panelState === 'closed') {
      setPanelState('half')
    } else if (!selectedPublication && panelState !== 'closed') {
      setPanelState('closed')
    }
  }, [selectedPublication, panelState])

  // Reset panel when map view is toggled off
  useEffect(() => {
    if (!isMapView) {
      setPanelState('closed')
    }
  }, [isMapView])

  // Handle touch events for dragging
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (startY.current === null) return
    lastY.current = e.touches[0].clientY
    
    // Prevent default to avoid scrolling while dragging
    e.preventDefault()
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (startY.current === null || lastY.current === null) {
      startY.current = null
      lastY.current = null
      return
    }

    const deltaY = lastY.current - startY.current
    const windowHeight = window.innerHeight
    const threshold = windowHeight * 0.15 // 15% threshold

    if (panelState === 'half') {
      if (deltaY > threshold) {
        // Swipe down - close panel
        setPanelState('closed')
      } else if (deltaY < -threshold) {
        // Swipe up - full panel
        setPanelState('full')
      }
    } else if (panelState === 'full') {
      if (deltaY > threshold) {
        // Swipe down - half panel
        setPanelState('half')
      }
    } else if (panelState === 'closed') {
      if (deltaY < -threshold && selectedPublication) {
        // Swipe up - half panel
        setPanelState('half')
      }
    }

    // Reset
    startY.current = null
    lastY.current = null
  }, [panelState, selectedPublication])

  // Calculate panel style based on state and drag
  const getPanelStyle = useCallback(() => {
    let translateY = '100%' // Default - closed
    
    if (panelState === 'half') {
      translateY = '50%'
    } else if (panelState === 'full') {
      translateY = '0%'
    }
    
    // Apply dragging effect if being dragged
    if (startY.current !== null && lastY.current !== null) {
      const deltaY = lastY.current - startY.current
      
      // Limit the dragging effect
      if (
        (panelState === 'half' && deltaY > 0 && deltaY < window.innerHeight / 2) || 
        (panelState === 'half' && deltaY < 0 && deltaY > -window.innerHeight / 2) ||
        (panelState === 'full' && deltaY > 0 && deltaY < window.innerHeight / 2) || 
        (panelState === 'closed' && deltaY < 0 && selectedPublication)
      ) {
        if (panelState === 'half') {
          translateY = `calc(50% + ${deltaY}px)`
        } else if (panelState === 'full') {
          translateY = `calc(0% + ${deltaY}px)`
        } else if (panelState === 'closed') {
          translateY = `calc(100% + ${deltaY}px)`
        }
      }
    }
    
    return {
      transform: `translateY(${translateY})`,
      transition: startY.current !== null ? 'none' : 'transform 0.3s ease-out'
    }
  }, [panelState, selectedPublication])

  // Render mobile view with sliding panel
  const renderMobileView = () => {
    return (
      <div className={`relative w-full h-full ${className || ''}`}>
        {/* Main content - publications grid */}
        <div className="w-full h-full overflow-auto">
          {children}
        </div>
        
        {/* Map View - conditionally rendered when isMapView is true */}
        {isMapView && (
          <div className="absolute inset-0">
            <MapView 
              publications={publications} 
              selectedPublicationId={selectedPublication?.id} 
              onSelectPublication={onSelectPublication}
              loading={loading}
            />
            
            {/* Close map button */}
            <Button
              variant="secondary"
              className="absolute top-2 left-2 rounded-full p-2"
              onClick={toggleMapView}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        {/* Sliding panel for selected publication */}
        {selectedPublication && isMapView && (
          <div
            ref={panelRef}
            className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-lg z-50 max-h-screen overflow-hidden"
            style={getPanelStyle()}
          >
            {/* Drag handle */}
            <div 
              ref={dragHandleRef}
              className="w-full h-12 flex items-center justify-center cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
            
            {/* Header with controls */}
            <div className="flex justify-between items-center px-4 pb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => panelState === 'full' ? setPanelState('half') : setPanelState('full')}
              >
                {panelState === 'full' ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronUp className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPanelState('closed')
                  onSelectPublication(null)
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Publication details */}
            <div className="p-4 overflow-auto" style={{ 
              maxHeight: panelState === 'full' 
                ? 'calc(100vh - 6rem)' 
                : 'calc(50vh - 6rem)' 
            }}>
              {selectedPublication.images && selectedPublication.images.length > 0 && (
                <div className="relative h-56 w-full rounded-lg mb-4 overflow-hidden">
                  <Image
                    src={selectedPublication.images[0]}
                    alt={selectedPublication.title || 'Imagen de publicación'}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <h2 className="text-xl font-semibold mb-2">
                {selectedPublication.title}
              </h2>
              
              {selectedPublication.amount && (
                <p className="text-2xl font-bold mb-4">
                  {formatCurrency(
                    selectedPublication.amount, 
                    selectedPublication.currency || 'PEN'
                  )}
                </p>
              )}
              
              {selectedPublication.description && (
                <p className="text-muted-foreground mb-4">
                  {selectedPublication.description}
                </p>
              )}
              
              {/* Location details */}
              {selectedPublication.location && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Ubicación</h3>
                  {selectedPublication.location.province && (
                    <p>Provincia: {selectedPublication.location.province}</p>
                  )}
                  {selectedPublication.location.district && (
                    <p>Distrito: {selectedPublication.location.district}</p>
                  )}
                  {selectedPublication.location.address && (
                    <p>Dirección: {selectedPublication.location.address}</p>
                  )}
                </div>
              )}
              
              {/* Contact button */}
              <Button className="w-full mt-4">
                Contactar
              </Button>
              
              {/* Add more details here as needed */}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render desktop view with side-by-side layout
  const renderDesktopView = () => {
    return (
      <div className={`w-full h-full flex ${className || ''}`}>
        {/* Left side - publications list/grid */}
        <div className={`${isMapView ? 'w-1/2' : 'w-full'} h-full overflow-auto transition-all duration-300`}>
          {children}
        </div>
        
        {/* Right side - map or expanded publication */}
        {isMapView && (
          <div className="w-1/2 h-full relative">
            <MapView 
              publications={publications} 
              selectedPublicationId={selectedPublication?.id} 
              onSelectPublication={onSelectPublication}
              loading={loading}
            />
            
            {/* Publication details overlay when a publication is selected */}
            {selectedPublication && (
              <div className="absolute bottom-4 left-4 right-4 bg-background rounded-lg shadow-lg p-4 max-h-1/2 overflow-auto">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-lg font-semibold">
                    {selectedPublication.title}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 -mt-1.5 -mr-1.5"
                    onClick={() => onSelectPublication(null)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                {selectedPublication.amount && (
                  <p className="text-xl font-bold mb-2">
                    {formatCurrency(
                      selectedPublication.amount, 
                      selectedPublication.currency || 'PEN'
                    )}
                  </p>
                )}
                
                {selectedPublication.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                    {selectedPublication.description}
                  </p>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 mr-2"
                  onClick={() => window.location.href = `/adiso/${selectedPublication.id}`}
                >
                  Ver detalles
                </Button>
                
                <Button size="sm" className="mt-2">
                  Contactar
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return isMobile ? renderMobileView() : renderDesktopView()
} 