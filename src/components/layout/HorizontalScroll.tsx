'use client'

import { useRef, useEffect } from 'react'
// import { gsap } from 'gsap' // GSAP not installed, commenting out
// import { ScrollTrigger } from 'gsap/ScrollTrigger'

// gsap.registerPlugin(ScrollTrigger)

interface HorizontalScrollProps {
  children: React.ReactNode
  className?: string
}

export default function HorizontalScroll({ children, className = '' }: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simple horizontal scroll implementation without GSAP
    const container = containerRef.current
    const scrollContainer = scrollRef.current

    if (!container || !scrollContainer) return

    // Simple CSS-based horizontal scroll for mobile
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      container.style.overflowX = 'auto'
      container.style.display = 'flex'
    }
  }, [])

  return (
    <div ref={scrollRef} className={`overflow-hidden ${className}`}>
      <div 
        ref={containerRef} 
        className="flex md:block"
      >
        {children}
      </div>
    </div>
  )
} 