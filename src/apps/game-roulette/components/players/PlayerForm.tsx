'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface PlayerFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { name: string }) => void
  initialName?: string
}

export function PlayerForm({ open, onClose, onSubmit, initialName }: PlayerFormProps) {
  const [name, setName] = useState(initialName || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim() })
    setName('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initialName ? 'Edit Player' : 'Add Player'} width="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Player Name" id="player-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alex Johnson" required autoFocus />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initialName ? 'Save' : 'Add Player'}</Button>
        </div>
      </form>
    </Modal>
  )
}
