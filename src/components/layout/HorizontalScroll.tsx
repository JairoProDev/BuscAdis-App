'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface HorizontalScrollProps {
  children: React.ReactNode
  className?: string
}

export default function HorizontalScroll({ children, className = '' }: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const scrollContainer = scrollRef.current

    if (!container || !scrollContainer) return

    const isMobile = window.innerWidth < 768

    if (!isMobile) return

    const sections = gsap.utils.toArray<HTMLElement>(container.children)
    const totalWidth = sections.reduce((acc, section) => acc + section.offsetWidth, 0)

    gsap.to(sections, {
      x: () => -(totalWidth - window.innerWidth),
      ease: "none",
      scrollTrigger: {
        trigger: scrollContainer,
        pin: true,
        scrub: 1,
        end: () => `+=${totalWidth}`,
        invalidateOnRefresh: true
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
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