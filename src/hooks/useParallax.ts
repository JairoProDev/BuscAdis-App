'use client'

import { useEffect, useRef } from 'react'

// Conditionally import gsap if available
let gsap: any = null;
let ScrollTrigger: any = null;
try {
  gsap = import('gsap').then(module => module.gsap);
  ScrollTrigger = import('gsap/ScrollTrigger').then(module => module.ScrollTrigger);
  if (gsap && ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }
} catch (error) {
  // gsap not available, hook will be disabled
}

interface ParallaxOptions {
  speed?: number
  direction?: 'vertical' | 'horizontal'
  container?: boolean
}

export function useParallax(options: ParallaxOptions = {}) {
  const elementRef = useRef<HTMLDivElement>(null)
  const { speed = 1, direction = 'vertical', container = false } = options

  useEffect(() => {
    if (!gsap || !ScrollTrigger || typeof window === 'undefined') {
      // Disable parallax effects if gsap is not available or on server
      return;
    }

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
        onUpdate: (self: any) => {
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

export function useParallaxImage(speed: number = 0.3) {
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!gsap || !ScrollTrigger || typeof window === 'undefined') {
      return;
    }

    const image = imageRef.current
    if (!image) return

    const animation = gsap.fromTo(image,
      {
        y: 0
      },
      {
        y: -100 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: image.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self: any) => {
            const progress = self.progress
            const distance = 100 * progress * speed
            const transform = `translateY(${distance}px)`
            
            if (image) {
              image.style.transform = transform
            }
          }
        }
      }
    )

    return () => {
      animation.kill()
    }
  }, [speed])

  return imageRef
} 