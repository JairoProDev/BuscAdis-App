import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Componente Input estilizado con TailwindCSS
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      {...props}
      className={cn(
        'w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-400 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
        className
      )}
    />
  )
)
Input.displayName = 'Input' 