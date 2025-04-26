import * as React from "react"
import { cn } from "@/lib/utils"

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    // Combine both onChange and onCheckedChange handlers
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e)
      }
      if (onCheckedChange) {
        onCheckedChange(e.target.checked)
      }
    }

    return (
      <input
        type="checkbox"
        className={cn(
          "h-4 w-4 rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-offset-0",
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    )
  }
)

Checkbox.displayName = "Checkbox"

export { Checkbox } 