import { forwardRef, type InputHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'h-11 w-full rounded-xl border border-moss-300 bg-white px-3 text-sm text-forest-900 shadow-sm outline-none transition placeholder:text-midnight-500 focus:border-midnight-600 focus:ring-2 focus:ring-moss-400',
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
