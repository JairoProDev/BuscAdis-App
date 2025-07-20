// src/components/layout/MobileNavigation.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useScroll } from 'framer-motion'
import NavigationMenu from './NavigationMenu'
import AdisChat from './AdisChat'

export default function MobileNavigation() {
  const [isVisible, setIsVisible] = useState(true)
  const [showAdisChat, setShowAdisChat] = useState(false)
  const { scrollY } = useScroll()
  const lastScrollYRef = useRef(0)

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      const direction = latest > lastScrollYRef.current ? 'down' : 'up'
      if (direction === 'down' && latest > 150) { 
        if (isVisible) setIsVisible(false) 
      } else { 
        if (!isVisible) setIsVisible(true) 
      }
      lastScrollYRef.current = latest
    })
  }, [scrollY, isVisible])

  return (
    <>
      <motion.nav
        aria-label="Navegación principal en móvil"
        className="fixed bottom-0 left-0 right-0 z-40 h-20 md:hidden"
        initial={false}
        animate={{ y: isVisible ? 0 : 100 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-700/60" />
        <NavigationMenu 
          variant="mobile"
          onAdisClick={() => setShowAdisChat(!showAdisChat)}
          showAdisChat={showAdisChat}
        />
      </motion.nav>
      
      <div className="h-20 md:hidden" aria-hidden="true" />

      <AdisChat 
        isOpen={showAdisChat} 
        onClose={() => setShowAdisChat(false)} 
      />
    </>
  )
}