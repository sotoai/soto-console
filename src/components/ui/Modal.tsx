'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: 'sm' | 'md' | 'lg'
}

const widthMap = {
  sm: 'max-w-[calc(100%-2rem)] md:max-w-md',
  md: 'max-w-[calc(100%-2rem)] md:max-w-lg',
  lg: 'max-w-[calc(100%-2rem)] md:max-w-2xl',
}

export function Modal({ open, onClose, title, children, width = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === overlayRef.current) onClose()
          }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${widthMap[width]} bg-[var(--bg-elevated)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] overflow-hidden`}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 className="text-[17px] font-bold text-[var(--text-primary)]">{title}</h2>
              <button
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] active:text-[var(--text-primary)] active:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div className="px-6 pb-6 max-h-[70vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
