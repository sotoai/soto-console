import type { AppManifest } from '@/types'

export const apps: AppManifest[] = []

export function getAppById(id: string): AppManifest | undefined {
  return apps.find(app => app.id === id)
}

export function getAppByPath(pathname: string): AppManifest | undefined {
  return apps.find(app => pathname.startsWith(app.basePath))
}
