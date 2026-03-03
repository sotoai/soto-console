import type { AppManifest } from '@/types'
import { gameRouletteApp } from '@/apps/game-roulette/registry'

export const apps: AppManifest[] = [gameRouletteApp]

export function getAppById(id: string): AppManifest | undefined {
  return apps.find(app => app.id === id)
}

export function getAppByPath(pathname: string): AppManifest | undefined {
  return apps.find(app => pathname.startsWith(app.basePath))
}
