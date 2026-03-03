'use client'

import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-[14px] font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full px-4 py-3 rounded-[var(--radius-md)] text-[15px]',
            'bg-[var(--bg-secondary)] text-[var(--text-primary)]',
            'border border-transparent placeholder:text-[var(--text-muted)]',
            'focus:outline-none focus:bg-[var(--accent-soft)] focus:border-transparent',
            'transition-all duration-200',
            error && 'bg-red-500/5 border-[var(--danger)]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
