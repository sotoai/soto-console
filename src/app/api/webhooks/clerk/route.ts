import { type NextRequest } from 'next/server'
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { upsertUser, deleteUserByClerkId } from '@/lib/services/user-service'
import type { UserRole } from '@/types/auth'

export async function POST(request: NextRequest) {
  try {
    const evt = await verifyWebhook(request)

    const eventType = evt.type

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, username, image_url, public_metadata } =
        evt.data

      const email = email_addresses?.[0]?.email_address ?? ''
      const displayName =
        first_name && last_name
          ? `${first_name} ${last_name}`
          : first_name || username || 'User'

      const role: UserRole =
        (public_metadata?.role as string) === 'admin' ? 'admin' : 'member'

      upsertUser({
        clerk_id: id,
        email,
        display_name: displayName,
        avatar_url: image_url ?? null,
        role,
      })
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data
      if (id) deleteUserByClerkId(id)
    }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response('Webhook verification failed', { status: 400 })
  }
}
