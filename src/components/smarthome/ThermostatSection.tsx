'use client'

import { Thermometer, Droplets, Minus, Plus } from 'lucide-react'
import { SmartHomeHeader } from './SmartHomeHeader'
import { type NestThermostat, type ThermostatMode, MODE_COLORS } from './mock-data'

const MODES: { key: ThermostatMode; label: string }[] = [
  { key: 'heat', label: 'Heat' },
  { key: 'cool', label: 'Cool' },
  { key: 'auto', label: 'Auto' },
  { key: 'eco', label: 'Eco' },
  { key: 'off', label: 'Off' },
]

// Arc constants — 270° arc (open at bottom)
const RADIUS = 54
const STROKE_WIDTH = 5
const CENTER = RADIUS + STROKE_WIDTH + 2
const SIZE = CENTER * 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const ARC_LENGTH = CIRCUMFERENCE * 0.75 // 270°
const ARC_GAP = CIRCUMFERENCE - ARC_LENGTH
const TEMP_MIN = 60
const TEMP_MAX = 85

function tempToArc(temp: number): number {
  const fraction = Math.max(0, Math.min(1, (temp - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)))
  return ARC_LENGTH * fraction
}

interface ThermostatSectionProps {
  thermostat: NestThermostat
  onTargetChange: (temp: number) => void
  onModeChange: (mode: ThermostatMode) => void
}

export function ThermostatSection({ thermostat, onTargetChange, onModeChange }: ThermostatSectionProps) {
  const modeColor = MODE_COLORS[thermostat.mode]
  const arcFill = tempToArc(thermostat.currentTemp)

  const statusText = thermostat.mode === 'off'
    ? 'Off'
    : thermostat.running
      ? thermostat.mode === 'heat' ? 'Heating' : 'Cooling'
      : 'Idle'

  return (
    <div className="flex flex-col h-full">
      <SmartHomeHeader
        title="Climate"
        icon={Thermometer}
        statusText={statusText}
        statusColor={thermostat.running ? modeColor : undefined}
      />

      {/* Arc gauge */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 min-h-0">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} className="block">
            {/* Background arc */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="var(--wp-control-bg)"
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={`${ARC_LENGTH} ${ARC_GAP}`}
              strokeDashoffset={-ARC_GAP / 2 - ARC_LENGTH / 2}
              strokeLinecap="round"
              transform={`rotate(0 ${CENTER} ${CENTER})`}
            />
            {/* Filled arc */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={modeColor}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={`${arcFill} ${CIRCUMFERENCE - arcFill}`}
              strokeDashoffset={-ARC_GAP / 2 - ARC_LENGTH / 2}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.4s ease, stroke 0.3s ease' }}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[28px] font-bold text-[var(--wp-text)] leading-none tabular-nums">
              {thermostat.currentTemp}°
            </span>
            <span className="text-[10px] text-[var(--wp-text-muted)] mt-0.5">
              {thermostat.humidity}% humidity
            </span>
          </div>
        </div>

        {/* Target temp controls */}
        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={() => onTargetChange(thermostat.targetTemp - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-all duration-150 active:scale-90"
            style={{ background: 'var(--wp-control-bg)' }}
          >
            <Minus size={14} className="text-[var(--wp-text-secondary)]" />
          </button>
          <div className="text-center min-w-[60px]">
            <span className="text-[14px] font-semibold text-[var(--wp-text-secondary)] tabular-nums">
              Set {thermostat.targetTemp}°
            </span>
          </div>
          <button
            onClick={() => onTargetChange(thermostat.targetTemp + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-all duration-150 active:scale-90"
            style={{ background: 'var(--wp-control-bg)' }}
          >
            <Plus size={14} className="text-[var(--wp-text-secondary)]" />
          </button>
        </div>

        {/* Humidity */}
        <div className="flex items-center gap-1 mt-1">
          <Droplets size={11} className="text-[var(--wp-text-muted)]" />
          <span className="text-[10px] text-[var(--wp-text-muted)]">{thermostat.humidity}%</span>
        </div>
      </div>

      {/* Mode selector */}
      <div className="flex items-center gap-1 mt-3 shrink-0">
        {MODES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onModeChange(key)}
            className="flex-1 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wider cursor-pointer transition-all duration-200 active:scale-95"
            style={{
              background: thermostat.mode === key ? modeColor : 'var(--wp-control-bg)',
              color: thermostat.mode === key ? '#fff' : 'var(--wp-text-muted)',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
