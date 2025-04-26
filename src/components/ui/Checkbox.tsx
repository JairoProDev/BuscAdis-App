import React from 'react'
import { cn } from '@/lib/utils'

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Componente Checkbox estilizado con TailwindCSS
 */
export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      {...props}
      className={cn(
        'h-4 w-4 text-teal-500 bg-slate-800 border border-slate-700 rounded focus:ring-2 focus:ring-teal-500 focus:ring-offset-0',
        className
      )}
    />
  )
} 