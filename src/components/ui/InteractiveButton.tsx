'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface InteractiveButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  ripple?: boolean
  magnetic?: boolean
}

export default function InteractiveButton({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  ripple = true,
  magnetic = true
}: InteractiveButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [rippleEffect, setRippleEffect] = useState({ x: 0, y: 0, show: false })

  const baseStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-success-600 text-white hover:bg-success-700',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50'
  }

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple) {
      const rect = e.currentTarget.getBoundingClientRect()
      setRippleEffect({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        show: true
      })
    }
    setIsPressed(true)
  }

  const handleMouseUp = () => {
    setIsPressed(false)
    setTimeout(() => setRippleEffect(prev => ({ ...prev, show: false })), 300)
  }

  return (
    <motion.button
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`
        relative overflow-hidden rounded-lg font-medium transition-all
        ${baseStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      whileHover={magnetic ? { scale: 1.05 } : undefined}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        className="relative z-10"
        animate={{ y: isPressed ? 2 : 0 }}
      >
        {children}
      </motion.span>

      {ripple && rippleEffect.show && (
        <motion.span
          className="absolute bg-white/30 rounded-full pointer-events-none"
          initial={{
            width: 0,
            height: 0,
            x: rippleEffect.x,
            y: rippleEffect.y,
            opacity: 0.5,
          }}
          animate={{
            width: 500,
            height: 500,
            x: rippleEffect.x - 250,
            y: rippleEffect.y - 250,
            opacity: 0,
          }}
          transition={{
            duration: 0.5,
            ease: 'easeOut',
          }}
        />
      )}
    </motion.button>
  )
} 