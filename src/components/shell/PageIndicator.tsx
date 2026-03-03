'use client'

const BTN_SIZE = 44

interface PageIndicatorProps {
  total: number
  current: number
  onPageSelect: (index: number) => void
}

export function PageIndicator({ total, current, onPageSelect }: PageIndicatorProps) {
  if (total <= 1) return null

  return (
    <div className="flex items-center justify-center py-0 shrink-0">
      <div className="relative flex items-center">
        {/* Grey background dots */}
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            onClick={() => onPageSelect(i)}
            className="cursor-pointer outline-none flex items-center justify-center"
            style={{ width: BTN_SIZE, height: BTN_SIZE }}
          >
            <div
              className="rounded-full"
              style={{
                width: 'var(--page-dot-size)',
                height: 'var(--page-dot-size)',
                background: 'var(--wp-text-tertiary)',
                opacity: 0.4,
              }}
            />
          </button>
        ))}

        {/* Active indicator — slides via CSS transform, no framer-motion conflicts */}
        <div
          className="absolute left-0 rounded-full pointer-events-none"
          style={{
            width: 'calc(var(--page-dot-size) + 2px)',
            height: 'calc(var(--page-dot-size) + 2px)',
            background: 'var(--wp-text)',
            top: 0,
            bottom: 0,
            marginBlock: 'auto',
            marginLeft: `calc(${BTN_SIZE / 2}px - (var(--page-dot-size) + 2px) / 2)`,
            transform: `translateX(${current * BTN_SIZE}px)`,
            transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
    </div>
  )
}
