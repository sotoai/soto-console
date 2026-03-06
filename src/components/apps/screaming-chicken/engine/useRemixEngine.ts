'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import {
  type RemixState,
  type VibeId,
  type SoundId,
  type EffectType,
  type BeatBlock,
  DEFAULT_REMIX_STATE,
  VIBES,
  beatDuration,
  createBlockId,
} from '../config'
import { applyEffects, captureStutterFrame } from './effects'
import { createAudioEngine, type AudioEngine } from './audio'
import { exportRemix } from './export'

export interface UseRemixEngine {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  videoRef: React.RefObject<HTMLVideoElement | null>
  state: RemixState
  loadVideo: (file: File) => void
  setTrim: (start: number, end: number) => void
  setVibe: (id: VibeId) => void
  setSound: (id: SoundId) => void
  autoRemix: () => void
  play: () => void
  pause: () => void
  selectBlock: (index: number) => void
  applyEffect: (effect: EffectType) => void
  removeEffect: (blockIndex: number, effect: EffectType) => void
  setBlockText: (blockIndex: number, text: string) => void
  toggleReverse: (blockIndex: number) => void
  setBlockSpeed: (blockIndex: number, speed: number) => void
  exportVideo: (onProgress?: (p: number) => void) => Promise<Blob>
  previewSound: (id: SoundId) => void
}

