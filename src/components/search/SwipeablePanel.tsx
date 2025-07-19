'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, PanInfo, useAnimation } from 'framer-motion'
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

export type PanelState = 'min' | 'mid' | 'max' | 'half';

export interface SwipeablePanelProps {
  children: React.ReactNode
  isOpen: boolean
  onClose?: () => void
  onStateChange?: (state: PanelState) => void
  className?: string
  snapPoints?: {
    min: number
    mid: number
    max: number
  }
  initialState?: PanelState
  showDragIndicator?: boolean
  showCloseButton?: boolean
  allowOverscroll?: boolean
  height?: number
}

export default function SwipeablePanel({
  children,
  isOpen,
  onClose = () => {},
  onStateChange,
  className = '',
  snapPoints = {
    min: 0,
    mid: 50,
    max: 95
  },
  initialState = 'mid',
  showDragIndicator = true,
  showCloseButton = true,
  allowOverscroll = true,
  height
}: SwipeablePanelProps) {
  const controls = useAnimation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentSnapPoint, setCurrentSnapPoint] = useState<PanelState>(initialState)
  const [windowHeight, setWindowHeight] = useState<number>(0)
  const dragStartY = useRef<number>(0)
  
  // Set initial window height
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowHeight(window.innerHeight)
      
      const handleResize = () => {
        setWindowHeight(window.innerHeight)
      }
      
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  // Track content height
  useEffect(() => {
    if (containerRef.current) {
      // setContentHeight(containerRef.current.scrollHeight)
    }
  }, [children, isOpen])
  
  // Move panel to correct position when opened/closed
  useEffect(() => {
    if (isOpen) {
      showPanel(initialState)
    } else {
      hidePanel()
    }
  }, [isOpen, initialState])
  
  // Notify when snap point changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange(currentSnapPoint)
    }
  }, [currentSnapPoint, onStateChange])
  
  // Move panel based on current snap point
  const snapToPoint = (point: PanelState) => {
    if (point === 'min') {
      controls.start({ y: `${100 - snapPoints.min}%` })
    } else if (point === 'mid' || point === 'half') {
      // Treat 'half' as equivalent to 'mid'
      controls.start({ y: `${100 - snapPoints.mid}%` })
    } else if (point === 'max') {
      controls.start({ y: `${100 - snapPoints.max}%` })
    }
    setCurrentSnapPoint(point)
  }
  
  const showPanel = (point: PanelState = 'mid') => {
    snapToPoint(point)
  }
  
  const hidePanel = () => {
    controls.start({ y: '100%' })
  }
  
  const handleDragStart = (_: unknown, info: PanInfo) => {
    dragStartY.current = info.point.y
  }
  
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const dragEndY = info.point.y
    const dragDistance = dragEndY - dragStartY.current
    
    // If dragging up
    if (dragDistance < -50) {
      if (currentSnapPoint === 'min') {
        snapToPoint('mid')
      } else if (currentSnapPoint === 'mid' || currentSnapPoint === 'half') {
        snapToPoint('max')
      } else {
        // Already at max, stay there
        snapToPoint('max')
      }
    } 
    // If dragging down
    else if (dragDistance > 50) {
      if (currentSnapPoint === 'max') {
        snapToPoint('mid')
      } else if (currentSnapPoint === 'mid' || currentSnapPoint === 'half') {
        snapToPoint('min')
      } else if (currentSnapPoint === 'min') {
        // Close the panel
        onClose()
      }
    } 
    // Small drag, snap back to current position
    else {
      snapToPoint(currentSnapPoint)
    }
  }
  
  const panelHeight = height || `${windowHeight}px`
  
  return (
    <motion.div 
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl bg-slate-900 shadow-lg",
        className
      )}
      style={{ 
        height: panelHeight,
        maxHeight: allowOverscroll ? undefined : `calc(${windowHeight}px - env(safe-area-inset-top, 16px))`,
      }}
      initial={{ y: '100%' }}
      animate={controls}
      transition={{ 
        type: 'spring', 
        damping: 30, 
        stiffness: 300
      }}
      drag="y"
      dragConstraints={allowOverscroll ? undefined : { top: 0 }}
      dragElastic={0.2}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Drag handle */}
      <div className="relative flex justify-center items-center h-8 border-b border-slate-800 touch-none">
        {showDragIndicator && (
          <div className="w-12 h-1 bg-slate-700 rounded-full" />
        )}
        
        {showCloseButton && (
          <button 
            onClick={onClose}
            className="absolute right-4 p-1 text-slate-400 hover:text-white"
            aria-label="Cerrar panel"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Panel content */}
      <div className="overflow-y-auto flex-grow overscroll-contain" ref={containerRef}>
        {children}
      </div>
      
      {/* Expand/collapse control */}
      <div className="p-2 flex justify-center border-t border-slate-800">
        <button 
          onClick={() => snapToPoint(currentSnapPoint === 'max' ? 'mid' : 'max')}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800 rounded-lg hover:text-white transition-colors"
        >
          <ChevronDownIcon className={cn(
            "w-4 h-4 transition-transform",
            currentSnapPoint === 'max' ? 'rotate-180' : ''
          )} />
          {currentSnapPoint === 'max' ? 'Minimizar' : 'Expandir'}
        </button>
      </div>
    </motion.div>
  )
}