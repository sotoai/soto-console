'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Check } from 'lucide-react'

interface TextPopEditorProps {
  currentText: string
  onSave: (text: string) => void
  onClose: () => void
}

export function TextPopEditor({ currentText, onSave, onClose }: TextPopEditorProps) {
  const [text, setText] = useState(currentText)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    onSave(text.trim())
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Panel */}
      <div
        className="relative w-full max-w-md rounded-t-3xl p-5 pb-8 animate-slide-up"
        style={{
          background: 'rgba(28, 28, 30, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderBottom: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <X size={16} className="text-white/60" />
          </button>

          <h3
            className="font-bold"
            style={{ fontSize: '18px', color: 'rgba(255,255,255,0.95)' }}
          >
            Add Text
          </h3>

          <button
            onClick={handleSubmit}
            className="p-1.5 rounded-full cursor-pointer"
            style={{ background: 'rgba(48, 209, 88, 0.2)' }}
          >
            <Check size={16} className="text-green-400" />
          </button>
        </div>

        {/* Preview */}
        <div
          className="w-full aspect-video rounded-xl mb-4 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}
        >
          <span
            className="font-black text-white text-center px-4"
            style={{
              fontSize: text.length > 20 ? '20px' : '32px',
              textShadow: '2px 2px 0 black, -2px -2px 0 black, 2px -2px 0 black, -2px 2px 0 black',
            }}
          >
            {text || 'Your text here'}
          </span>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
          placeholder="Type your meme text..."
          maxLength={50}
          className="w-full px-4 py-3 rounded-xl outline-none font-semibold"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'white',
            fontSize: '16px',
          }}
        />

        {/* Suggestions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {['BRUH', 'NO WAY', 'SHEESH', 'RIP', 'W', 'OMG', 'CAUGHT IN 4K'].map(
            (suggestion) => (
              <button
                key={suggestion}
                onClick={() => setText(suggestion)}
                className="px-3 py-1.5 rounded-full cursor-pointer transition-all active:scale-90"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {suggestion}
              </button>
            ),
          )}
        </div>

        {/* Character count */}
        <p
          className="mt-3 text-right"
          style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}
        >
          {text.length}/50
        </p>
      </div>
    </div>
  )
}
