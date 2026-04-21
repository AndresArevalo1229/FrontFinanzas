import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { type ButtonHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-midnight-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ring-offset-background',
  {
    variants: {
      variant: {
        primary: 'bg-forest-900 text-beige-100 hover:bg-forest-700',
        secondary: 'bg-moss-500 text-forest-900 hover:bg-moss-400',
        ghost: 'text-forest-900 hover:bg-beige-200',
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

  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
