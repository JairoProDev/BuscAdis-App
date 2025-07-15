'use client'

import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  // Initialize with light theme as the default, no localStorage access during SSR
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Read the theme from localStorage ONLY after mounting
    try {
      const storedTheme = localStorage.getItem('theme') as Theme | null
      if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
        setTheme(storedTheme)
      } else {
        // If no theme is stored, use light theme
        localStorage.setItem('theme', 'light')
      }
    } catch {
      // Fallback if localStorage is not available
      console.warn('localStorage not available, using light theme')
    }
  }, [])

  useEffect(() => {
    if (!mounted) return // Only run effect after mount

    const root = window.document.documentElement
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const activeTheme = theme === 'system' ? systemTheme : theme

    root.classList.remove('light', 'dark') // Remove previous theme classes
    root.classList.add(activeTheme) // Add the current theme class
    
    // Remove the data-theme attribute if you are using class-based theming
    root.removeAttribute('data-theme') 
    
    localStorage.setItem('theme', theme) // Save the selected theme
  }, [theme, mounted])

  return { theme, setTheme, mounted }
} 