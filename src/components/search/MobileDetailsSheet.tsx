'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo, useAnimationControls } from 'framer-motion'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { Publication } from '@/components/search/DetailsPanel'
import DetailsPanel from '@/components/search/DetailsPanel'

interface MobileDetailsSheetProps {
  publication?: Publication
  isOpen: boolean
  onClose: () => void
  isLiked?: boolean
  isSaved?: boolean
  onLike?: (id: string, liked: boolean) => void
  onSave?: (id: string, saved: boolean) => void
  onContact?: (userId: string) => void
  onShare?: (publicationId: string) => void
}

export default function MobileDetailsSheet({
  publication,
  isOpen,
  onClose,
  isLiked,
  isSaved,
  onLike,
  onSave,
  onContact,
  onShare
}: MobileDetailsSheetProps) {
  const [sheetState, setSheetState] = useState<'closed' | 'half' | 'full'>('half')
  const [windowHeight, setWindowHeight] = useState(0)
  const controls = useAnimationControls()
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragHandleRef = useRef<HTMLDivElement>(null)

  // Get window height on mount
  useEffect(() => {
    setWindowHeight(window.innerHeight)
    
    const handleResize = () => {
      setWindowHeight(window.innerHeight)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Set sheet state when isOpen changes
  useEffect(() => {
    if (isOpen) {
      setSheetState('half')
      controls.start('half')
    } else {
      setSheetState('closed')
      controls.start('closed')
    }
  }, [isOpen, controls])
  
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const velocity = info.velocity.y
    const offset = info.offset.y
    
    // Define thresholds
    const closeThreshold = windowHeight * 0.2
    const fullScreenThreshold = -windowHeight * 0.2
    
    // Quick flick
    if (velocity > 500) {
      // Quick flick down, close if in half view
      if (sheetState === 'half') {
        setSheetState('closed')
        controls.start('closed')
        onClose()
      } else if (sheetState === 'full') {
        // If in full view, go to half view
        setSheetState('half')
        controls.start('half')
      }
    } else if (velocity < -500) {
      // Quick flick up, go from half to full
      if (sheetState === 'half') {
        setSheetState('full')
        controls.start('full')
      }
    } else {
      // Slower drag, check by offset
      if (offset > closeThreshold && sheetState !== 'closed') {
        // Dragged down past threshold
        if (sheetState === 'full') {
          // From full to half
          setSheetState('half')
          controls.start('half')
        } else {
          // From half to closed
          setSheetState('closed')
          controls.start('closed')
          onClose()
        }
      } else if (offset < fullScreenThreshold && sheetState === 'half') {
        // Dragged up past threshold, go to full
        setSheetState('full')
        controls.start('full')
      } else {
        // Return to current state
        controls.start(sheetState)
      }
    }
  }
  
  const handleSnapTo = (state: 'closed' | 'half' | 'full') => {
    setSheetState(state)
    controls.start(state)
    
    if (state === 'closed') {
      onClose()
    }
  }
  
  const variants = {
    closed: { y: windowHeight },
    half: { y: windowHeight * 0.5 },
    full: { y: 0 }
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 touch-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onClose()}
          />
          
          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            className="fixed inset-x-0 bottom-0 z-50 bg-slate-800 rounded-t-xl overflow-hidden flex flex-col"
            style={{ height: '90vh' }}
            initial="closed"
            animate={controls}
            exit="closed"
            variants={variants}
            transition={{ 
              type: 'spring', 
              damping: 40, 
              stiffness: 400 
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            dragListener={false}
          >
            {/* Drag handle */}
            <div 
              ref={dragHandleRef}
              className="h-10 w-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
              onPointerDown={(e) => {
                // Only allow dragging from the handle
                e.currentTarget.setPointerCapture(e.pointerId)
                if (sheetRef.current) {
                  (sheetRef.current as unknown as { __dragHandlers?: { onPointerDown: (e: PointerEvent) => void } }).__dragHandlers?.onPointerDown(e)
                }
              }}
              onPointerUp={(e) => {
                e.currentTarget.releasePointerCapture(e.pointerId)
              }}
            >
              <div className="w-10 h-1 bg-slate-600 rounded-full" />
            </div>
            
            {/* Sheet header with controls */}
            <div className="px-4 py-2 flex justify-between items-center border-b border-slate-700">
              <div className="text-white font-medium">
                {sheetState === 'full' ? 'Detalles completos' : 'Detalles'}
              </div>
              
              <div className="flex gap-2">
                {sheetState === 'half' && (
                  <button
                    onClick={() => handleSnapTo('full')}
                    className="p-1 text-slate-400 hover:text-white"
                    aria-label="Expandir"
                  >
                    <ChevronDownIcon className="w-5 h-5 rotate-180" />
                  </button>
                )}
                
                {sheetState === 'full' && (
                  <button
                    onClick={() => handleSnapTo('half')}
                    className="p-1 text-slate-400 hover:text-white"
                    aria-label="Minimizar"
                  >
                    <ChevronDownIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Sheet content */}
            <div className="flex-1 overflow-hidden">
              <DetailsPanel
                publication={publication}
                isLiked={isLiked}
                isSaved={isSaved}
                onLike={onLike}
                onSave={onSave}
                onContact={onContact}
                onShare={onShare}
                className="h-full"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}