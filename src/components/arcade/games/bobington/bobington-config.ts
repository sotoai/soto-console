// ─── Bobington — Config & Types ───

// ── Pad identifiers ──
export type PadColor = 'green' | 'red' | 'yellow' | 'blue'

// ── Game phases (internal, more granular than arcade GameState) ──
export type BobingtonPhase =
  | 'idle'       // Title + player count selector
  | 'playback'   // System playing back the sequence
  | 'input'      // Current player replaying + adding one
  | 'success'    // Brief flash after correct turn
  | 'failure'    // Player got it wrong
  | 'gameover'   // Final results

// ── Pad definition ──
export interface PadDefinition {
  color: PadColor
  baseColor: string
  activeColor: string
  glowColor: string
  frequency: number // Hz for Web Audio sine tone
}

// ── Player state ──
export interface PlayerState {
  name: string
  isEliminated: boolean
  roundSurvived: number // last round they survived
}

// ── Snapshot for pause/resume ──
export interface BobingtonSnapshot {
  sequence: PadColor[]
  players: PlayerState[]
  currentPlayerIndex: number
  score: number
  phase: BobingtonPhase
  playerCount: number
}

// ── Constants ──
export const BOBINGTON = {
  // Pad layout
  PAD_GAP: 0.03,
  PAD_CORNER_RADIUS: 0.06,
  CENTER_CIRCLE_RADIUS: 0.13,

  // Timing (ms)
  PLAYBACK_NOTE_DURATION: 400,
  PLAYBACK_GAP_DURATION: 100,
  PLAYBACK_SPEEDUP_PER_ROUND: 15,
  MIN_NOTE_DURATION: 150,
  INPUT_FLASH_DURATION: 250,
  SUCCESS_DELAY: 600,
  FAILURE_DISPLAY_DURATION: 2000,

  // Players
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 4,
  DEFAULT_PLAYER_NAMES: ['Player 1', 'Player 2', 'Player 3', 'Player 4'],

  // Audio
  AUDIO_TYPE: 'sine' as OscillatorType,
  AUDIO_GAIN: 0.3,
  AUDIO_DURATION: 250, // ms tone length for taps
  SUCCESS_FREQ: 880,
  SUCCESS_FREQ_2: 1320,
  FAILURE_FREQ: 150,

  // Colors
  BG_COLOR: '#0d0d1a',
  CENTER_COLOR: '#1a1a2e',
  CENTER_BORDER_COLOR: 'rgba(255,255,255,0.08)',

  // localStorage
  HIGHSCORE_KEY: 'bobington-highscore',
} as const

// ── Pad definitions ──
export const PADS: PadDefinition[] = [
  {
    color: 'green',
    baseColor: '#14532d',
    activeColor: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.5)',
    frequency: 392.0, // G4
  },
  {
    color: 'red',
    baseColor: '#991b1b',
    activeColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    frequency: 329.63, // E4
  },
  {
    color: 'yellow',
    baseColor: '#713f12',
    activeColor: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.5)',
    frequency: 440.0, // A4
  },
  {
    color: 'blue',
    baseColor: '#1e3a5f',
    activeColor: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.5)',
    frequency: 261.63, // C4
  },
]

// ── Pad quadrant positions ──
// green=TL, red=TR, yellow=BL, blue=BR
export const PAD_QUADRANTS: Record<PadColor, { row: number; col: number }> = {
  green: { row: 0, col: 0 },
  red: { row: 0, col: 1 },
  yellow: { row: 1, col: 0 },
  blue: { row: 1, col: 1 },
}

// ── Keyboard mappings ──
export const KEY_TO_PAD: Record<string, PadColor> = {
  '1': 'green',
  '2': 'red',
  '3': 'yellow',
  '4': 'blue',
  q: 'green',
  w: 'red',
  a: 'yellow',
  s: 'blue',
}

// ── Celebration emojis ──
export const BOBINGTON_EMOJIS = [
  '🧠', '🔥', '💡', '✨', '🎯', '👑', '💥', '🏆', '⚡', '🤯',
]

// ── Helpers ──
export function getPadDef(color: PadColor): PadDefinition {
  return PADS.find(p => p.color === color)!
}

export function randomPad(): PadColor {
  const colors: PadColor[] = ['green', 'red', 'yellow', 'blue']
  return colors[Math.floor(Math.random() * colors.length)]
}

/** Note duration for a given round (gets faster) */
export function noteDuration(round: number): number {
  return Math.max(
    BOBINGTON.MIN_NOTE_DURATION,
    BOBINGTON.PLAYBACK_NOTE_DURATION - round * BOBINGTON.PLAYBACK_SPEEDUP_PER_ROUND,
  )
}
