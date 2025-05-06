'use client'

import { createContext, useContext, ReactNode, useEffect } from 'react'
import { useTheme } from '@/hooks/useTheme'
import './light-theme.css'

type ThemeContextType = ReturnType<typeof useTheme>

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useTheme()

  // Fix for CSS parsing issues with Tailwind utility classes containing slashes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Add the modal-overlay class to all modal backgrounds
      const modalBackgrounds = document.querySelectorAll(
        '.bg-black\\/20, .bg-black\\/70, .bg-slate-800\\/80, .bg-slate-900\\/90'
      );
      
      modalBackgrounds.forEach(el => {
        el.classList.add('modal-overlay');
      });
      
      // For semi-transparent header on scroll
      const header = document.querySelector('header');
      if (header) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              header.classList.remove('scrolled');
            } else {
              header.classList.add('scrolled');
            }
          },
          { threshold: 0, rootMargin: '-100px 0px 0px 0px' }
        );
        
        observer.observe(document.documentElement);
        
        return () => {
          observer.disconnect();
        };
      }
    }
  }, []);

  // Set initial theme class on the body to avoid flash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      if (theme.theme === 'dark') {
        root.classList.add('dark')
        root.classList.remove('light')
      } else {
        root.classList.add('light')
        root.classList.remove('dark')
      }
    }
  }, [theme.theme])

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
} 