'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload } from 'lucide-react'

interface HomeScreenProps {
  onVideoLoaded: (file: File) => void
}

export function HomeScreen({ onVideoLoaded }: HomeScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      if (file.type.startsWith('video/')) {
        onVideoLoaded(file)
      }
    },
    [onVideoLoaded],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-6"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Logo + Title */}
      <div className="text-center mb-10 animate-fade-in">
        <div className="text-6xl mb-4">🐔</div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: 'rgba(255,255,255,0.95)' }}
        >
          Screaming Chicken
        </h1>
        <p
          className="mt-2 text-sm"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          Turn any clip into a meme remix
        </p>
      </div>

      {/* Upload Zone */}
      <button
        onClick={() => inputRef.current?.click()}
        className={`
          relative group cursor-pointer outline-none
          w-full max-w-xs aspect-square rounded-3xl
          flex flex-col items-center justify-center gap-4
          transition-all duration-300
          ${isDragging ? 'scale-105' : 'hover:scale-[1.02] active:scale-95'}
        `}
        style={{
          background: isDragging
            ? 'rgba(255, 150, 0, 0.25)'
            : 'rgba(255, 255, 255, 0.06)',
          border: `2px dashed ${isDragging ? 'rgba(255, 150, 0, 0.6)' : 'rgba(255, 255, 255, 0.15)'}`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, #FF9500, #FF3B30)',
          }}
        >
          <Upload size={28} className="text-white" strokeWidth={2.5} />
        </div>

        <div className="text-center">
          <p
            className="text-lg font-semibold"
            style={{ color: 'rgba(255,255,255,0.9)' }}
          >
            Add Your Clip
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            Drop a video or tap to browse
          </p>
        </div>

        {/* Pulsing ring animation */}
        <div
          className="absolute inset-0 rounded-3xl animate-pulse pointer-events-none"
          style={{
            border: '1px solid rgba(255, 150, 0, 0.15)',
          }}
        />
      </button>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Tip */}
      <p
        className="mt-8 text-xs text-center animate-fade-in"
        style={{ color: 'rgba(255,255,255,0.3)', animationDelay: '200ms' }}
      >
        Best with clips under 5 seconds
      </p>
    </div>
  )
}
