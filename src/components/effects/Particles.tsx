'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  element: HTMLDivElement
}

export default function Particles() {
  const containerRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const particleCount = 50
    const particles: Particle[] = []

    // Crear partículas
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'absolute rounded-full bg-primary-500/20'
      container.appendChild(particle)

      particles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 10 + 5,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        element: particle
      })
    }

    particlesRef.current = particles

    // Animar partículas
    const animate = () => {
      particles.forEach(particle => {
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Rebote en los bordes
        if (particle.x <= 0 || particle.x >= 100) particle.speedX *= -1
        if (particle.y <= 0 || particle.y >= 100) particle.speedY *= -1

        gsap.set(particle.element, {
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: particle.size,
          height: particle.size
        })
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      particles.forEach(particle => particle.element.remove())
    }
  }, [])

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    />
  )
} 