// ─── Board ───
export const COLS = 10
export const ROWS = 20

// ─── Piece types ───
export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'
export const PIECE_TYPES: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']

// Each rotation state is an array of 4 [row, col] offsets from the piece origin.
// 4 rotation states: 0 = spawn, 1 = CW, 2 = 180°, 3 = CCW
type RotationStates = [number, number][][]

export const TETROMINOES: Record<PieceType, RotationStates> = {
  I: [
    [[1,0],[1,1],[1,2],[1,3]],  // 0 — flat
    [[0,2],[1,2],[2,2],[3,2]],  // 1
    [[2,0],[2,1],[2,2],[2,3]],  // 2
    [[0,1],[1,1],[2,1],[3,1]],  // 3
  ],
  O: [
    [[0,1],[0,2],[1,1],[1,2]],
    [[0,1],[0,2],[1,1],[1,2]],
    [[0,1],[0,2],[1,1],[1,2]],
    [[0,1],[0,2],[1,1],[1,2]],
  ],
  T: [
    [[0,1],[1,0],[1,1],[1,2]],
    [[0,1],[1,1],[1,2],[2,1]],
    [[1,0],[1,1],[1,2],[2,1]],
    [[0,1],[1,0],[1,1],[2,1]],
  ],
  S: [
    [[0,1],[0,2],[1,0],[1,1]],
    [[0,1],[1,1],[1,2],[2,2]],
    [[1,1],[1,2],[2,0],[2,1]],
    [[0,0],[1,0],[1,1],[2,1]],
  ],
  Z: [
    [[0,0],[0,1],[1,1],[1,2]],
    [[0,2],[1,1],[1,2],[2,1]],
    [[1,0],[1,1],[2,1],[2,2]],
    [[0,1],[1,0],[1,1],[2,0]],
  ],
  J: [
    [[0,0],[1,0],[1,1],[1,2]],
    [[0,1],[0,2],[1,1],[2,1]],
    [[1,0],[1,1],[1,2],[2,2]],
    [[0,1],[1,1],[2,0],[2,1]],
  ],
  L: [
    [[0,2],[1,0],[1,1],[1,2]],
    [[0,1],[1,1],[2,1],[2,2]],
    [[1,0],[1,1],[1,2],[2,0]],
    [[0,0],[0,1],[1,1],[2,1]],
  ],
}

// ─── Colors ───
export const PIECE_COLORS: Record<PieceType, string> = {
  I: '#06B6D4',
  O: '#FACC15',
  T: '#A855F7',
  S: '#22C55E',
  Z: '#EF4444',
  J: '#3B82F6',
  L: '#F97316',
}

// Lighter shade for inner highlights (3D effect)
export const PIECE_HIGHLIGHT: Record<PieceType, string> = {
  I: '#22D3EE',
  O: '#FDE047',
  T: '#C084FC',
  S: '#4ADE80',
  Z: '#F87171',
  J: '#60A5FA',
  L: '#FB923C',
}

export const BG_COLOR = '#0a0a1a'
export const GRID_LINE_COLOR = 'rgba(255,255,255,0.03)'
export const GHOST_ALPHA = 0.2
export const BORDER_COLOR = 'rgba(255,255,255,0.06)'

// ─── Speed & timing ───
export const INITIAL_SPEED = 800   // ms per gravity tick at level 1
export const SPEED_FLOOR = 100     // fastest possible
export const SPEED_STEP = 50       // ms decrease per level
export const LOCK_DELAY = 500      // ms before piece locks
export const MAX_LOCK_RESETS = 15  // max lock delay resets per piece

// ─── Scoring ───
export const LINE_SCORES: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800, // CHUNKO!
}
export const SOFT_DROP_SCORE = 1   // per row
export const HARD_DROP_SCORE = 2   // per row
export const LINES_PER_LEVEL = 10

// ─── SRS Wall Kicks ───
// Tests are [col, row] offsets — applied in order until one succeeds
// Index: rotation transition (from → to)

// For T, S, Z, J, L pieces
const JLSTZ_KICKS: Record<string, [number, number][]> = {
  '0>1': [[ 0, 0],[-1, 0],[-1, 1],[ 0,-2],[-1,-2]],
  '1>0': [[ 0, 0],[ 1, 0],[ 1,-1],[ 0, 2],[ 1, 2]],
  '1>2': [[ 0, 0],[ 1, 0],[ 1,-1],[ 0, 2],[ 1, 2]],
  '2>1': [[ 0, 0],[-1, 0],[-1, 1],[ 0,-2],[-1,-2]],
  '2>3': [[ 0, 0],[ 1, 0],[ 1, 1],[ 0,-2],[ 1,-2]],
  '3>2': [[ 0, 0],[-1, 0],[-1,-1],[ 0, 2],[-1, 2]],
  '3>0': [[ 0, 0],[-1, 0],[-1,-1],[ 0, 2],[-1, 2]],
  '0>3': [[ 0, 0],[ 1, 0],[ 1, 1],[ 0,-2],[ 1,-2]],
}

// For I piece
const I_KICKS: Record<string, [number, number][]> = {
  '0>1': [[ 0, 0],[-2, 0],[ 1, 0],[-2,-1],[ 1, 2]],
  '1>0': [[ 0, 0],[ 2, 0],[-1, 0],[ 2, 1],[-1,-2]],
  '1>2': [[ 0, 0],[-1, 0],[ 2, 0],[-1, 2],[ 2,-1]],
  '2>1': [[ 0, 0],[ 1, 0],[-2, 0],[ 1,-2],[-2, 1]],
  '2>3': [[ 0, 0],[ 2, 0],[-1, 0],[ 2, 1],[-1,-2]],
  '3>2': [[ 0, 0],[-2, 0],[ 1, 0],[-2,-1],[ 1, 2]],
  '3>0': [[ 0, 0],[ 1, 0],[-2, 0],[ 1,-2],[-2, 1]],
  '0>3': [[ 0, 0],[-1, 0],[ 2, 0],[-1, 2],[ 2,-1]],
}

export function getKicks(piece: PieceType, from: number, to: number): [number, number][] {
  const key = `${from}>${to}`
  if (piece === 'I') return I_KICKS[key] ?? [[0, 0]]
  if (piece === 'O') return [[0, 0]]
  return JLSTZ_KICKS[key] ?? [[0, 0]]
}

// ─── Helpers ───
export function getSpeed(level: number): number {
  return Math.max(SPEED_FLOOR, INITIAL_SPEED - (level - 1) * SPEED_STEP)
}

// Spawn position: top-center of the board
export function spawnPosition(): { row: number; col: number } {
  return { row: 0, col: Math.floor((COLS - 4) / 2) }
}

// ─── CHUNKO! celebration emoji pool ───
export const CHUNKO_EMOJIS = ['🔥', '🎉', '⚡', '💥', '🙌', '🤯', '💜', '✨', '🏆', '👑', '💎', '🚀']
