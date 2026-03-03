import { currentUser } from '@clerk/nextjs/server'
import { getUserByClerkId, upsertUser } from '@/lib/services/user-service'
import type { LocalUser } from '@/types/auth'

/**
 * On-demand sync: fetches the current Clerk user, ensures a matching
 * row exists in the local SQLite users table, and returns it.
 *
 * Call this from Server Components / Route Handlers where you need
 * the full LocalUser record.  Returns null when not signed in.
 */
export async function syncCurrentUser(): Promise<LocalUser | null> {
  const clerk = await currentUser()
  if (!clerk) return null

  const existing = getUserByClerkId(clerk.id)
  if (existing) return existing

  // First sign-in — create the local record
  return upsertUser({
    clerk_id: clerk.id,
    email: clerk.emailAddresses[0]?.emailAddress ?? '',
    display_name:
      clerk.firstName && clerk.lastName
        ? `${clerk.firstName} ${clerk.lastName}`
        : clerk.firstName || clerk.username || 'User',
    avatar_url: clerk.imageUrl ?? null,
    role: (clerk.publicMetadata?.role as string) === 'admin' ? 'admin' : 'member',
  })
}
