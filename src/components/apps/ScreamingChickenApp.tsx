'use client'

import { X } from 'lucide-react'

export default function ScreamingChickenApp({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full cursor-pointer"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <X size={20} className="text-white" strokeWidth={2} />
      </button>

      {/* Looping video */}
      <video
        src="/screaming-chicken.mp4"
        autoPlay
        loop
        muted={false}
        playsInline
        className="w-full h-full object-contain"
      />
    </div>
  )
}
