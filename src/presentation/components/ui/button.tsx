import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { type ButtonHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ring-offset-background',
  {
    variants: {
      variant: {
        primary: 'bg-brand-600 text-white hover:bg-brand-500',
        secondary: 'bg-surface-200 text-slate-900 hover:bg-surface-300',
        ghost: 'text-slate-700 hover:bg-surface-200',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-11 px-4',
        lg: 'h-12 px-6',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = ({ className, variant, size, asChild, ...props }: ButtonProps) => {
  const Component = asChild ? Slot : 'button'

  return (
    <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
}
