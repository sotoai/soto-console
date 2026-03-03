'use client'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="mb-5 p-5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-[15px] text-[var(--text-secondary)] mb-8 max-w-sm">{description}</p>
      {action}
    </div>
  )
}
