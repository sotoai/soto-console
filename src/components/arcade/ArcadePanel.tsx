'use client'

import { useState, useRef, useCallback, type CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { GameMenu } from './GameMenu'
import { ArcadeOverlay } from './ArcadeOverlay'
import { GAMES } from './games/registry'
import type { NoodlerSnapshot } from './games/noodler/useNoodlerEngine'

interface ArcadePanelProps {
  className?: string
  style?: CSSProperties
}

export function ArcadePanel({ className, style }: ArcadePanelProps) {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const savedStateRef = useRef<NoodlerSnapshot | undefined>(undefined)

  const selectedGame = selectedGameId
    ? GAMES.find(g => g.id === selectedGameId)
    : null

  const handleSelectGame = useCallback((id: string) => {
    savedStateRef.current = undefined
    setSelectedGameId(id)
  }, [])

  const handleBack = useCallback(() => {
    savedStateRef.current = undefined
    setSelectedGameId(null)
  }, [])

  const handleStateChange = useCallback((snapshot: NoodlerSnapshot) => {
    savedStateRef.current = snapshot
  }, [])

  const handleExpand = useCallback(() => {
    setIsFullscreen(true)
  }, [])

  const handleCollapse = useCallback(() => {
    setIsFullscreen(false)
  }, [])

  // Render the game component with all needed props
  const renderGame = (fullscreen: boolean) => {
    if (!selectedGame) return null
    const GameComponent = selectedGame.component
    return (
      <GameComponent
        isFullscreen={fullscreen}
        onExpand={handleExpand}
        onCollapse={handleCollapse}
        initialState={savedStateRef.current}
        onStateChange={handleStateChange}
      />
    )
  }

  return (
    <>
      <div className={className} style={style}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-2">
            {selectedGameId && (
              <button
                onClick={handleBack}
                className="min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center text-[var(--wp-text-secondary)] active:text-[var(--wp-text)] cursor-pointer"
              >
                <ChevronLeft size={20} strokeWidth={1.5} />
              </button>
            )}
            <h3
              className="text-[13px] font-semibold text-[var(--wp-text-tertiary)] uppercase tracking-wider"
              style={{ textShadow: 'var(--wp-shadow)' }}
            >
              {selectedGame ? selectedGame.name : 'Arcade'}
            </h3>
          </div>
        </div>

        {/* Content area — fills remaining space */}
        <div
          className="overflow-hidden relative"
          style={{ height: 'calc(100% - 56px)' }}
        >
          <AnimatePresence mode="wait">
            {!selectedGameId ? (
              <motion.div
                key="menu"
                className="absolute inset-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <GameMenu onSelectGame={handleSelectGame} />
              </motion.div>
            ) : (
              <motion.div
                key={`game-${selectedGameId}`}
                className="absolute inset-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {!isFullscreen && renderGame(false)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fullscreen overlay */}
      <ArcadeOverlay open={isFullscreen} onClose={handleCollapse}>
        {isFullscreen && renderGame(true)}
      </ArcadeOverlay>
    </>
  )
}
