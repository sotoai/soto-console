import type { LucideIcon } from 'lucide-react'

interface SmartHomeHeaderProps {
  title: string
  icon: LucideIcon
  statusText: string
  statusColor?: string
}

export function SmartHomeHeader({ title, icon: Icon, statusText, statusColor }: SmartHomeHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} className="text-[var(--wp-text-tertiary)] shrink-0" />
      <span className="text-[11px] font-semibold text-[var(--wp-text-tertiary)] uppercase tracking-wider">
        {title}
      </span>
      <div className="flex-1" />
      <span className="text-[10px] font-medium tracking-wide" style={{ color: statusColor || 'var(--wp-text-muted)' }}>
        {statusText}
      </span>
    </div>
  )
}
