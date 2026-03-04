'use client'

import { useRef, useCallback } from 'react'
import { ChevronLeft, ChevronDown, ChevronRight, RotateCw, ChevronsDown } from 'lucide-react'

interface TouchControlsProps {
  onMoveLeft: () => void
  onMoveRight: () => void
  onMoveDown: () => void
  onRotate: () => void
  onHardDrop: () => void
  disabled?: boolean
}

// ─── Hold-to-repeat button ───

interface GameButtonProps {
  onAction: () => void
  icon: React.ReactNode
  label: string
  disabled?: boolean
  repeat?: boolean // enable hold-to-repeat
  large?: boolean
}

function GameButton({ onAction, icon, label, disabled, repeat, large }: GameButtonProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const activeRef = useRef(false)

  const stopRepeat = useCallback(() => {
    activeRef.current = false
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      if (disabled) return
      activeRef.current = true
      onAction()
      if (repeat) {
        // Start repeating after 180ms initial delay, then every 80ms
        intervalRef.current = setTimeout(() => {
          if (!activeRef.current) return
          intervalRef.current = setInterval(() => {
            if (activeRef.current) onAction()
          }, 80) as unknown as ReturnType<typeof setInterval>
        }, 180) as unknown as ReturnType<typeof setInterval>
      }
    },
    [onAction, disabled, repeat]
  )

  const handlePointerUp = useCallback(() => stopRepeat(), [stopRepeat])
  const handlePointerLeave = useCallback(() => stopRepeat(), [stopRepeat])

  const size = large ? 56 : 48

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onContextMenu={e => e.preventDefault()}
        className="flex items-center justify-center rounded-full transition-colors cursor-pointer active:scale-95"
        style={{
          width: size,
          height: size,
          background: disabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.08)',
          opacity: disabled ? 0.4 : 1,
          touchAction: 'none',
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none',
        }}
      >
        {icon}
      </button>
      <span
        className="text-[8px] uppercase tracking-wider font-medium"
        style={{ color: 'rgba(255,255,255,0.25)' }}
      >
        {label}
      </span>
    </div>
  )
}

// ─── Main controls bar ───

export function TouchControls({
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onRotate,
  onHardDrop,
  disabled = false,
}: TouchControlsProps) {
  return (
    <div
      className="flex items-center justify-between px-4 py-2 shrink-0"
      style={{
        borderTop: '1px solid rgba(255,255,255,0.04)',
        touchAction: 'none',
      }}
    >
      {/* Directional controls */}
      <div className="flex items-center gap-3">
        <GameButton
          onAction={onMoveLeft}
          icon={<ChevronLeft size={22} className="text-white/60" strokeWidth={2} />}
          label="Left"
          disabled={disabled}
          repeat
        />
        <GameButton
          onAction={onMoveDown}
          icon={<ChevronDown size={22} className="text-white/60" strokeWidth={2} />}
          label="Down"
          disabled={disabled}
          repeat
        />
        <GameButton
          onAction={onMoveRight}
          icon={<ChevronRight size={22} className="text-white/60" strokeWidth={2} />}
          label="Right"
          disabled={disabled}
          repeat
        />
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-3">
        <GameButton
          onAction={onRotate}
          icon={<RotateCw size={20} className="text-white/60" strokeWidth={2} />}
          label="Rotate"
          disabled={disabled}
        />
        <GameButton
          onAction={onHardDrop}
          icon={<ChevronsDown size={22} className="text-white/60" strokeWidth={2} />}
          label="Drop"
          disabled={disabled}
          large
        />
      </div>
    </div>
  )
}
