// ─── Web Audio API Drum Synthesis ───
// All sounds are generated programmatically — no audio files needed.

import type { SoundId } from '../config'
import { beatDuration } from '../config'

export interface AudioEngine {
  schedulePattern: (soundId: SoundId, bpm: number, blockCount: number) => void
  previewPattern: (soundId: SoundId, bpm: number) => void
  stop: () => void
  dispose: () => void
  getDestination: () => MediaStreamAudioDestinationNode | null
}

export function createAudioEngine(): AudioEngine {
  let ctx: AudioContext | null = null
  let scheduledSources: AudioScheduledSourceNode[] = []
  let destinationNode: MediaStreamAudioDestinationNode | null = null

  function getCtx(): AudioContext {
    if (!ctx || ctx.state === 'closed') {
      ctx = new AudioContext()
    }
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
    return ctx
  }

  // ── Drum Synthesis ──

  function kick(audioCtx: AudioContext, time: number, dest: AudioNode) {
    // Sine sweep 150Hz → 40Hz
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, time)
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.12)
    gain.gain.setValueAtTime(1.0, time)
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25)
    osc.connect(gain)
    gain.connect(dest)
    osc.start(time)
    osc.stop(time + 0.3)
    scheduledSources.push(osc)
  }

  function snare(audioCtx: AudioContext, time: number, dest: AudioNode) {
    // White noise burst
    const bufferSize = audioCtx.sampleRate * 0.12
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
    }
    const noise = audioCtx.createBufferSource()
    noise.buffer = buffer
    const noiseGain = audioCtx.createGain()
    noiseGain.gain.setValueAtTime(0.6, time)
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.12)

    // Filter
    const filter = audioCtx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 1000

    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(dest)
    noise.start(time)
    noise.stop(time + 0.15)
    scheduledSources.push(noise)

    // Triangle tone body
    const osc = audioCtx.createOscillator()
    const oscGain = audioCtx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(180, time)
    oscGain.gain.setValueAtTime(0.5, time)
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.08)
    osc.connect(oscGain)
    oscGain.connect(dest)
    osc.start(time)
    osc.stop(time + 0.1)
    scheduledSources.push(osc)
  }

  function hihat(audioCtx: AudioContext, time: number, dest: AudioNode, open = false) {
    const duration = open ? 0.2 : 0.06
    const bufferSize = audioCtx.sampleRate * duration
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
    }
    const noise = audioCtx.createBufferSource()
    noise.buffer = buffer

    const filter = audioCtx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 7000

    const gain = audioCtx.createGain()
    gain.gain.setValueAtTime(0.25, time)
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(dest)
    noise.start(time)
    noise.stop(time + duration + 0.01)
    scheduledSources.push(noise)
  }

  function bass808(audioCtx: AudioContext, time: number, dest: AudioNode) {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(80, time)
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.5)
    gain.gain.setValueAtTime(0.8, time)
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5)
    osc.connect(gain)
    gain.connect(dest)
    osc.start(time)
    osc.stop(time + 0.55)
    scheduledSources.push(osc)
  }

  function crash(audioCtx: AudioContext, time: number, dest: AudioNode) {
    const bufferSize = audioCtx.sampleRate * 0.6
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2)
    }
    const noise = audioCtx.createBufferSource()
    noise.buffer = buffer

    const filter = audioCtx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 5000
    filter.Q.value = 0.5

    const gain = audioCtx.createGain()
    gain.gain.setValueAtTime(0.35, time)
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.6)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(dest)
    noise.start(time)
    noise.stop(time + 0.65)
    scheduledSources.push(noise)
  }

  // ── Sound Patterns ──
  // Each pattern defines which drums hit on which beats (0-indexed sixteenth notes)

  type DrumHit = 'kick' | 'snare' | 'hihat' | 'hihat-open' | '808' | 'crash'
  type Pattern = { beat: number; drums: DrumHit[] }[]

  function getPattern(soundId: SoundId, beatsCount: number): Pattern {
    const pattern: Pattern = []

    switch (soundId) {
      case 'hard-drop':
        // Build: kicks 0-3, silence 4, bomb on 5
        for (let i = 0; i < beatsCount; i++) {
          if (i < Math.floor(beatsCount * 0.5)) {
            pattern.push({ beat: i, drums: i % 2 === 0 ? ['kick'] : ['hihat'] })
          } else if (i === Math.floor(beatsCount * 0.5)) {
            // Silence (no drums)
          } else if (i === Math.floor(beatsCount * 0.5) + 1) {
            pattern.push({ beat: i, drums: ['kick', 'snare', 'crash', '808'] })
          } else {
            pattern.push({ beat: i, drums: i % 2 === 0 ? ['kick', 'snare'] : ['hihat'] })
          }
        }
        break

      case 'trap-loop':
        for (let i = 0; i < beatsCount; i++) {
          const drums: DrumHit[] = ['hihat']
          if (i % 4 === 0) drums.push('kick', '808')
          if (i % 4 === 2) drums.push('snare')
          // Double hi-hat rolls on even beats
          if (i % 2 === 0) drums.push('hihat')
          pattern.push({ beat: i, drums })
        }
        break

      case 'glitch-beats':
        for (let i = 0; i < beatsCount; i++) {
          const drums: DrumHit[] = []
          if (Math.random() > 0.3) drums.push('hihat')
          if (Math.random() > 0.6) drums.push('kick')
          if (Math.random() > 0.7) drums.push('snare')
          if (drums.length === 0) drums.push('hihat')
          pattern.push({ beat: i, drums })
        }
        break

      case 'bass-cannon':
        for (let i = 0; i < beatsCount; i++) {
          const drums: DrumHit[] = []
          if (i % 4 === 0) drums.push('808', 'kick')
          if (i % 4 === 2) drums.push('snare')
          if (i % 2 === 1) drums.push('hihat')
          if (drums.length === 0) drums.push('hihat')
          pattern.push({ beat: i, drums })
        }
        break

      case 'chaos-drums':
        for (let i = 0; i < beatsCount; i++) {
          const drums: DrumHit[] = ['hihat']
          if (i % 2 === 0) drums.push('kick')
          if (i % 2 === 1) drums.push('snare')
          if (i % 3 === 0) drums.push('crash')
          if (i % 4 === 0) drums.push('808')
          pattern.push({ beat: i, drums })
        }
        break

      case 'minimal-pulse':
        for (let i = 0; i < beatsCount; i++) {
          pattern.push({
            beat: i,
            drums: i % 2 === 0 ? ['kick'] : ['hihat'],
          })
        }
        break
    }

    return pattern
  }

  function playDrum(audioCtx: AudioContext, drum: DrumHit, time: number, dest: AudioNode) {
    switch (drum) {
      case 'kick':
        kick(audioCtx, time, dest)
        break
      case 'snare':
        snare(audioCtx, time, dest)
        break
      case 'hihat':
        hihat(audioCtx, time, dest)
        break
      case 'hihat-open':
        hihat(audioCtx, time, dest, true)
        break
      case '808':
        bass808(audioCtx, time, dest)
        break
      case 'crash':
        crash(audioCtx, time, dest)
        break
    }
  }

  // ── Public API ──

  function stopAll() {
    for (const src of scheduledSources) {
      try {
        src.stop()
      } catch {
        // Already stopped
      }
    }
    scheduledSources = []
  }

  function schedulePattern(soundId: SoundId, bpm: number, blockCount: number) {
    const audioCtx = getCtx()
    stopAll()

    const secPerBeat = beatDuration(bpm)
    const pattern = getPattern(soundId, blockCount)
    const now = audioCtx.currentTime + 0.05
    const dest = audioCtx.destination

    for (const { beat, drums } of pattern) {
      const time = now + beat * secPerBeat
      for (const drum of drums) {
        playDrum(audioCtx, drum, time, dest)
      }
    }
  }

  function previewPattern(soundId: SoundId, bpm: number) {
    // Play 4 beats as preview
    const audioCtx = getCtx()
    stopAll()

    const secPerBeat = beatDuration(bpm)
    const pattern = getPattern(soundId, 4)
    const now = audioCtx.currentTime + 0.05
    const dest = audioCtx.destination

    for (const { beat, drums } of pattern) {
      const time = now + beat * secPerBeat
      for (const drum of drums) {
        playDrum(audioCtx, drum, time, dest)
      }
    }
  }

  function getDestination(): MediaStreamAudioDestinationNode | null {
    if (!ctx) return null
    if (!destinationNode) {
      destinationNode = ctx.createMediaStreamDestination()
    }
    return destinationNode
  }

  function dispose() {
    stopAll()
    if (ctx && ctx.state !== 'closed') {
      ctx.close()
    }
    ctx = null
    destinationNode = null
  }

  return {
    schedulePattern,
    previewPattern,
    stop: stopAll,
    dispose,
    getDestination,
  }
}
