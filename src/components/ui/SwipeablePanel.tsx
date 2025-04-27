import React, { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { cn } from '@/lib/utils'

type PanelState = 'closed' | 'half' | 'full'

interface SwipeablePanelProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  initialState?: PanelState
  fullScreenOffset?: number // Offset from top in pixels when in full screen
  onStateChange?: (state: PanelState) => void
}

export default function SwipeablePanel({
  isOpen,
  onClose,
  children,
  className = '',
  initialState = 'half',
  fullScreenOffset = 0,
  onStateChange,
}: SwipeablePanelProps) {
  const [panelState, setPanelState] = useState<PanelState>(initialState)
  const panelRef = useRef<HTMLDivElement>(null)
  const dragStartY = useRef<number>(0)

  // Reset state when panel opens
  useEffect(() => {
    if (isOpen) {
      setPanelState(initialState)
    }
  }, [isOpen, initialState])

  // Notify when state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange(panelState)
    }
  }, [panelState, onStateChange])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        panelRef.current && 
        !panelRef.current.contains(e.target as Node) &&
        e.target instanceof HTMLElement &&
        !e.target.closest('.panel-content')
      ) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Handle drag and swipe gestures
  const onDragStart = (_: any, info: PanInfo) => {
    dragStartY.current = info.point.y
  }

  const onDragEnd = (_: any, info: PanInfo) => {
    const dragEndY = info.point.y
    const dragDiff = dragEndY - dragStartY.current
    
    if (dragDiff > 100) {
      // Dragged down significantly
      if (panelState === 'full') {
        setPanelState('half')
      } else if (panelState === 'half') {
        setPanelState('closed')
        onClose()
      }
    } else if (dragDiff < -100) {
      // Dragged up significantly
      if (panelState === 'half') {
        setPanelState('full')
      } else if (panelState === 'closed') {
        setPanelState('half')
      }
    }
  }

  // Handle panel state changes
  const getPanelHeight = () => {
    switch (panelState) {
      case 'full':
        return { height: `calc(100vh - ${fullScreenOffset}px)` }
      case 'half':
        return { height: '50vh' }
      case 'closed':
        return { height: '0vh' }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            ref={panelRef}
            className={cn(
              'fixed bottom-0 left-0 right-0 bg-slate-900 rounded-t-xl z-50 overflow-hidden shadow-xl sm:hidden',
              className
            )}
            initial={{ y: '100%' }}
            animate={getPanelHeight()}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          >
            {/* Handle bar */}
            <div className="w-full h-6 flex items-center justify-center cursor-pointer" onClick={() => setPanelState(panelState === 'full' ? 'half' : 'full')}>
              <div className="w-10 h-1 bg-slate-600 rounded-full" />
            </div>
            
            {/* Content */}
            <div className={cn(
              'panel-content overflow-y-auto',
              panelState === 'full' ? 'max-h-[calc(100vh-64px)]' : 'max-h-[calc(50vh-24px)]'
            )}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}