export function useRemixEngine(): UseRemixEngine {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // ── Mutable state (no re-renders per tick) ──
  const stateRef = useRef<RemixState>({ ...DEFAULT_REMIX_STATE })
  const rafRef = useRef<number | null>(null)
  const playStartRef = useRef(0)
  const audioEngineRef = useRef<AudioEngine | null>(null)
  const stutterFrameRef = useRef<ImageData | null>(null)
  const stutterCountRef = useRef(0)
  const lastBlockIndexRef = useRef(-1)

  // ── Reactive state (for UI) ──
  const [state, setState] = useState<RemixState>({ ...DEFAULT_REMIX_STATE })

  // Sync mutable → reactive
  const sync = useCallback(() => {
    setState({ ...stateRef.current })
  }, [])

  // ── Load Video ──
  const loadVideo = useCallback(
    (file: File) => {
      // Revoke previous URL
      if (stateRef.current.sourceVideo) {
        URL.revokeObjectURL(stateRef.current.sourceVideo)
      }

      const url = URL.createObjectURL(file)
      stateRef.current.sourceVideo = url

      // Get duration from video element
      const video = videoRef.current
      if (video) {
        video.src = url
        video.load()
        video.onloadedmetadata = () => {
          stateRef.current.videoDuration = video.duration
          stateRef.current.trimEnd = 1
          stateRef.current.trimStart = 0
          sync()
        }
      }
      sync()
    },
    [sync],
  )

  // ── Trim ──
  const setTrim = useCallback(
    (start: number, end: number) => {
      stateRef.current.trimStart = Math.max(0, Math.min(start, 0.99))
      stateRef.current.trimEnd = Math.max(start + 0.01, Math.min(end, 1))
      sync()
    },
    [sync],
  )

  // ── Vibe ──
  const setVibe = useCallback(
    (id: VibeId) => {
      const vibe = VIBES.find(v => v.id === id)
      if (!vibe) return
      stateRef.current.vibe = id
      stateRef.current.bpm = vibe.bpm
      // Re-generate blocks if we have any
      if (stateRef.current.blocks.length > 0) {
        stateRef.current.blocks = generateBlocks(vibe, stateRef.current)
      }
      sync()
    },
    [sync],
  )

  // ── Sound ──
  const setSound = useCallback(
    (id: SoundId) => {
      stateRef.current.sound = id
      sync()
    },
    [sync],
  )

  // ── Preview Sound ──
  const previewSound = useCallback((id: SoundId) => {
    if (!audioEngineRef.current) {
      audioEngineRef.current = createAudioEngine()
    }
    audioEngineRef.current.previewPattern(id, stateRef.current.bpm)
  }, [])

  // ── Auto Remix ──
  const autoRemix = useCallback(() => {
    const vibe = VIBES.find(v => v.id === stateRef.current.vibe)
    if (!vibe) return
    stateRef.current.blocks = generateBlocks(vibe, stateRef.current)
    stateRef.current.selectedBlockIndex = 0
    sync()
  }, [sync])

  // ── Play ──
  const play = useCallback(() => {
    if (stateRef.current.blocks.length === 0) return

    // Init audio engine
    if (!audioEngineRef.current) {
      audioEngineRef.current = createAudioEngine()
    }

    stateRef.current.isPlaying = true
    stateRef.current.currentBlockIndex = 0
    playStartRef.current = performance.now()
    lastBlockIndexRef.current = -1
    sync()

    // Schedule audio hits for all blocks
    const ae = audioEngineRef.current
    const bpmDur = beatDuration(stateRef.current.bpm)
    const blocks = stateRef.current.blocks
    ae.schedulePattern(stateRef.current.sound, stateRef.current.bpm, blocks.length)

    // Start render loop
    const loop = () => {
      if (!stateRef.current.isPlaying) return

      const elapsed = (performance.now() - playStartRef.current) / 1000
      const bpm = stateRef.current.bpm
      const secPerBeat = beatDuration(bpm)
      const totalDuration = stateRef.current.blocks.length * secPerBeat

      // Loop playback
      const loopedElapsed = elapsed % totalDuration
      const blockIndex = Math.floor(loopedElapsed / secPerBeat)
      const blockProgress = (loopedElapsed % secPerBeat) / secPerBeat

      stateRef.current.currentBlockIndex = blockIndex

      // Re-schedule audio on loop
      if (blockIndex < lastBlockIndexRef.current) {
        ae.schedulePattern(stateRef.current.sound, bpm, stateRef.current.blocks.length)
      }
      lastBlockIndexRef.current = blockIndex

      const block = stateRef.current.blocks[blockIndex]
      if (block) {
        renderFrame(block, blockProgress)
      }

      // Sync UI every ~6 frames
      if (Math.round(elapsed * 10) % 6 === 0) {
        sync()
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
  }, [sync])

  // ── Pause ──
  const pause = useCallback(() => {
    stateRef.current.isPlaying = false
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (audioEngineRef.current) {
      audioEngineRef.current.stop()
    }
    sync()
  }, [sync])

  // ── Select Block ──
  const selectBlock = useCallback(
    (index: number) => {
      stateRef.current.selectedBlockIndex = index
      sync()
    },
    [sync],
  )

  // ── Apply Effect (toggle) ──
  const applyEffect = useCallback(
    (effect: EffectType) => {
      const block = stateRef.current.blocks[stateRef.current.selectedBlockIndex]
      if (!block) return

      if (block.effects.includes(effect)) {
        block.effects = block.effects.filter(e => e !== effect)
      } else {
        block.effects = [...block.effects, effect]
      }
      sync()
    },
    [sync],
  )

  // ── Remove Effect ──
  const removeEffect = useCallback(
    (blockIndex: number, effect: EffectType) => {
      const block = stateRef.current.blocks[blockIndex]
      if (!block) return
      block.effects = block.effects.filter(e => e !== effect)
      sync()
    },
    [sync],
  )

  // ── Set Block Text ──
  const setBlockText = useCallback(
    (blockIndex: number, text: string) => {
      const block = stateRef.current.blocks[blockIndex]
      if (!block) return
      block.text = text || undefined

      // Auto-add text-pop effect if text set
      if (text && !block.effects.includes('text-pop')) {
        block.effects = [...block.effects, 'text-pop']
      }
      // Remove text-pop if text cleared
      if (!text) {
        block.effects = block.effects.filter(e => e !== 'text-pop')
      }
      sync()
    },
    [sync],
  )

  // ── Toggle Reverse ──
  const toggleReverse = useCallback(
    (blockIndex: number) => {
      const block = stateRef.current.blocks[blockIndex]
      if (!block) return
      block.reversed = !block.reversed
      sync()
    },
    [sync],
  )

  // ── Set Block Speed ──
  const setBlockSpeed = useCallback(
    (blockIndex: number, speed: number) => {
      const block = stateRef.current.blocks[blockIndex]
      if (!block) return
      block.speed = speed
      sync()
    },
    [sync],
  )

  // ── Export ──
  const exportVideo = useCallback(
    async (onProgress?: (p: number) => void): Promise<Blob> => {
      pause()
      const canvas = canvasRef.current
      const video = videoRef.current
      if (!canvas || !video) throw new Error('Missing canvas or video')

      return exportRemix({
        canvas,
        video,
        state: stateRef.current,
        onProgress,
      })
    },
    [pause],
  )

  // ── Render a single frame ──
  const renderFrame = useCallback(
    (block: BeatBlock, blockProgress: number) => {
      const canvas = canvasRef.current
      const video = videoRef.current
      if (!canvas || !video) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const { trimStart, trimEnd, videoDuration } = stateRef.current
      const trimmedStart = trimStart * videoDuration
      const trimmedDuration = (trimEnd - trimStart) * videoDuration

      // Calculate video seek time based on block's clip range
      let seekNorm = block.clipStart + (block.clipEnd - block.clipStart) * blockProgress
      if (block.reversed) {
        seekNorm = block.clipEnd - (block.clipEnd - block.clipStart) * blockProgress
      }

      const seekTime = trimmedStart + seekNorm * trimmedDuration

      // Handle speed effects
      let effectiveProgress = blockProgress
      if (block.effects.includes('speed-up')) {
        effectiveProgress = (blockProgress * 2) % 1
      }
      if (block.effects.includes('slow-down')) {
        effectiveProgress = blockProgress * 0.5
      }

      // Handle repeat effect
      if (block.effects.includes('repeat')) {
        effectiveProgress = (blockProgress * 4) % 1
        const repeatSeek =
          trimmedStart +
          (block.clipStart + (block.clipEnd - block.clipStart) * 0.25 * effectiveProgress) *
            trimmedDuration
        video.currentTime = Math.max(0, Math.min(repeatSeek, videoDuration - 0.01))
      } else {
        video.currentTime = Math.max(0, Math.min(seekTime, videoDuration - 0.01))
      }

      // Clear and draw base frame
      ctx.save()
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Handle freeze effect: capture and reuse a frame
      if (block.effects.includes('freeze')) {
        if (blockProgress < 0.05 || !stutterFrameRef.current) {
          // Capture the first frame
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          stutterFrameRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
        } else {
          ctx.putImageData(stutterFrameRef.current, 0, 0)
        }
      } else if (block.effects.includes('stutter')) {
        // Stutter: alternate between captured frame and current
        stutterCountRef.current++
        if (stutterCountRef.current % 4 < 2) {
          if (!stutterFrameRef.current) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            stutterFrameRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
          } else {
            ctx.putImageData(stutterFrameRef.current, 0, 0)
          }
        } else {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          stutterFrameRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
        }
      } else {
        stutterFrameRef.current = null
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      }

      // Apply visual effects on top
      applyEffects(ctx, canvas, block, blockProgress)

      ctx.restore()
    },
    [],
  )

  // ── Render static frame when not playing (show first frame of selected block) ──
  useEffect(() => {
    if (state.isPlaying || !state.sourceVideo || state.blocks.length === 0) return

    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const block = state.blocks[state.selectedBlockIndex]
    if (!block) return

    const { trimStart, trimEnd, videoDuration } = stateRef.current
    const trimmedStart = trimStart * videoDuration
    const trimmedDuration = (trimEnd - trimStart) * videoDuration
    const seekTime = trimmedStart + block.clipStart * trimmedDuration

    video.currentTime = Math.max(0, Math.min(seekTime, videoDuration - 0.01))

    const onSeeked = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      applyEffects(ctx, canvas, block, 0)
    }

    video.addEventListener('seeked', onSeeked, { once: true })
    return () => video.removeEventListener('seeked', onSeeked)
  }, [state.isPlaying, state.sourceVideo, state.blocks, state.selectedBlockIndex])

  // ── Draw initial video frame when loaded (no blocks yet) ──
  useEffect(() => {
    if (state.blocks.length > 0 || !state.sourceVideo) return

    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const drawFrame = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    }

    video.addEventListener('loadeddata', drawFrame, { once: true })
    return () => video.removeEventListener('loadeddata', drawFrame)
  }, [state.sourceVideo, state.blocks.length])

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (stateRef.current.sourceVideo) {
        URL.revokeObjectURL(stateRef.current.sourceVideo)
      }
      if (audioEngineRef.current) {
        audioEngineRef.current.dispose()
      }
    }
  }, [])

  return {
    canvasRef,
    videoRef,
    state,
    loadVideo,
    setTrim,
    setVibe,
    setSound,
    autoRemix,
    play,
    pause,
    selectBlock,
    applyEffect,
    removeEffect,
    setBlockText,
    toggleReverse,
    setBlockSpeed,
    exportVideo,
    previewSound,
  }
}

