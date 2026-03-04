'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Radar,
  CloudSun,
  Thermometer,
  Wind,
  CloudRain,
  Sun,
  Mountain,
  ChevronDown,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface MapControlsProps {
  activeLayers: Set<string>
  onToggle: (layerId: string) => void
  weatherAvailable: boolean
}

const WEATHER_ITEMS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'temp', label: 'Temperature', icon: Thermometer },
  { id: 'wind', label: 'Wind', icon: Wind },
  { id: 'precipitation', label: 'Precipitation', icon: CloudRain },
]

export function MapControls({ activeLayers, onToggle, weatherAvailable }: MapControlsProps) {
  const [weatherOpen, setWeatherOpen] = useState(false)

  return (
    <div
      className="absolute bottom-4 left-4 z-10"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        className="rounded-[var(--radius-lg)] p-3 space-y-0.5 min-w-[160px]"
        style={{
          background: 'var(--wallpaper-card-bg)',
          border: '0.5px solid var(--wallpaper-card-border)',
          boxShadow: 'var(--wallpaper-card-shadow)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        }}
      >
        {/* UFO Sightings */}
        <ToggleRow
          icon={Radar}
          label="UFO Sightings"
          active={activeLayers.has('ufo')}
          onClick={() => onToggle('ufo')}
        />

        {/* Weather — expandable */}
        <div style={{ opacity: weatherAvailable ? 1 : 0.4, pointerEvents: weatherAvailable ? 'auto' : 'none' }}>
          <button
            onClick={() => weatherAvailable && setWeatherOpen(v => !v)}
            className="flex items-center gap-2.5 w-full py-2 px-1.5 rounded-lg transition-colors duration-150 cursor-pointer select-none active:bg-[var(--wp-control-bg)]"
          >
            <CloudSun size={15} className="text-[var(--wp-text-secondary)] shrink-0" />
            <span className="text-[12px] font-medium text-[var(--wp-text-secondary)] flex-1 text-left">
              {weatherAvailable ? 'Weather' : 'Weather (key req.)'}
            </span>
            <motion.div
              animate={{ rotate: weatherOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={12} className="text-[var(--wp-text-muted)]" />
            </motion.div>
          </button>

          <AnimatePresence>
            {weatherOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden pl-4"
              >
                {WEATHER_ITEMS.map(({ id, label, icon }) => (
                  <ToggleRow
                    key={id}
                    icon={icon}
                    label={label}
                    active={activeLayers.has(id)}
                    onClick={() => onToggle(id)}
                    compact
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Daylight */}
        <ToggleRow
          icon={Sun}
          label="Daylight"
          active={activeLayers.has('daylight')}
          onClick={() => onToggle('daylight')}
        />

        {/* Terrain */}
        <ToggleRow
          icon={Mountain}
          label="Terrain"
          active={activeLayers.has('relief')}
          onClick={() => onToggle('relief')}
        />
      </div>
    </div>
  )
}

// ─── Toggle Row ───

function ToggleRow({
  icon: Icon,
  label,
  active,
  onClick,
  compact = false,
}: {
  icon: LucideIcon
  label: string
  active: boolean
  onClick: () => void
  compact?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 w-full rounded-lg transition-colors duration-150 cursor-pointer select-none active:bg-[var(--wp-control-bg)]"
      style={{ padding: compact ? '6px 6px' : '8px 6px' }}
    >
      <Icon size={compact ? 13 : 15} className="text-[var(--wp-text-secondary)] shrink-0" />
      <span
        className="flex-1 text-left font-medium"
        style={{
          fontSize: compact ? '11px' : '12px',
          color: active ? 'var(--wp-text)' : 'var(--wp-text-secondary)',
        }}
      >
        {label}
      </span>
      <div
        className="w-2 h-2 rounded-full shrink-0 transition-colors duration-200"
        style={{
          backgroundColor: active ? 'var(--accent)' : 'var(--wp-control-bg)',
          boxShadow: active ? '0 0 6px var(--accent)' : 'none',
        }}
      />
    </button>
  )
}
