'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

interface SwipeablePanelProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  title?: string
  showBackdrop?: boolean
  initialState?: 'closed' | 'half' | 'full'
}

export default function SwipeablePanel({
  children,
  isOpen,
  onClose,
  title = '',
  showBackdrop = true,
  initialState = 'half'
}: SwipeablePanelProps) {
  const [panelState, setPanelState] = useState<'closed' | 'half' | 'full'>(initialState)
  const containerRef = useRef<HTMLDivElement>(null)
  const [panelHeight, setPanelHeight] = useState(0)
  
  // Motion values
  const y = useMotionValue(0)
  const springConfig = { damping: 40, stiffness: 400 }
  const springY = useSpring(y, springConfig)
  
  // Calculate states positions
  useEffect(() => {
    if (isOpen) {
      // Get height of window for calculations
      const windowHeight = window.innerHeight
      const handleHeight = 40 // Height of the handle area
      setPanelHeight(windowHeight)
      
      // Set initial position based on initialState
      if (initialState === 'half') {
        y.set(windowHeight * 0.5)
      } else if (initialState === 'full') {
        y.set(0)
      } else {
        y.set(windowHeight - handleHeight)
      }
    }
  }, [isOpen, initialState])
  
  // Update y when panelState changes
  useEffect(() => {
    if (panelHeight === 0) return
    
    if (panelState === 'closed') {
      springY.set(panelHeight)
      onClose()
    } else if (panelState === 'half') {
      springY.set(panelHeight * 0.5)
    } else {
      springY.set(0)
    }
  }, [panelState, panelHeight, springY, onClose])
  
  // Transform opacity based on y position
  const backdropOpacity = useTransform(
    springY,
    [0, panelHeight * 0.5, panelHeight],
    [0.5, 0.5, 0]
  )
  
  const handleDragEnd = (_, info: { offset: { y: number }; velocity: { y: number } }) => {
    const offset = info.offset.y
    const velocity = info.velocity.y
    
    // Swipe up with high velocity - go to full
    if (velocity.y < -500) {
      setPanelState('full')
      return
    }
    
    // Swipe down with high velocity - close or go to half
    if (velocity.y > 500) {
      if (panelState === 'full') {
        setPanelState('half')
      } else {
        setPanelState('closed')
      }
      return
    }
    
    // Based on position after drag
    if (offset > 100) {
      // Dragged down significantly
      if (panelState === 'full') {
        setPanelState('half')
      } else {
        setPanelState('closed')
      }
    } else if (offset < -100) {
      // Dragged up significantly
      if (panelState === 'half') {
        setPanelState('full')
      }
    } else {
      // Restore to current state (small movement)
      setPanelState(panelState)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <>
      {/* Backdrop */}
      {showBackdrop && (
        <motion.div
          className="fixed inset-0 bg-black z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: backdropOpacity }}
          onClick={() => setPanelState('closed')}
        />
      )}
      
      {/* Panel */}
      <motion.div
        ref={containerRef}
        className="fixed bottom-0 left-0 right-0 bg-slate-900 rounded-t-xl z-50 overflow-hidden"
        style={{ y: springY }}
        drag="y"
        dragConstraints={{ top: 0, bottom: panelHeight }}
        onDragEnd={handleDragEnd}
      >
        {/* Handle and header */}
        <div className="h-10 flex flex-col items-center justify-center border-b border-slate-800">
          <div className="w-12 h-1 bg-slate-700 rounded-full my-2" />
          {title && (
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 h-10">
              <h3 className="text-sm font-medium">{title}</h3>
              <button 
                onClick={() => setPanelState('closed')} 
                className="p-1"
                aria-label="Close panel"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="absolute right-4 top-10 flex flex-col space-y-1">
          {panelState !== 'full' && (
            <button 
              className="p-1 bg-slate-800 rounded-full"
              onClick={() => setPanelState('full')}
              aria-label="Expand panel to full screen"
            >
              <ChevronUp size={16} />
            </button>
          )}
          {panelState !== 'half' && (
            <button 
              className="p-1 bg-slate-800 rounded-full"
              onClick={() => setPanelState('half')}
              aria-label="Show panel in half screen"
            >
              <ChevronDown size={16} />
            </button>
          )}
        </div>
        
        {/* Content */}
        <div 
          className="overflow-y-auto"
          style={{ 
            height: `calc(${panelHeight}px - 40px)`,
            maxHeight: `calc(${panelHeight}px - 40px)`
          }}
        >
          {children}
        </div>
      </motion.div>
    </>
  )
} 