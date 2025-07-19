import * as React from "react"
import { cn } from "@/lib/utils"

// Remove empty interface warning by adding a comment
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Extends all standard HTML input attributes
}

/**
 * Componente Input estilizado con TailwindCSS
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input } 