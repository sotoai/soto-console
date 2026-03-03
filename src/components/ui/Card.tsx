'use client'

import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  interactive?: boolean
  glass?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingStyles = {
  none: '',
  sm: 'p-5',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({ children, className, interactive, glass, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        glass ? 'glass rounded-[var(--radius-lg)]' : 'card-surface',
        interactive && 'card-interactive cursor-pointer',
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  )
}
