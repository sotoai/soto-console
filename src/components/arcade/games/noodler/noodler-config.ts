export type Direction = 'up' | 'down' | 'left' | 'right'

export interface Point {
  x: number
  y: number
}

export const NOODLER = {
  // Grid
  GRID_COLS: 20,
  GRID_ROWS: 20,

  // Speed (ms per tick)
  INITIAL_SPEED: 150,
  MIN_SPEED: 60,
  SPEED_INCREMENT: 3,

  // Initial snake
  INITIAL_LENGTH: 3,
  INITIAL_DIRECTION: 'right' as Direction,

  // Colors
  SNAKE_COLOR: '#4ADE80',
  SNAKE_HEAD_COLOR: '#22C55E',
  FOOD_COLOR: '#F97316',
  GRID_LINE_COLOR: 'rgba(255,255,255,0.03)',
  BG_COLOR: '#0a0f0a',
  BORDER_RADIUS: 2,
} as const

export const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}
