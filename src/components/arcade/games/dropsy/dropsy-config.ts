// ─── Types ───

export interface FallingDrop {
  id: number
  x: number       // 0..1 normalized horizontal position
  y: number       // 0..1 normalized vertical position (0=top, 1=bottom)
  emoji: string
  isSpicy: boolean
  speed: number   // normalized units per second
}

// ─── Constants ───

export const DROPSY = {
  // ── Dimensions (normalized 0..1 space) ──
  PUG_Y: 0.08,
  PUG_WIDTH: 0.10,
  PUG_HEIGHT: 0.12,
  BASKET_Y: 0.92,
  BASKET_WIDTH: 0.14,
  BASKET_HEIGHT: 0.05,
  DROP_SIZE: 0.035,

  // ── Speed tables (8 levels, indexed by level-1) ──
  PUG_SPEEDS:     [0.15, 0.20, 0.25, 0.30, 0.38, 0.46, 0.54, 0.65],
  DROP_INTERVALS: [1200, 1000,  850,  700,  580,  480,  400,  340],
  FALL_SPEEDS:    [0.25, 0.30, 0.36, 0.42, 0.50, 0.58, 0.66, 0.76],
  SPICY_SPEED_MULT: 1.25,

  // ── Level progression ──
  CATCHES_PER_LEVEL: 15,
  MAX_LEVEL: 8,

  // ── Lives ──
  MAX_LIVES: 3,
  STARTING_LIVES: 3,
  EXTRA_LIFE_EVERY: 1000,

  // ── Spicy mechanic ──
  SPICY_INTERVAL: 25,
  SPICY_JITTER: 5,

  // ── Keyboard ──
  KEYBOARD_SPEED: 0.7,

  // ── Pug AI ──
  PUG_DIRECTION_CHANGE_CHANCE: 0.008,

  // ── Catch detection ──
  CATCH_TOLERANCE_Y: 0.04,

  // ── Colors ──
  BG_COLOR: '#1a0f0a',
  BASKET_COLOR: '#8B4513',
  BASKET_RIM_COLOR: '#A0522D',
  BASKET_WEAVE_COLOR: '#D2691E',
  PUG_FACE_COLOR: '#DEB887',
  PUG_EAR_COLOR: '#C4A265',
  PUG_MASK_COLOR: '#1a1a1a',
  PUG_HAT_COLOR: '#FFFFFF',
  PUG_NOSE_COLOR: '#333333',
  SPICY_GLOW_COLOR: '#EF4444',
} as const

// ─── Emoji pools ───

export const DROP_EMOJIS = ['🍕', '🍩', '🧁', '🍪', '🌮', '🍔', '🍟', '🍎', '🥚', '🧀', '🍰', '🥐']
export const SPICY_EMOJI = '🌶️'
export const DROPSY_EMOJIS = ['🔥', '🌶️', '💯', '🥵', '😤', '⚡', '💥', '🫡', '✨', '🤤', '👑', '😈']
