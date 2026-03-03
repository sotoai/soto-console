import { Smartphone } from 'lucide-react'
import { NoodlerGame } from './noodler/NoodlerGame'
import type { GameDefinition } from './types'

export const GAMES: GameDefinition[] = [
  {
    id: 'noodler',
    name: 'Noodler',
    description: 'The classic snake game',
    icon: Smartphone,
    gradient: 'from-green-500 to-emerald-600',
    component: NoodlerGame,
  },
]
