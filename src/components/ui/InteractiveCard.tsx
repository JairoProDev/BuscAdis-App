'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useState, useRef } from 'react'

interface InteractiveCardProps {
  children: React.ReactNode
  className?: string
  glare?: boolean
  tilt?: boolean
  hover3D?: boolean
}

export default function InteractiveCard({ 
  children, 
  className = '', 
  glare = true,
  tilt = true,
  hover3D = true
}: InteractiveCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Mouse position
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Spring animations
  const springConfig = { damping: 20, stiffness: 300 }
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig)

  // Glare effect
  const glareX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%'])
  const glareY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%'])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const x = (e.clientX - centerX) / (rect.width / 2)
    const y = (e.clientY - centerY) / (rect.height / 2)

    mouseX.set(x)
    mouseY.set(y)
  }

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden rounded-xl ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        mouseX.set(0)
        mouseY.set(0)
      }}
      style={{
        perspective: hover3D ? 1000 : undefined,
        transformStyle: hover3D ? 'preserve-3d' : undefined,
        rotateX: tilt ? rotateX : 0,
        rotateY: tilt ? rotateY : 0
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {children}

      {glare && isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 70%)',
            left: glareX,
            top: glareY
          }}
        />
      )}
    </motion.div>
  )
} 