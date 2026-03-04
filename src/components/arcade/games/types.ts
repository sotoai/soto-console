import type { LucideIcon } from 'lucide-react'
import type { ComponentType } from 'react'

export type GameState = 'idle' | 'playing' | 'paused' | 'gameover'

export type TileSize = 'large' | 'medium' | 'small'

export interface GameComponentProps {
  isFullscreen?: boolean
  onExpand?: () => void
  onCollapse?: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialState?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onStateChange?: (state: any) => void
  onScoreSubmit?: (gameId: string, score: number) => void
}

export interface GameDefinition {
  id: string
  name: string
  description: string
  icon: LucideIcon
  gradient: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any> | null
  tileSize: TileSize
  comingSoon?: boolean
  emoji?: string
  tagline?: string
}