// ── Block Generation ──
function generateBlocks(
  vibe: (typeof VIBES)[number],
  state: RemixState,
): BeatBlock[] {
  const blocks: BeatBlock[] = []
  const count = vibe.blockCount

  for (let i = 0; i < count; i++) {
    const norm = i / count
    // Distribute clip segments across beats
    const clipStart = (i / count) % 1
    const clipEnd = ((i + 1) / count) % 1 || 1

    // Apply vibe-specific effect patterns
    const effects: EffectType[] = []

    switch (vibe.id) {
      case 'meme-drop':
        // Build-up → drop at beat 5
        if (i < 4) {
          if (i % 2 === 0) effects.push('stutter')
        } else if (i === 4) {
          effects.push('freeze', 'flash')
        } else if (i === 5) {
          effects.push('zoom', 'shake')
        } else {
          effects.push(i % 2 === 0 ? 'shake' : 'zoom')
        }
        break

      case 'glitch-hype':
        effects.push('glitch')
        if (i % 3 === 0) effects.push('stutter')
        if (i % 4 === 0) effects.push('flash')
        break

      case 'bass-hit':
        if (i % 4 === 0) effects.push('shake', 'zoom')
        if (i % 4 === 2) effects.push('slow-down')
        break

      case 'chaos-mode':
        // Random effects
        const pool = vibe.suggestedEffects
        const numEffects = 1 + Math.floor(Math.random() * 2)
        for (let j = 0; j < numEffects; j++) {
          const eff = pool[Math.floor(Math.random() * pool.length)]
          if (!effects.includes(eff)) effects.push(eff)
        }
        break

      case 'slow-build':
        // Gradually add effects
        if (norm > 0.25 && i % 3 === 0) effects.push('slow-down')
        if (norm > 0.5) effects.push('zoom')
        if (norm > 0.75) effects.push('shake', 'flash')
        break

      case 'brainrot-edit':
        effects.push('zoom')
        if (i % 2 === 0) effects.push('flash')
        if (i % 3 === 0) effects.push('stutter')
        break
    }

    blocks.push({
      id: createBlockId(),
      clipStart,
      clipEnd: clipEnd > clipStart ? clipEnd : 1,
      effects,
      reversed: false,
      speed: 1,
    })
  }

  return blocks
}
