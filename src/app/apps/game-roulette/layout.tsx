'use client'

import { AppSidebar } from '@/components/shell/AppSidebar'
import { gameRouletteApp } from '@/apps/game-roulette/registry'

export default function GameRouletteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-44px)]">
      <AppSidebar app={gameRouletteApp} />
      <div className="flex-1 ml-[240px] flex flex-col">
        <main className="flex-1 px-10 py-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
