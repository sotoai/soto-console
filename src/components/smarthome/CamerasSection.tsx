'use client'

import { Video, Shield, Battery } from 'lucide-react'
import { SmartHomeHeader } from './SmartHomeHeader'
import type { EufyCamera } from './mock-data'

interface CamerasSectionProps {
  cameras: EufyCamera[]
  onToggleArm: (cameraId: string) => void
}

export function CamerasSection({ cameras, onToggleArm }: CamerasSectionProps) {
  const onlineCount = cameras.filter(c => c.online).length

  return (
    <div className="flex flex-col h-full">
      <SmartHomeHeader
        title="Cameras"
        icon={Video}
        statusText={`${onlineCount}/${cameras.length} online`}
        statusColor={onlineCount === cameras.length ? '#30D158' : undefined}
      />

      {/* 2×2 camera grid */}
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-2">
        {cameras.map(cam => (
          <button
            key={cam.id}
            onClick={() => onToggleArm(cam.id)}
            className="relative rounded-[var(--radius-md)] overflow-hidden cursor-pointer group"
            style={{ aspectRatio: '16/10' }}
          >
            {/* Placeholder gradient "feed" */}
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, ${cam.gradientFrom}, ${cam.gradientTo})` }}
            >
              <Video
                size={20}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/15"
              />
            </div>

            {/* Offline overlay */}
            {!cam.online && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-white/50">
                  Offline
                </span>
              </div>
            )}

            {/* Bottom scrim with name */}
            <div className="absolute bottom-0 inset-x-0 p-1.5 pt-4" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }}>
              <p className="text-[10px] font-semibold text-white leading-tight truncate">
                {cam.name}
              </p>
              <p className="text-[8px] text-white/50 truncate">
                {cam.location}
              </p>
            </div>

            {/* Top-right badges */}
            <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
              {/* Online dot */}
              <div
                className="w-[5px] h-[5px] rounded-full"
                style={{ background: cam.online ? '#30D158' : '#FF453A' }}
              />
              {/* Armed shield */}
              {cam.armed && (
                <Shield size={8} className="text-white/60" fill="currentColor" />
              )}
            </div>

            {/* Top-left battery */}
            {cam.batteryLevel !== null && (
              <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5">
                <Battery
                  size={9}
                  className={cam.batteryLevel < 20 ? 'text-[#FF453A]' : 'text-white/50'}
                />
                <span
                  className="text-[7px] font-medium tabular-nums"
                  style={{ color: cam.batteryLevel < 20 ? '#FF453A' : 'rgba(255,255,255,0.5)' }}
                >
                  {cam.batteryLevel}%
                </span>
              </div>
            )}

            {/* Bottom-right last motion */}
            <div className="absolute bottom-1.5 right-1.5">
              <span className="text-[7px] text-white/35">
                {cam.lastMotion}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
