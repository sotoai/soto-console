'use client'

import { getInitials } from '@/lib/utils'
import type { OnlineUser } from '@/hooks/useRealtimeEvents'

interface OnlineUsersProps {
  users: OnlineUser[]
}

const MAX_VISIBLE = 6

export function OnlineUsers({ users }: OnlineUsersProps) {
  if (users.length === 0) return null

  const visible = users.slice(0, MAX_VISIBLE)
  const overflow = users.length - MAX_VISIBLE

  return (
    <div
      className="py-2 mb-2"
      style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="rounded-full shrink-0"
          style={{ width: 6, height: 6, background: '#22c55e' }}
        />
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--wp-text-tertiary)', textShadow: 'var(--wp-shadow)' }}
        >
          Online ({users.length})
        </span>
      </div>

      <div className="flex items-center -space-x-1.5">
        {visible.map(user => (
          <div
            key={user.clerkId}
            className="relative shrink-0"
            title={user.displayName}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="rounded-full ring-1 ring-black/20"
                style={{ width: 24, height: 24 }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="rounded-full flex items-center justify-center text-[9px] font-bold text-white ring-1 ring-black/20"
                style={{
                  width: 24,
                  height: 24,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                }}
              >
                {getInitials(user.displayName)}
              </div>
            )}
            {/* Green online dot */}
            <div
              className="absolute rounded-full ring-1 ring-black/30"
              style={{
                width: 8,
                height: 8,
                background: '#22c55e',
                bottom: -1,
                right: -1,
              }}
            />
          </div>
        ))}

        {overflow > 0 && (
          <div
            className="rounded-full flex items-center justify-center text-[9px] font-bold ring-1 ring-black/20 shrink-0"
            style={{
              width: 24,
              height: 24,
              background: 'rgba(255,255,255,0.1)',
              color: 'var(--wp-text-secondary)',
            }}
          >
            +{overflow}
          </div>
        )}
      </div>
    </div>
  )
}
