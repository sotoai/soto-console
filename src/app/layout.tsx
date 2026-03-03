import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import { StatusBar } from '@/components/shell/StatusBar'
import './globals.css'

export const metadata: Metadata = {
  title: 'HomeBase',
  description: 'Your household command center.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="h-screen relative z-10 flex flex-col overflow-hidden">
            <StatusBar />
            <main className="flex-1 min-h-0">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
