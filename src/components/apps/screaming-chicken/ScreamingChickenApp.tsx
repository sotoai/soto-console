'use client'

import { useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { HomeScreen } from './screens/HomeScreen'
import { EditorScreen } from './screens/EditorScreen'
import { ExportScreen } from './screens/ExportScreen'
import { useRemixEngine } from './engine/useRemixEngine'
import type { ScreenId } from './config'

interface ScreamingChickenAppProps {
  onClose: () => void
}

export default function ScreamingChickenApp({ onClose }: ScreamingChickenAppProps) {
  const [screen, setScreen] = useState<ScreenId>('home')
  const engine = useRemixEngine()

  const handleVideoLoaded = useCallback(
    (file: File) => {
      engine.loadVideo(file)
      setScreen('editor')
    },
    [engine],
  )

  const handleStartOver = useCallback(() => {
    engine.pause()
    setScreen('home')
  }, [engine])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#0a0a0a' }}
    >
      {/* ── Close Button (always visible) ── */}
      <button
        onClick={() => {
          engine.pause()
          onClose()
        }}
        className="absolute top-4 right-4 z-50 p-2 rounded-full cursor-pointer transition-all active:scale-90"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <X size={18} className="text-white/70" strokeWidth={2.5} />
      </button>

      {/* ── Screens ── */}
      {screen === 'home' && (
        <HomeScreen onVideoLoaded={handleVideoLoaded} />
      )}

      {screen === 'editor' && (
        <EditorScreen engine={engine} onExport={() => setScreen('export')} />
      )}

      {screen === 'export' && (
        <ExportScreen
          engine={engine}
          onBack={() => setScreen('editor')}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  )
}
