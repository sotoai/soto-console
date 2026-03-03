'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: React.ReactNode
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-[var(--accent)] text-white hover:opacity-85 active:opacity-75',
  secondary: 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-strong)]',
  ghost: 'text-[var(--accent)] hover:bg-[var(--accent-soft)] active:bg-[var(--accent-soft)]',
  danger: 'bg-[var(--danger)] text-white hover:opacity-85',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-[13px] gap-1.5 min-h-[44px]',
  md: 'px-5 py-2.5 text-[14px] gap-2 min-h-[44px]',
  lg: 'px-7 py-3 text-[15px] gap-2.5 min-h-[44px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-[var(--radius-md)] transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
