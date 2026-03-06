// ─── Launcher App Definitions ───

import type { ComponentType } from 'react'

export interface LauncherApp {
  id: string
  name: string
  emoji: string
  gradient: string
  status: 'live' | 'coming-soon'
  url?: string                                     // external URL
  component?: ComponentType<{ onClose: () => void }>  // fullscreen overlay component
}

export const launcherApps: LauncherApp[] = [
  {
    id: 'gif-maker',
    name: 'GIF Maker',
    emoji: '🎬',
    gradient: 'from-purple-500 to-pink-500',
    status: 'coming-soon',
  },
  {
    id: 'resume-builder',
    name: 'Resume Builder',
    emoji: '📄',
    gradient: 'from-blue-500 to-cyan-500',
    status: 'coming-soon',
  },
  {
    id: 'screaming-chicken',
    name: 'Screaming Chicken',
    emoji: '🐔',
    gradient: 'from-yellow-400 to-orange-500',
    status: 'live',
    // component is lazy-loaded in AppLauncher to avoid SSR issues
  },
]
