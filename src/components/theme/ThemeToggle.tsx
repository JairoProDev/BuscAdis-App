'use client'

import { useThemeContext } from './ThemeProvider'
import { Button } from '@/components/ui/Button'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme, mounted } = useThemeContext()
  const [isAnimating, setIsAnimating] = useState(false)

  // Don't render anything initially while we're figuring out the theme
  if (!mounted) return null

  const toggleTheme = () => {
    setIsAnimating(true)
    setTheme(theme === 'dark' ? 'light' : 'dark')
    
    // Reset animation state after animation completes
    setTimeout(() => setIsAnimating(false), 600)
  }

  return (
    <Button 
      onClick={toggleTheme}
      variant="ghost" 
      size="icon"
      className="relative w-9 h-9 rounded-full overflow-hidden bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
      aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <div className="relative flex items-center justify-center">
        {theme === 'dark' ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
            animate={{ 
              scale: isAnimating ? [0.5, 1.2, 1] : 1, 
              opacity: 1, 
              rotate: isAnimating ? [-30, 0] : 0 
            }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <Moon className="h-5 w-5 text-yellow-300" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: 30 }}
            animate={{ 
              scale: isAnimating ? [0.5, 1.2, 1] : 1, 
              opacity: 1, 
              rotate: isAnimating ? [30, 0] : 0 
            }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <Sun className="h-5 w-5 text-orange-400" />
          </motion.div>
        )}
      </div>
    </Button>
  )
} 