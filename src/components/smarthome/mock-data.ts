// ── Philips Hue ──

export interface HueLight {
  id: string
  name: string
  on: boolean
  brightness: number // 0–100
  colorTemp: 'warm' | 'neutral' | 'cool'
}

export interface HueRoom {
  id: string
  name: string
  icon: string // lucide icon key
  lights: HueLight[]
}

// ── Google Nest ──

export type ThermostatMode = 'heat' | 'cool' | 'auto' | 'eco' | 'off'

export interface NestThermostat {
  id: string
  name: string
  currentTemp: number // °F
  targetTemp: number
  humidity: number // 0–100
  mode: ThermostatMode
  running: boolean
}

// ── Rachio Sprinklers ──

export type ZoneStatus = 'idle' | 'watering' | 'scheduled'

export interface RachioZone {
  id: string
  name: string
  status: ZoneStatus
  duration: number // minutes remaining when watering
  nextRun: string | null
  moistureLevel: number // 0–100
}

export interface RachioSystem {
  rainDelay: boolean
  rainDelayUntil: string | null
  zones: RachioZone[]
}

// ── Eufy Security ──

export interface EufyCamera {
  id: string
  name: string
  location: string
  online: boolean
  armed: boolean
  lastMotion: string
  batteryLevel: number | null // null = wired
  gradientFrom: string
  gradientTo: string
}

// ────────────────────────────────────────
// Mock data
// ────────────────────────────────────────

export const MOCK_HUE_ROOMS: HueRoom[] = [
  {
    id: 'living-room',
    name: 'Living Room',
    icon: 'Sofa',
    lights: [
      { id: 'lr-1', name: 'Floor Lamp', on: true, brightness: 75, colorTemp: 'warm' },
      { id: 'lr-2', name: 'TV Backlight', on: true, brightness: 40, colorTemp: 'cool' },
      { id: 'lr-3', name: 'Ceiling', on: false, brightness: 0, colorTemp: 'neutral' },
    ],
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    icon: 'Bed',
    lights: [
      { id: 'br-1', name: 'Nightstand L', on: true, brightness: 30, colorTemp: 'warm' },
      { id: 'br-2', name: 'Nightstand R', on: false, brightness: 0, colorTemp: 'warm' },
    ],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    icon: 'CookingPot',
    lights: [
      { id: 'kt-1', name: 'Island Pendants', on: true, brightness: 90, colorTemp: 'neutral' },
      { id: 'kt-2', name: 'Under Cabinet', on: true, brightness: 60, colorTemp: 'cool' },
    ],
  },
  {
    id: 'office',
    name: 'Office',
    icon: 'Monitor',
    lights: [
      { id: 'of-1', name: 'Desk Lamp', on: true, brightness: 85, colorTemp: 'cool' },
      { id: 'of-2', name: 'Ambient Strip', on: false, brightness: 0, colorTemp: 'warm' },
    ],
  },
]

export const MOCK_THERMOSTAT: NestThermostat = {
  id: 'nest-1',
  name: 'Main Floor',
  currentTemp: 72,
  targetTemp: 70,
  humidity: 45,
  mode: 'cool',
  running: true,
}

export const MOCK_RACHIO: RachioSystem = {
  rainDelay: false,
  rainDelayUntil: null,
  zones: [
    { id: 'z1', name: 'Front Lawn', status: 'idle', duration: 0, nextRun: 'Tomorrow 6:00 AM', moistureLevel: 68 },
    { id: 'z2', name: 'Back Yard', status: 'scheduled', duration: 0, nextRun: 'Tomorrow 6:25 AM', moistureLevel: 42 },
    { id: 'z3', name: 'Garden Beds', status: 'watering', duration: 12, nextRun: null, moistureLevel: 85 },
    { id: 'z4', name: 'Side Yard', status: 'idle', duration: 0, nextRun: 'Thu 6:45 AM', moistureLevel: 55 },
    { id: 'z5', name: 'Drip Line', status: 'idle', duration: 0, nextRun: 'Fri 5:30 AM', moistureLevel: 61 },
  ],
}

export const MOCK_CAMERAS: EufyCamera[] = [
  { id: 'cam-1', name: 'Front Door', location: 'Porch', online: true, armed: true, lastMotion: '12 min ago', batteryLevel: null, gradientFrom: '#475569', gradientTo: '#1e293b' },
  { id: 'cam-2', name: 'Backyard', location: 'Patio', online: true, armed: true, lastMotion: '1 hr ago', batteryLevel: 78, gradientFrom: '#065f46', gradientTo: '#334155' },
  { id: 'cam-3', name: 'Garage', location: 'Driveway', online: true, armed: false, lastMotion: '3 hr ago', batteryLevel: null, gradientFrom: '#3f3f46', gradientTo: '#18181b' },
  { id: 'cam-4', name: 'Side Gate', location: 'Fence', online: false, armed: true, lastMotion: '2 days ago', batteryLevel: 12, gradientFrom: '#44403c', gradientTo: '#1c1917' },
]

// ── Mode colors ──
export const MODE_COLORS: Record<ThermostatMode, string> = {
  cool: '#0A84FF',
  heat: '#FF9F0A',
  auto: '#30D158',
  eco: '#34C759',
  off: '#8E8E93',
}
