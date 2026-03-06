// ─── Screaming Chicken — Config & Types ───

// ── Effect Types ──
export const EFFECTS = [
  { id: 'stutter', label: 'Stutter', emoji: '🔁' },
  { id: 'freeze', label: 'Freeze', emoji: '🧊' },
  { id: 'zoom', label: 'Zoom', emoji: '🔍' },
  { id: 'shake', label: 'Shake', emoji: '📳' },
  { id: 'reverse', label: 'Reverse', emoji: '⏪' },
  { id: 'flash', label: 'Flash', emoji: '⚡' },
  { id: 'glitch', label: 'Glitch', emoji: '👾' },
  { id: 'speed-up', label: 'Speed Up', emoji: '⏩' },
  { id: 'slow-down', label: 'Slow Down', emoji: '🐌' },
  { id: 'repeat', label: 'Repeat', emoji: '🔂' },
  { id: 'text-pop', label: 'Text Pop', emoji: '💬' },
] as const

export type EffectType = (typeof EFFECTS)[number]['id']

// ── Vibe Definitions ──
export type VibeId =
  | 'meme-drop'
  | 'glitch-hype'
  | 'bass-hit'
  | 'chaos-mode'
  | 'slow-build'
  | 'brainrot-edit'

export interface VibeConfig {
  id: VibeId
  name: string
  emoji: string
  bpm: number
  description: string
  gradient: string
  /** Which effects this vibe tends to use */
  suggestedEffects: EffectType[]
  /** Number of beat blocks to generate */
  blockCount: number
}

export const VIBES: VibeConfig[] = [
  {
    id: 'meme-drop',
    name: 'Meme Drop',
    emoji: '💀',
    bpm: 140,
    description: 'Build → hard drop',
    gradient: 'from-red-500 to-orange-500',
    suggestedEffects: ['freeze', 'zoom', 'flash', 'shake'],
    blockCount: 8,
  },
  {
    id: 'glitch-hype',
    name: 'Glitch Hype',
    emoji: '👾',
    bpm: 150,
    description: 'Rapid glitchy cuts',
    gradient: 'from-green-400 to-cyan-500',
    suggestedEffects: ['glitch', 'stutter', 'flash', 'speed-up'],
    blockCount: 12,
  },
  {
    id: 'bass-hit',
    name: 'Bass Hit',
    emoji: '🔊',
    bpm: 130,
    description: 'Heavy bass drops',
    gradient: 'from-purple-600 to-blue-600',
    suggestedEffects: ['shake', 'zoom', 'slow-down', 'flash'],
    blockCount: 8,
  },
  {
    id: 'chaos-mode',
    name: 'Chaos Mode',
    emoji: '🤯',
    bpm: 170,
    description: 'Max chaos energy',
    gradient: 'from-pink-500 to-yellow-500',
    suggestedEffects: ['stutter', 'glitch', 'shake', 'flash', 'zoom', 'reverse'],
    blockCount: 16,
  },
  {
    id: 'slow-build',
    name: 'Slow Build',
    emoji: '🌊',
    bpm: 100,
    description: 'Rising intensity',
    gradient: 'from-blue-400 to-indigo-600',
    suggestedEffects: ['slow-down', 'zoom', 'speed-up', 'flash'],
    blockCount: 8,
  },
  {
    id: 'brainrot-edit',
    name: 'Brainrot Edit',
    emoji: '🧠',
    bpm: 160,
    description: 'Fast cuts, zoom spam',
    gradient: 'from-fuchsia-500 to-rose-500',
    suggestedEffects: ['zoom', 'flash', 'stutter', 'speed-up', 'repeat'],
    blockCount: 12,
  },
]

// ── Sound / Beat Definitions ──
export type SoundId =
  | 'hard-drop'
  | 'trap-loop'
  | 'glitch-beats'
  | 'bass-cannon'
  | 'chaos-drums'
  | 'minimal-pulse'

export interface SoundConfig {
  id: SoundId
  name: string
  emoji: string
  description: string
}

export const SOUNDS: SoundConfig[] = [
  { id: 'hard-drop', name: 'Hard Drop', emoji: '💥', description: 'Build → silence → bomb' },
  { id: 'trap-loop', name: 'Trap Loop', emoji: '🎵', description: 'Hi-hat rolls + 808' },
  { id: 'glitch-beats', name: 'Glitch Beats', emoji: '🤖', description: 'Stuttery random hits' },
  { id: 'bass-cannon', name: 'Bass Cannon', emoji: '🔈', description: 'Deep sub + snare' },
  { id: 'chaos-drums', name: 'Chaos Drums', emoji: '🥁', description: 'Fast fills + crashes' },
  { id: 'minimal-pulse', name: 'Minimal Pulse', emoji: '💓', description: 'Simple kick-hat' },
]

// ── Beat Block ──
export interface BeatBlock {
  id: string
  clipStart: number   // 0–1 normalized position in trimmed clip
  clipEnd: number     // 0–1 normalized position
  effects: EffectType[]
  text?: string       // meme text overlay
  reversed: boolean
  speed: number       // 0.5 = slow, 1 = normal, 2 = fast
}

// ── App Screen State ──
export type ScreenId = 'home' | 'editor' | 'export'

// ── Remix State ──
export interface RemixState {
  sourceVideo: string | null   // object URL
  videoDuration: number
  trimStart: number            // 0–1
  trimEnd: number              // 0–1
  vibe: VibeId
  sound: SoundId
  bpm: number
  blocks: BeatBlock[]
  selectedBlockIndex: number
  isPlaying: boolean
  currentBlockIndex: number
}

export const DEFAULT_REMIX_STATE: RemixState = {
  sourceVideo: null,
  videoDuration: 0,
  trimStart: 0,
  trimEnd: 1,
  vibe: 'meme-drop',
  sound: 'hard-drop',
  bpm: 140,
  blocks: [],
  selectedBlockIndex: 0,
  isPlaying: false,
  currentBlockIndex: 0,
}

// ── Helpers ──
export function createBlockId(): string {
  return Math.random().toString(36).slice(2, 8)
}

/** Seconds per beat at given BPM */
export function beatDuration(bpm: number): number {
  return 60 / bpm
}
