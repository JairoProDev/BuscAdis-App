'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'

export function useCursor() {
  useEffect(() => {
    const cursor = document.createElement('div')
    cursor.className = 'custom-cursor'
    document.body.appendChild(cursor)

    const follower = document.createElement('div')
    follower.className = 'cursor-follower'
    document.body.appendChild(follower)

    document.addEventListener('mousemove', (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1
      })
      
      gsap.to(follower, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3
      })
    })

    const handleMouseEnter = () => {
      cursor.classList.add('active')
      follower.classList.add('active')
    }

    const handleMouseLeave = () => {
      cursor.classList.remove('active')
      follower.classList.remove('active')
    }

    const elements = document.querySelectorAll('a, button, [role="button"]')
    elements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter)
      el.addEventListener('mouseleave', handleMouseLeave)
    })

    return () => {
      document.body.removeChild(cursor)
      document.body.removeChild(follower)
      elements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter)
        el.removeEventListener('mouseleave', handleMouseLeave)
      })
    }
  }, [])
} 