'use client'

import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
  success: 'bg-emerald-500/8 text-[var(--success)]',
  warning: 'bg-amber-500/8 text-[var(--warning)]',
  danger: 'bg-red-500/8 text-[var(--danger)]',
  info: 'bg-cyan-500/8 text-[var(--info)]',
  accent: 'bg-[var(--accent-soft)] text-[var(--accent)]',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
