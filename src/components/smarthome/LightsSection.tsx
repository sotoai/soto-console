'use client'

import { useState } from 'react'
import { Lightbulb, Sofa, Bed, CookingPot, Monitor, ChevronDown } from 'lucide-react'
import { SmartHomeHeader } from './SmartHomeHeader'
import type { HueRoom } from './mock-data'
import type { LucideIcon } from 'lucide-react'

const ROOM_ICONS: Record<string, LucideIcon> = {
  Sofa,
  Bed,
  CookingPot,
  Monitor,
}

const TEMP_COLORS: Record<string, string> = {
  warm: '#FF9F0A',
  neutral: '#FFD60A',
  cool: '#0A84FF',
}

interface LightsSectionProps {
  rooms: HueRoom[]
  onToggleLight: (roomId: string, lightId: string) => void
  onToggleRoom: (roomId: string) => void
}

export function LightsSection({ rooms, onToggleLight, onToggleRoom }: LightsSectionProps) {
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null)

  const totalOn = rooms.reduce((sum, r) => sum + r.lights.filter(l => l.on).length, 0)
  const totalLights = rooms.reduce((sum, r) => sum + r.lights.length, 0)

  return (
    <div className="flex flex-col h-full">
      <SmartHomeHeader
        title="Lights"
        icon={Lightbulb}
        statusText={`${totalOn}/${totalLights} on`}
      />

      <div className="flex-1 min-h-0 overflow-y-auto space-y-0.5">
        {rooms.map(room => {
          const RoomIcon = ROOM_ICONS[room.icon] || Lightbulb
          const onCount = room.lights.filter(l => l.on).length
          const roomOn = onCount > 0
          const isExpanded = expandedRoom === room.id

          return (
            <div key={room.id}>
              {/* Room row */}
              <button
                onClick={() => setExpandedRoom(isExpanded ? null : room.id)}
                className="w-full flex items-center gap-2.5 py-2.5 min-h-[44px] cursor-pointer transition-colors duration-150"
                style={{ borderBottom: '0.5px solid var(--wp-line)' }}
              >
                <RoomIcon size={16} className="text-[var(--wp-text-tertiary)] shrink-0" />
                <span className="text-[13px] font-medium text-[var(--wp-text)] flex-1 text-left">
                  {room.name}
                </span>
                <span className="text-[10px] text-[var(--wp-text-muted)] tabular-nums mr-2">
                  {onCount}/{room.lights.length}
                </span>

                {/* Room master toggle */}
                <div
                  onClick={(e) => { e.stopPropagation(); onToggleRoom(room.id) }}
                  className="w-[36px] h-[20px] rounded-full relative cursor-pointer shrink-0 transition-colors duration-200"
                  style={{ background: roomOn ? 'var(--accent)' : 'var(--wp-control-bg)' }}
                >
                  <div
                    className="absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-transform duration-200"
                    style={{ transform: roomOn ? 'translateX(18px)' : 'translateX(2px)' }}
                  />
                </div>

                <ChevronDown
                  size={12}
                  className="text-[var(--wp-text-muted)] shrink-0 transition-transform duration-200"
                  style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>

              {/* Expanded lights */}
              {isExpanded && (
                <div className="pl-7 py-2 space-y-2">
                  {room.lights.map(light => (
                    <div key={light.id} className="flex items-center gap-2.5 min-h-[32px]">
                      <span className="text-[11px] text-[var(--wp-text-secondary)] flex-1 min-w-0 truncate">
                        {light.name}
                      </span>

                      {/* Brightness bar */}
                      <div className="w-[48px] h-[3px] rounded-full shrink-0 overflow-hidden" style={{ background: 'var(--wp-control-bg)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${light.on ? light.brightness : 0}%`,
                            background: TEMP_COLORS[light.colorTemp],
                            opacity: light.on ? 1 : 0.3,
                          }}
                        />
                      </div>

                      {/* Per-light toggle */}
                      <div
                        onClick={() => onToggleLight(room.id, light.id)}
                        className="w-[30px] h-[16px] rounded-full relative cursor-pointer shrink-0 transition-colors duration-200"
                        style={{ background: light.on ? TEMP_COLORS[light.colorTemp] : 'var(--wp-control-bg)' }}
                      >
                        <div
                          className="absolute top-[2px] w-[12px] h-[12px] rounded-full bg-white shadow-sm transition-transform duration-200"
                          style={{ transform: light.on ? 'translateX(16px)' : 'translateX(2px)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
