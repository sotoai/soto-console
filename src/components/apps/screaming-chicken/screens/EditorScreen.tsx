'use client'

import { useState } from 'react'
import { Sparkles, Music, Palette, Scissors } from 'lucide-react'
import { VideoPreview } from '../components/VideoPreview'
import { BeatBlockStrip } from '../components/BeatBlockStrip'
import { EffectTray } from '../components/EffectTray'
import { VibePicker } from '../components/VibePicker'
import { SoundPicker } from '../components/SoundPicker'
import { TrimSlider } from '../components/TrimSlider'
import { TextPopEditor } from '../components/TextPopEditor'
import type { UseRemixEngine } from '../engine/useRemixEngine'
import { VIBES, SOUNDS } from '../config'

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
  const currentSound = SOUNDS.find(s => s.id === state.sound)
  const hasBlocks = state.blocks.length > 0
  const selectedBlock = state.blocks[state.selectedBlockIndex]

  // ── PRE-REMIX STATE: Show setup flow ──
  if (!hasBlocks) {
    return (
      <div className="flex-1 flex flex-col min-h-0 pt-12">
        {/* Video Preview — constrained, not full-screen */}
        <div className="shrink-0 px-6 pb-4" style={{ maxHeight: '40vh' }}>
          <div className="w-full h-full max-h-[40vh] aspect-video mx-auto">
            <VideoPreview engine={engine} />
          </div>
        </div>

        {/* Setup Controls */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 pb-8">
          {/* Trim (only if > 5s) */}
          {state.videoDuration > 5 && (
            <button
              onClick={() => setShowTrimmer(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl cursor-pointer transition-all active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '14px',
              }}
            >
              <Scissors size={16} />
              <span>Trim to 5s ({state.videoDuration.toFixed(1)}s clip)</span>
            </button>
          )}

          {/* Vibe + Sound selectors */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowVibePicker(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl cursor-pointer transition-all active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.85)',
                fontSize: '15px',
              }}
            >
              <Palette size={18} />
              <span>{currentVibe?.emoji} {currentVibe?.name}</span>
            </button>

            <button
              onClick={() => setShowSoundPicker(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl cursor-pointer transition-all active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.85)',
                fontSize: '15px',
              }}
            >
              <Music size={18} />
              <span>{currentSound?.emoji} {currentSound?.name}</span>
            </button>
          </div>

          {/* ── BIG REMIX BUTTON ── */}
          <button
            onClick={() => engine.autoRemix()}
            className="flex items-center gap-3 px-10 py-4 rounded-full cursor-pointer font-bold transition-all active:scale-95 mt-2"
            style={{
              background: 'linear-gradient(135deg, #FF9500, #FF3B30)',
              color: 'white',
              fontSize: '20px',
              boxShadow: '0 4px 24px rgba(255, 100, 0, 0.4)',
            }}
          >
            <Sparkles size={22} />
            Remix It
          </button>

          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
            Pick a vibe and sound, then smash that button
          </p>
        </div>

        {/* Modals */}
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
      </div>
    )
  }

  // ── POST-REMIX STATE: Full editor ──
  return (
    <div className="flex-1 flex flex-col min-h-0 pt-10">
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
          {/* Re-Remix */}
          <button
            onClick={() => engine.autoRemix()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all active:scale-95"
            style={{
              background: 'rgba(255,150,0,0.15)',
              color: 'rgba(255,200,100,0.9)',
              fontSize: '13px',
              border: '1px solid rgba(255,150,0,0.2)',
            }}
          >
            <Sparkles size={14} />
            Remix
          </button>

          {/* Export */}
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
        </div>
      </div>

      {/* ── Video Preview ── */}
      <div className="flex-1 min-h-0 flex items-center justify-center px-4 py-3">
        <VideoPreview engine={engine} />
      </div>

      {/* ── Play/Pause Button ── */}
      <div className="shrink-0 flex justify-center pb-2">
        <button
          onClick={() => (state.isPlaying ? engine.pause() : engine.play())}
          className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90"
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.15)',
            fontSize: '20px',
          }}
        >
          {state.isPlaying ? '⏸' : '▶️'}
        </button>
      </div>

      {/* ── Beat Block Strip ── */}
      <div className="shrink-0 px-4 pb-2">
        <BeatBlockStrip
          blocks={state.blocks}
          selectedIndex={state.selectedBlockIndex}
          currentIndex={state.currentBlockIndex}
          isPlaying={state.isPlaying}
          onSelect={engine.selectBlock}
        />
      </div>

      {/* ── Effect Tray ── */}
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
