import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

import { cn } from '../lib/utils'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'border-surface-4 bg-surface-1 text-foreground outline-none focus:outline-none focus-visible:outline-none flex h-11 w-full rounded-xl border px-4 text-sm shadow-inner shadow-black/5 transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
