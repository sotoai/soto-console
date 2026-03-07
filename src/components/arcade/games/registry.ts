import {
  Smartphone,
  Blocks,
  Dog,
  Brain,
  Puzzle,
  Car,
  Sword,
  Spade,
  Crosshair,
  Palette,
  Zap,
  Gem,
} from 'lucide-react'
import { NoodlerGame } from './noodler/NoodlerGame'
import { ChunkoGame } from './chunko/ChunkoGame'
import { DropsyGame } from './dropsy/DropsyGame'
import { BobingtonGame } from './bobington/BobingtonGame'
import type { GameDefinition } from './types'

export const GAMES: GameDefinition[] = [
  // ── Featured (large 2×2) ──
  {
    id: 'noodler',
    name: 'Noodler',
    description: 'The classic snake game',
    tagline: 'Swipe to survive',
    icon: Smartphone,
    emoji: '🐍',
    gradient: 'from-green-500 to-emerald-600',
    component: NoodlerGame,
    tileSize: 'large',
  },

  // ── Medium tiles (2×1) ──
  {
    id: 'chunko',
    name: 'Chunko',
    description: 'Classic block stacker',
    tagline: 'Stack. Clear. CHUNKO!',
    icon: Blocks,
    emoji: '🧱',
    gradient: 'from-cyan-500 to-blue-600',
    component: ChunkoGame,
    tileSize: 'medium',
  },

  {
    id: 'dropsy',
    name: 'Dropsy',
    description: 'Catch the falling food!',
    tagline: "Don't let it drop!",
    icon: Dog,
    emoji: '🐶',
    gradient: 'from-amber-500 to-orange-600',
    component: DropsyGame,
    tileSize: 'medium',
  },

  {
    id: 'bobington',
    name: 'Bobington',
    description: 'Multiplayer memory challenge',
    tagline: 'Remember the sequence',
    icon: Brain,
    emoji: '🧠',
    gradient: 'from-violet-500 to-indigo-600',
    component: BobingtonGame,
    tileSize: 'medium',
  },

  // ── Small tiles (1×1) ──
  {
    id: 'driftr',
    name: 'Driftr',
    description: 'Endless road racer',
    tagline: "Don't crash",
    icon: Car,
    emoji: '🏎️',
    gradient: 'from-orange-500 to-red-600',
    component: null,
    tileSize: 'small',
    comingSoon: true,
  },
  {
    id: 'questor',
    name: 'Questor',
    description: 'Micro RPG adventure',
    tagline: 'Choose your path',
    icon: Sword,
    emoji: '⚔️',
    gradient: 'from-amber-500 to-yellow-600',
    component: null,
    tileSize: 'small',
    comingSoon: true,
  },

  // ── Medium ──
  {
    id: 'gridlock',
    name: 'Gridlock',
    description: 'Slide puzzle challenge',
    tagline: 'Slide to solve',
    icon: Puzzle,
    emoji: '🧩',
    gradient: 'from-purple-500 to-fuchsia-600',
    component: null,
    tileSize: 'medium',
    comingSoon: true,
  },

  // ── Small tiles ──
  {
    id: 'deckd',
    name: "Deck'd",
    description: 'Quick card battles',
    tagline: 'Draw. Play. Win.',
    icon: Spade,
    emoji: '🃏',
    gradient: 'from-rose-500 to-pink-600',
    component: null,
    tileSize: 'small',
    comingSoon: true,
  },
  {
    id: 'aimr',
    name: 'Aimr',
    description: 'Precision target practice',
    tagline: 'Hit the mark',
    icon: Crosshair,
    emoji: '🎯',
    gradient: 'from-red-500 to-orange-600',
    component: null,
    tileSize: 'small',
    comingSoon: true,
  },

  // ── Medium ──
  {
    id: 'chromatic',
    name: 'Chromatic',
    description: 'Color matching frenzy',
    tagline: 'Match the spectrum',
    icon: Palette,
    emoji: '🎨',
    gradient: 'from-indigo-500 to-violet-600',
    component: null,
    tileSize: 'medium',
    comingSoon: true,
  },

  // ── Small tiles ──
  {
    id: 'bouncer',
    name: 'Bouncer',
    description: 'Ball bounce physics',
    tagline: 'Keep it alive',
    icon: Zap,
    emoji: '⚡',
    gradient: 'from-sky-500 to-blue-600',
    component: null,
    tileSize: 'small',
    comingSoon: true,
  },
  {
    id: 'voltaic',
    name: 'Voltaic',
    description: 'Chain reaction puzzler',
    tagline: 'Connect the charge',
    icon: Gem,
    emoji: '🔮',
    gradient: 'from-violet-500 to-purple-700',
    component: null,
    tileSize: 'small',
    comingSoon: true,
  },
]
