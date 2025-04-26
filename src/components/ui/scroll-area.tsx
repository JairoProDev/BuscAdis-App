'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Dirección del scroll. 
   * 'horizontal' → overflow-x, 
   * 'vertical' → overflow-y
   */
  orientation?: 'horizontal' | 'vertical'
  children: React.ReactNode
}

/**
 * Wrapper que aplica overflow auto en X o Y
 * y estilos de scroll fino con Tailwind.
 */
export const ScrollArea: React.FC<ScrollAreaProps> = ({
  orientation = 'vertical',
  className,
  children,
  ...props
}) => {
  const overflowClass =
    orientation === 'horizontal'
      ? 'overflow-x-auto whitespace-nowrap'
      : 'overflow-y-auto'
  return (
    <div
      className={cn(
        overflowClass,
        // necesitas activar el plugin scrollbar en tailwind.config.ts
        'scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
}

/**
 * Componente meramente informativo. Si quieres dibujar
 * una barra custom, aquí puedes posicionarlo. 
 * Por defecto renderiza un track simple.
 */
export const ScrollBar: React.FC<ScrollBarProps> = ({
  orientation = 'horizontal',
  className,
  ...props
}) => {
  const sizeClass =
    orientation === 'horizontal'
      ? 'h-2 w-full'
      : 'w-2 h-full'

  return (
    <div
      className={cn(sizeClass, 'bg-slate-700 rounded-full', className)}
      {...props}
    />
  )
}
