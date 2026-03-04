'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { Check, LogOut, Pencil, X } from 'lucide-react'

export function UserAvatar() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const [open, setOpen] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const popoverRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch local display name on mount
  useEffect(() => {
    if (!isLoaded || !user) return
    fetch('/api/users/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.display_name) setDisplayName(data.display_name)
        else setDisplayName(user.firstName || user.username || 'User')
      })
      .catch(() => setDisplayName(user.firstName || user.username || 'User'))
  }, [isLoaded, user])

  // Close popover on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false)
        setEditing(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Focus input when editing starts
  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const startEditing = useCallback(() => {
    setInputValue(displayName)
    setEditing(true)
  }, [displayName])

  const cancelEditing = useCallback(() => {
    setEditing(false)
    setInputValue('')
  }, [])

  const saveDisplayName = useCallback(async () => {
    const trimmed = inputValue.trim()
    if (!trimmed || trimmed === displayName) {
      cancelEditing()
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: trimmed }),
      })
      if (res.ok) {
        const data = await res.json()
        setDisplayName(data.display_name)
      }
    } catch (err) {
      console.error('Failed to update display name:', err)
    } finally {
      setSaving(false)
      setEditing(false)
    }
  }, [inputValue, displayName, cancelEditing])

  if (!isLoaded || !user) return null

  return (
    <div className="relative" ref={popoverRef}>
      {/* Avatar button */}
      <button
        onClick={() => { setOpen(o => !o); setEditing(false) }}
        className="flex items-center gap-2 cursor-pointer outline-none"
      >
        <span className="hidden sm:inline text-[13px] font-medium text-[var(--text-secondary)] truncate max-w-[120px]">
          {displayName}
        </span>
        <img
          src={user.imageUrl}
          alt={displayName}
          className="rounded-full shrink-0"
          style={{ width: 28, height: 28 }}
          referrerPolicy="no-referrer"
        />
      </button>

      {/* Popover */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 rounded-[var(--radius-lg)] overflow-hidden"
          style={{
            width: 240,
            background: 'var(--bg-primary)',
            border: '0.5px solid var(--border-strong)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          }}
        >
          {/* User info */}
          <div className="p-3 flex items-center gap-3">
            <img
              src={user.imageUrl}
              alt={displayName}
              className="rounded-full shrink-0"
              style={{ width: 36, height: 36 }}
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex items-center gap-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveDisplayName()
                      if (e.key === 'Escape') cancelEditing()
                    }}
                    maxLength={100}
                    className="text-[13px] font-semibold w-full px-1.5 py-0.5 rounded-[var(--radius-sm)] outline-none"
                    style={{
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-strong)',
                    }}
                    disabled={saving}
                  />
                  <button
                    onClick={saveDisplayName}
                    disabled={saving}
                    className="shrink-0 p-1 rounded-[var(--radius-sm)] text-green-500 hover:bg-green-500/10 cursor-pointer"
                  >
                    <Check size={14} strokeWidth={2} />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="shrink-0 p-1 rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] cursor-pointer"
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                    {displayName}
                  </p>
                  <button
                    onClick={startEditing}
                    className="shrink-0 p-0.5 rounded text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] cursor-pointer"
                  >
                    <Pencil size={11} strokeWidth={2} />
                  </button>
                </div>
              )}
              <p className="text-[11px] text-[var(--text-tertiary)] truncate">
                {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 0.5, background: 'var(--border-strong)' }} />

          {/* Actions */}
          <div className="p-1">
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] text-[12px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
            >
              <LogOut size={14} strokeWidth={1.5} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
