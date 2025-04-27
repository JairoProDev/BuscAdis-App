'use client'

import React from 'react'
import { MapPinIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface MapButtonProps {
  isActive: boolean
  onClick: () => void
  className?: string
}

export function MapButton({ isActive, onClick, className }: MapButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg transition-all',
        isActive
          ? 'bg-teal-600 text-white hover:bg-teal-700'
          : 'bg-slate-700 text-slate-200 hover:bg-slate-600',
        className
      )}
      aria-label={isActive ? 'Ocultar mapa' : 'Mostrar mapa'}
    >
      <MapPinIcon className="w-5 h-5" />
      <span className="font-medium">{isActive ? 'Ocultar mapa' : 'Mostrar mapa'}</span>
    </button>
  )
} 