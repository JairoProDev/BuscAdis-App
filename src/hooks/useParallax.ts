'use client'

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function useParallax() {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!elementRef.current || typeof window === 'undefined') return;

    const element = elementRef.current;

    // Create parallax effect
    const tl = gsap.fromTo(
      element,
      { y: 0 },
      {
        y: -100,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );

    return () => {
      if (tl) {
        tl.kill();
      }
    };
  }, []);

  return elementRef;
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
          onUpdate: (self: { progress: number }) => {
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