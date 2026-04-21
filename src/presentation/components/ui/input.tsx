import { forwardRef, type InputHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'h-11 w-full rounded-xl border border-surface-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200',
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
