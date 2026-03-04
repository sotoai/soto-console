'use client'

import { TETROMINOES, PIECE_COLORS, PIECE_HIGHLIGHT, type PieceType } from './chunko-config'
import type { GameState } from '../types'

interface NextPiecePreviewProps {
  pieceType: PieceType
  score: number
  level: number
  linesCleared: number
  highScore: number
  gameState: GameState
}

const CELL = 16
const GRID = 4

function PieceGrid({ type }: { type: PieceType }) {
  const offsets = TETROMINOES[type][0] // rotation 0
  const color = PIECE_COLORS[type]
  const highlight = PIECE_HIGHLIGHT[type]

  // Build 4×4 grid
  const grid: boolean[][] = Array.from({ length: GRID }, () => Array(GRID).fill(false))
  for (const [r, c] of offsets) {
    if (r < GRID && c < GRID) grid[r][c] = true
  }

  // Find bounding box to center the piece
  let minR = GRID, maxR = 0, minC = GRID, maxC = 0
  for (const [r, c] of offsets) {
    minR = Math.min(minR, r)
    maxR = Math.max(maxR, r)
    minC = Math.min(minC, c)
    maxC = Math.max(maxC, c)
  }
  const pieceH = maxR - minR + 1
  const pieceW = maxC - minC + 1

  return (
    <div
      className="mx-auto"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${pieceW}, ${CELL}px)`,
        gridTemplateRows: `repeat(${pieceH}, ${CELL}px)`,
        gap: 1,
      }}
    >
      {Array.from({ length: pieceH }, (_, r) =>
        Array.from({ length: pieceW }, (_, c) => {
          const filled = grid[minR + r]?.[minC + c]
          return (
            <div
              key={`${r}-${c}`}
              style={{
                width: CELL,
                height: CELL,
                borderRadius: 2,
                ...(filled
                  ? {
                      background: color,
                      borderTop: `2px solid ${highlight}`,
                      borderLeft: `2px solid ${highlight}`,
                      borderBottom: '2px solid rgba(0,0,0,0.3)',
                      borderRight: '2px solid rgba(0,0,0,0.3)',
                    }
                  : {
                      background: 'transparent',
                    }),
              }}
            />
          )
        })
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-wider text-white/30">{label}</p>
      <p className="text-[14px] font-mono tabular-nums font-bold text-white/80">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  )
}

export function NextPiecePreview({
  pieceType,
  score,
  level,
  linesCleared,
  highScore,
  gameState,
}: NextPiecePreviewProps) {
  const showPreview = gameState !== 'idle'

  return (
    <div className="flex flex-col gap-5 py-2">
      {/* Next piece */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-3 text-center">
          Next
        </p>
        <div
          className="flex items-center justify-center rounded-lg"
          style={{
            height: 80,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {showPreview ? (
            <PieceGrid type={pieceType} />
          ) : (
            <span className="text-[11px] text-white/20">—</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-3">
        <Stat label="Score" value={score} />
        <Stat label="Level" value={level} />
        <Stat label="Lines" value={linesCleared} />
        <Stat label="Best" value={highScore} />
      </div>
    </div>
  )
}
