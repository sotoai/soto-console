import type { LucideIcon } from 'lucide-react'
import type { ComponentType } from 'react'
import type Database from 'better-sqlite3'

/* ========================================
   HOMEBASE — SHARED TYPES
   ======================================== */

// Navigation item used by app sidebars
export interface NavItem {
  href: string       // Relative to app's basePath (e.g., '/', '/games')
  label: string
  icon: LucideIcon
}

// Widget props passed to each app's widget component on the home screen
export interface WidgetProps {
  className?: string
  style?: React.CSSProperties
}

// App manifest — each sub-app registers one of these
export interface AppManifest {
  id: string
  name: string
  description: string
  icon: LucideIcon
  gradient: string                            // Tailwind gradient classes (e.g., 'from-blue-500 to-violet-500')
  basePath: string                            // e.g., '/apps/game-roulette'
  navItems: NavItem[]
  widget: ComponentType<WidgetProps>          // Compact widget for home screen
  initSchema: (db: Database.Database) => void // Creates app-specific tables
}

// Page title mapping for headers
export interface PageTitle {
  title: string
  subtitle: string
}
