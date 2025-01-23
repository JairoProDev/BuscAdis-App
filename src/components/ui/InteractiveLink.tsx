'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface InteractiveLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  underline?: boolean
  magnetic?: boolean
}

export default function InteractiveLink({
  href,
  children,
  className = '',
  underline = true,
  magnetic = true
}: InteractiveLinkProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!magnetic) return

    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const x = (e.clientX - centerX) * 0.1
    const y = (e.clientY - centerY) * 0.1

    setMousePosition({ x, y })
  }

  return (
    <motion.div
      animate={magnetic ? {
        x: isHovered ? mousePosition.x : 0,
        y: isHovered ? mousePosition.y : 0
      } : undefined}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
    >
      <Link
        href={href}
        className={`relative inline-block ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setMousePosition({ x: 0, y: 0 })
        }}
        onMouseMove={handleMouseMove}
      >
        <motion.span
          className="relative z-10"
          animate={{
            y: isHovered ? -2 : 0,
            color: isHovered ? 'var(--primary)' : 'currentColor'
          }}
        >
          {children}
        </motion.span>

        {underline && (
          <motion.span
            className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ originX: 0 }}
          />
        )}
      </Link>
    </motion.div>
  )
} 