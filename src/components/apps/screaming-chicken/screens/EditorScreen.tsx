'use client'

import { useState } from 'react'
import { Sparkles, Music, Palette } from 'lucide-react'
import { VideoPreview } from '../components/VideoPreview'
import { BeatBlockStrip } from '../components/BeatBlockStrip'
import { EffectTray } from '../components/EffectTray'
import { VibePicker } from '../components/VibePicker'
import { SoundPicker } from '../components/SoundPicker'
import { TrimSlider } from '../components/TrimSlider'
import { TextPopEditor } from '../components/TextPopEditor'
import type { UseRemixEngine } from '../engine/useRemixEngine'
import { VIBES } from '../config'

interface EditorScreenProps {
  engine: UseRemixEngine
  onExport: () => void
}

export function EditorScreen({ engine, onExport }: EditorScreenProps) {
  const [showVibePicker, setShowVibePicker] = useState(false)
  const [showSoundPicker, setShowSoundPicker] = useState(false)
  const [showTrimmer, setShowTrimmer] = useState(false)
  const [showTextEditor, setShowTextEditor] = useState(false)

  const { state } = engine
  const currentVibe = VIBES.find(v => v.id === state.vibe)
  const hasBlocks = state.blocks.length > 0
  const selectedBlock = state.blocks[state.selectedBlockIndex]

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* ── Top Controls ── */}
      <div
        className="shrink-0 flex items-center justify-between px-4 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2">
          {/* Vibe Button */}
          <button
            onClick={() => setShowVibePicker(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.85)',
              fontSize: '13px',
            }}
          >
            <Palette size={14} />
            <span>{currentVibe?.emoji} {currentVibe?.name}</span>
          </button>

          {/* Sound Button */}
          <button
            onClick={() => setShowSoundPicker(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.85)',
              fontSize: '13px',
            }}
          >
            <Music size={14} />
            <span>Sound</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Trim Button (only if video > 5s) */}
          {state.videoDuration > 5 && (
            <button
              onClick={() => setShowTrimmer(true)}
              className="px-3 py-1.5 rounded-full cursor-pointer transition-all active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '13px',
              }}
            >
              ✂️ Trim
            </button>
          )}

          {/* Remix / Export Button */}
          {!hasBlocks ? (
            <button
              onClick={() => engine.autoRemix()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full cursor-pointer font-semibold transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #FF9500, #FF3B30)',
                color: 'white',
                fontSize: '13px',
              }}
            >
              <Sparkles size={14} />
              Remix It
            </button>
          ) : (
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full cursor-pointer font-semibold transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #30D158, #00C7BE)',
                color: 'white',
                fontSize: '13px',
              }}
            >
              Done
            </button>
          )}
        </div>
      </div>

      {/* ── Video Preview ── */}
      <div className="flex-1 min-h-0 flex items-center justify-center px-4 py-3">
        <VideoPreview engine={engine} />
      </div>

      {/* ── Beat Block Strip ── */}
      {hasBlocks && (
        <div className="shrink-0 px-4 pb-2">
          <BeatBlockStrip
            blocks={state.blocks}
            selectedIndex={state.selectedBlockIndex}
            currentIndex={state.currentBlockIndex}
            isPlaying={state.isPlaying}
            onSelect={engine.selectBlock}
          />
        </div>
      )}

      {/* ── Effect Tray ── */}
      {hasBlocks && (
        <div
          className="shrink-0 px-4 pb-4 pt-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <EffectTray
            activeEffects={selectedBlock?.effects ?? []}
            onToggleEffect={engine.applyEffect}
            onTextPop={() => setShowTextEditor(true)}
          />
        </div>
      )}

      {/* ── Floating Play Button (when blocks exist) ── */}
      {hasBlocks && (
        <button
          onClick={() => (state.isPlaying ? engine.pause() : engine.play())}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-30 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90"
          style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            fontSize: '24px',
          }}
        >
          {state.isPlaying ? '⏸' : '▶️'}
        </button>
      )}

      {/* ── Modals ── */}
      {showVibePicker && (
        <VibePicker
          currentVibe={state.vibe}
          onSelect={(id) => {
            engine.setVibe(id)
            setShowVibePicker(false)
          }}
          onClose={() => setShowVibePicker(false)}
        />
      )}

      {showSoundPicker && (
        <SoundPicker
          currentSound={state.sound}
          onSelect={(id) => {
            engine.setSound(id)
            setShowSoundPicker(false)
          }}
          onClose={() => setShowSoundPicker(false)}
          engine={engine}
        />
      )}

      {showTrimmer && (
        <TrimSlider
          duration={state.videoDuration}
          trimStart={state.trimStart}
          trimEnd={state.trimEnd}
          onTrim={(start, end) => {
            engine.setTrim(start, end)
            setShowTrimmer(false)
          }}
          onClose={() => setShowTrimmer(false)}
        />
      )}

      {showTextEditor && (
        <TextPopEditor
          currentText={selectedBlock?.text ?? ''}
          onSave={(text) => {
            engine.setBlockText(state.selectedBlockIndex, text)
            setShowTextEditor(false)
          }}
          onClose={() => setShowTextEditor(false)}
        />
      )}
    </div>
  )
}
