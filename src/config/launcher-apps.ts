// ─── Launcher App Definitions ───

export interface LauncherApp {
  id: string
  name: string
  emoji: string
  gradient: string
  status: 'live' | 'coming-soon'
  url?: string           // future: external URL or internal route
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
    status: 'coming-soon',
  },
]
