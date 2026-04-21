import { type HTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-moss-300 bg-white/90 p-6 shadow-sm backdrop-blur-sm',
        className,
      )}
      {...props}
    />
  )
}
