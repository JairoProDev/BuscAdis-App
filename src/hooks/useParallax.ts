'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ParallaxOptions {
  speed?: number
  direction?: 'vertical' | 'horizontal'
  container?: boolean
}

export function useParallax(options: ParallaxOptions = {}) {
  const elementRef = useRef<HTMLDivElement>(null)
  const { speed = 1, direction = 'vertical', container = false } = options

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const parallaxEffect = () => {
      const scrollPosition = window.scrollY
      const elementPosition = element.offsetTop
      const viewportHeight = window.innerHeight
      const elementHeight = element.offsetHeight

      if (
        scrollPosition + viewportHeight >= elementPosition &&
        scrollPosition <= elementPosition + elementHeight
      ) {
        const distance = (scrollPosition - elementPosition) * speed
        const transform = direction === 'vertical' 
          ? `translateY(${distance}px)`
          : `translateX(${distance}px)`
        
        gsap.to(element, {
          transform,
          ease: 'none',
          duration: 0.1
        })
      }
    }

    if (container) {
      ScrollTrigger.create({
        trigger: element,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const progress = self.progress
          const distance = 100 * progress * speed
          const transform = direction === 'vertical'
            ? `translateY(${distance}px)`
            : `translateX(${distance}px)`
          
          gsap.to(element, {
            transform,
            ease: 'none',
            duration: 0.1
          })
        }
      })
    } else {
      window.addEventListener('scroll', parallaxEffect)
      return () => window.removeEventListener('scroll', parallaxEffect)
    }
  }, [speed, direction, container])

  return elementRef
} 