import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId } from '@/lib/services/user-service'
import { syncCurrentUser } from './sync-user'
import type { LocalUser } from '@/types/auth'

/**
 * Server-side helper for API routes and Server Components.
 *
 * 1. Reads the Clerk session via `auth()`
 * 2. Looks up the local user in SQLite
 * 3. If missing (first request after sign-in), falls back to `syncCurrentUser()`
 *
 * Throws if no authenticated session exists.
 */
export async function getAuthUser(): Promise<LocalUser> {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  // Fast path — user already synced
  const local = getUserByClerkId(userId)
  if (local) return local

  // Slow path — first sign-in, sync from Clerk
  const synced = await syncCurrentUser()
  if (!synced) throw new Error('Failed to sync user from Clerk')
  return synced
}
