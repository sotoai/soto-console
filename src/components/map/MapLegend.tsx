'use client'

import { AnimatePresence, motion } from 'framer-motion'

interface LegendConfig {
  layerId: string
  label: string
  gradient: string
  min: string
  max: string
}

const LEGENDS: LegendConfig[] = [
  {
    layerId: 'temp',
    label: 'Temperature',
    gradient: 'linear-gradient(90deg, #2563eb, #06b6d4, #22c55e, #eab308, #ef4444)',
    min: '-20°F',
    max: '110°F',
  },
  {
    layerId: 'wind',
    label: 'Wind Speed',
    gradient: 'linear-gradient(90deg, rgba(255,255,255,0.2), #06b6d4, #3b82f6, #8b5cf6)',
    min: '0 mph',
    max: '60 mph',
  },
  {
    layerId: 'precipitation',
    label: 'Precipitation',
    gradient: 'linear-gradient(90deg, rgba(59,130,246,0.1), #3b82f6, #8b5cf6)',
    min: '0 mm',
    max: '12 mm',
  },
  {
    layerId: 'clouds',
    label: 'Cloud Cover',
    gradient: 'linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.8))',
    min: '0%',
    max: '100%',
  },
  {
    layerId: 'earthquake',
    label: 'Earthquakes',
    gradient: 'linear-gradient(90deg, #22c55e, #eab308, #f97316, #ef4444)',
    min: 'M1',
    max: 'M7+',
  },
  {
    layerId: 'flights',
    label: 'Flights (Altitude)',
    gradient: 'linear-gradient(90deg, #06b6d4, #3b82f6, #6366f1, #8b5cf6)',
    min: '0 ft',
    max: '45k ft',
  },
]

interface MapLegendProps {
  activeLayers: Set<string>
}

export function MapLegend({ activeLayers }: MapLegendProps) {
  const visibleLegends = LEGENDS.filter(l => activeLayers.has(l.layerId))

  return (
    <div className="absolute bottom-4 right-4 z-10" onPointerDown={e => e.stopPropagation()}>
      <AnimatePresence>
        {visibleLegends.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="rounded-[var(--radius-lg)] p-2.5 space-y-2 min-w-[140px]"
            style={{
              background: 'var(--wallpaper-card-bg)',
              border: '0.5px solid var(--wallpaper-card-border)',
              boxShadow: 'var(--wallpaper-card-shadow)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            }}
          >
            {visibleLegends.map(legend => (
              <div key={legend.layerId}>
                <p
                  className="text-[10px] font-semibold mb-1 tracking-wide uppercase"
                  style={{ color: 'var(--wp-text-secondary)' }}
                >
                  {legend.label}
                </p>
                <div
                  className="h-2 rounded-full"
                  style={{ background: legend.gradient }}
                />
                <div className="flex justify-between mt-0.5">
                  <span
                    className="text-[9px]"
                    style={{ color: 'var(--wp-text-muted)' }}
                  >
                    {legend.min}
                  </span>
                  <span
                    className="text-[9px]"
                    style={{ color: 'var(--wp-text-muted)' }}
                  >
                    {legend.max}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
