'use client'

import { Droplets, Clock, CloudRain } from 'lucide-react'
import { SmartHomeHeader } from './SmartHomeHeader'
import type { RachioSystem } from './mock-data'

interface SprinklersSectionProps {
  system: RachioSystem
  onToggleZone: (zoneId: string) => void
  onToggleRainDelay: () => void
}

export function SprinklersSection({ system, onToggleZone, onToggleRainDelay }: SprinklersSectionProps) {
  const activeCount = system.zones.filter(z => z.status === 'watering').length

  return (
    <div className="flex flex-col h-full">
      <SmartHomeHeader
        title="Sprinklers"
        icon={Droplets}
        statusText={activeCount > 0 ? `${activeCount} active` : 'Idle'}
        statusColor={activeCount > 0 ? '#0A84FF' : undefined}
      />

      {/* Rain delay banner */}
      {system.rainDelay && (
        <div
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md mb-2"
          style={{ background: 'var(--wp-control-bg)' }}
        >
          <CloudRain size={12} className="text-[var(--wp-text-tertiary)] shrink-0" />
          <span className="text-[10px] text-[var(--wp-text-secondary)]">
            Rain delay until {system.rainDelayUntil}
          </span>
        </div>
      )}

      {/* Zone list */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-0.5">
        {system.zones.map(zone => (
          <button
            key={zone.id}
            onClick={() => onToggleZone(zone.id)}
            className="w-full flex items-center gap-2.5 py-2 min-h-[40px] cursor-pointer"
            style={{ borderBottom: '0.5px solid var(--wp-line)' }}
          >
            {/* Status indicator */}
            <div className="w-[6px] shrink-0 flex items-center justify-center">
              {zone.status === 'watering' ? (
                <div className="w-[6px] h-[6px] rounded-full bg-[#0A84FF] animate-pulse" />
              ) : (
                <div
                  className="w-[4px] h-[4px] rounded-full"
                  style={{ background: zone.status === 'scheduled' ? 'var(--wp-text-tertiary)' : 'var(--wp-dot)' }}
                />
              )}
            </div>

            {/* Zone name */}
            <span className="text-[12px] font-medium text-[var(--wp-text)] flex-1 text-left min-w-0 truncate">
              {zone.name}
            </span>

            {/* Status text */}
            <div className="flex items-center gap-1 shrink-0">
              {zone.status === 'watering' ? (
                <span className="text-[10px] font-medium text-[#0A84FF] tabular-nums">
                  {zone.duration}m left
                </span>
              ) : zone.status === 'scheduled' && zone.nextRun ? (
                <>
                  <Clock size={9} className="text-[var(--wp-text-muted)]" />
                  <span className="text-[10px] text-[var(--wp-text-muted)]">
                    {zone.nextRun}
                  </span>
                </>
              ) : (
                <span className="text-[10px] text-[var(--wp-text-muted)]">Idle</span>
              )}
            </div>

            {/* Moisture bar */}
            <div className="w-[32px] h-[3px] rounded-full shrink-0 overflow-hidden" style={{ background: 'var(--wp-control-bg)' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${zone.moistureLevel}%`,
                  background: zone.moistureLevel > 60
                    ? '#30D158'
                    : zone.moistureLevel > 30
                      ? '#FFD60A'
                      : '#FF453A',
                }}
              />
            </div>
          </button>
        ))}
      </div>

      {/* Rain delay toggle */}
      <button
        onClick={onToggleRainDelay}
        className="mt-3 shrink-0 flex items-center justify-center gap-1.5 py-2 rounded-md cursor-pointer transition-all duration-200 active:scale-98"
        style={{
          background: system.rainDelay ? 'rgba(10, 132, 255, 0.15)' : 'var(--wp-control-bg)',
          border: '0.5px solid var(--wp-line)',
        }}
      >
        <CloudRain size={11} style={{ color: system.rainDelay ? '#0A84FF' : 'var(--wp-text-muted)' }} />
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: system.rainDelay ? '#0A84FF' : 'var(--wp-text-muted)' }}
        >
          {system.rainDelay ? 'Cancel Delay' : 'Rain Delay'}
        </span>
      </button>
    </div>
  )
}
