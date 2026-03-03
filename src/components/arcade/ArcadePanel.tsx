'use client'

import { useState, useRef, useCallback, type CSSProperties } from 'react'
import { BentoGrid } from './BentoGrid'
import { ArcadeOverlay } from './ArcadeOverlay'
import { GAMES } from './games/registry'
import type { NoodlerSnapshot } from './games/noodler/useNoodlerEngine'

interface ArcadePanelProps {
  className?: string
  style?: CSSProperties
}

export function ArcadePanel({ className, style }: ArcadePanelProps) {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const savedStateRef = useRef<NoodlerSnapshot | undefined>(undefined)

  const selectedGame = selectedGameId
    ? GAMES.find(g => g.id === selectedGameId)
    : null

  const handleSelectGame = useCallback((id: string) => {
    const game = GAMES.find(g => g.id === id)
    if (!game || game.comingSoon) return
    savedStateRef.current = undefined
    setSelectedGameId(id)
  }, [])

  const handleClose = useCallback(() => {
    savedStateRef.current = undefined
    setSelectedGameId(null)
  }, [])

  const handleStateChange = useCallback((snapshot: NoodlerSnapshot) => {
    savedStateRef.current = snapshot
  }, [])

  return (
    <>
      <div className={className} style={style}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3
            className="text-[13px] font-semibold text-[var(--wp-text-tertiary)] uppercase tracking-wider"
            style={{ textShadow: 'var(--wp-shadow)' }}
          >
            Arcade
          </h3>
        </div>

        {/* Bento grid — always visible */}
        <div
          className="overflow-hidden relative"
          style={{ height: 'calc(100% - 56px)' }}
        >
          <BentoGrid onSelectGame={handleSelectGame} />
        </div>
      </div>

      {/* Game launches directly as fullscreen overlay */}
      <ArcadeOverlay open={!!selectedGameId} onClose={handleClose}>
        {selectedGame?.component && (() => {
          const GameComponent = selectedGame.component!
          return (
            <GameComponent
              isFullscreen
              onCollapse={handleClose}
              initialState={savedStateRef.current}
              onStateChange={handleStateChange}
            />
          )
        })()}
      </ArcadeOverlay>
    </>
  )
}
