'use client'

import { useState, useCallback, type CSSProperties } from 'react'
import { ThermostatSection } from './ThermostatSection'
import { LightsSection } from './LightsSection'
import { SprinklersSection } from './SprinklersSection'
import { CamerasSection } from './CamerasSection'
import {
  MOCK_HUE_ROOMS,
  MOCK_THERMOSTAT,
  MOCK_RACHIO,
  MOCK_CAMERAS,
  type HueRoom,
  type NestThermostat,
  type ThermostatMode,
  type RachioSystem,
  type EufyCamera,
} from './mock-data'

interface SmartHomePageProps {
  className?: string
  style?: CSSProperties
}

export function SmartHomePage({ className, style }: SmartHomePageProps) {
  // ── State ──
  const [rooms, setRooms] = useState<HueRoom[]>(MOCK_HUE_ROOMS)
  const [thermostat, setThermostat] = useState<NestThermostat>(MOCK_THERMOSTAT)
  const [sprinklers, setSprinklers] = useState<RachioSystem>(MOCK_RACHIO)
  const [cameras, setCameras] = useState<EufyCamera[]>(MOCK_CAMERAS)

  // ── Light callbacks ──
  const handleToggleLight = useCallback((roomId: string, lightId: string) => {
    setRooms(prev =>
      prev.map(r =>
        r.id === roomId
          ? {
              ...r,
              lights: r.lights.map(l =>
                l.id === lightId ? { ...l, on: !l.on, brightness: !l.on ? 75 : 0 } : l,
              ),
            }
          : r,
      ),
    )
  }, [])

  const handleToggleRoom = useCallback((roomId: string) => {
    setRooms(prev =>
      prev.map(r => {
        if (r.id !== roomId) return r
        const anyOn = r.lights.some(l => l.on)
        return {
          ...r,
          lights: r.lights.map(l => ({
            ...l,
            on: !anyOn,
            brightness: !anyOn ? (l.brightness || 75) : 0,
          })),
        }
      }),
    )
  }, [])

  // ── Thermostat callbacks ──
  const handleTargetChange = useCallback((temp: number) => {
    setThermostat(prev => ({ ...prev, targetTemp: Math.max(60, Math.min(85, temp)) }))
  }, [])

  const handleModeChange = useCallback((mode: ThermostatMode) => {
    setThermostat(prev => ({
      ...prev,
      mode,
      running: mode !== 'off' && mode !== 'eco',
    }))
  }, [])

  // ── Sprinkler callbacks ──
  const handleToggleZone = useCallback((zoneId: string) => {
    setSprinklers(prev => ({
      ...prev,
      zones: prev.zones.map(z =>
        z.id === zoneId
          ? {
              ...z,
              status: z.status === 'watering' ? 'idle' as const : 'watering' as const,
              duration: z.status === 'watering' ? 0 : 15,
            }
          : z,
      ),
    }))
  }, [])

  const handleToggleRainDelay = useCallback(() => {
    setSprinklers(prev => ({
      ...prev,
      rainDelay: !prev.rainDelay,
      rainDelayUntil: !prev.rainDelay ? 'Mar 5, 8:00 AM' : null,
    }))
  }, [])

  // ── Camera callbacks ──
  const handleToggleArm = useCallback((cameraId: string) => {
    setCameras(prev =>
      prev.map(c => (c.id === cameraId ? { ...c, armed: !c.armed } : c)),
    )
  }, [])

  return (
    <div className={className} style={style}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 md:mb-4 shrink-0">
        <h3
          className="text-[13px] font-semibold text-[var(--wp-text-tertiary)] uppercase tracking-wider"
          style={{ textShadow: 'var(--wp-shadow)' }}
        >
          Smart Home
        </h3>
        <span className="text-[10px] text-[var(--wp-text-muted)] tracking-wide">
          All Systems Normal
        </span>
      </div>

      {/* 2×2 grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 overflow-y-auto">
        {/* Thermostat — top left */}
        <div
          className="rounded-[var(--radius-md)] p-3 md:p-4"
          style={{ background: 'var(--wp-control-bg)', border: '0.5px solid var(--wp-line)' }}
        >
          <ThermostatSection
            thermostat={thermostat}
            onTargetChange={handleTargetChange}
            onModeChange={handleModeChange}
          />
        </div>

        {/* Lights — top right */}
        <div
          className="rounded-[var(--radius-md)] p-3 md:p-4"
          style={{ background: 'var(--wp-control-bg)', border: '0.5px solid var(--wp-line)' }}
        >
          <LightsSection
            rooms={rooms}
            onToggleLight={handleToggleLight}
            onToggleRoom={handleToggleRoom}
          />
        </div>

        {/* Cameras — bottom left */}
        <div
          className="rounded-[var(--radius-md)] p-3 md:p-4"
          style={{ background: 'var(--wp-control-bg)', border: '0.5px solid var(--wp-line)' }}
        >
          <CamerasSection
            cameras={cameras}
            onToggleArm={handleToggleArm}
          />
        </div>

        {/* Sprinklers — bottom right */}
        <div
          className="rounded-[var(--radius-md)] p-3 md:p-4"
          style={{ background: 'var(--wp-control-bg)', border: '0.5px solid var(--wp-line)' }}
        >
          <SprinklersSection
            system={sprinklers}
            onToggleZone={handleToggleZone}
            onToggleRainDelay={handleToggleRainDelay}
          />
        </div>
      </div>
    </div>
  )
}
