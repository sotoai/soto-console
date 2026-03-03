'use client'

import { useUser } from '@clerk/nextjs'

export function UserAvatar() {
  const { user, isLoaded } = useUser()

  if (!isLoaded || !user) return null

  return (
    <div className="flex items-center gap-2">
      <span className="hidden sm:inline text-[13px] font-medium text-[var(--text-secondary)] truncate max-w-[120px]">
        {user.firstName || user.username || 'User'}
      </span>
      <img
        src={user.imageUrl}
        alt={user.firstName || 'Avatar'}
        className="rounded-full shrink-0"
        style={{ width: 28, height: 28 }}
        referrerPolicy="no-referrer"
      />
    </div>
  )
}
