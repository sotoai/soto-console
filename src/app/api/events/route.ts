import { getAuthUser } from '@/lib/auth/get-auth-user'
import {
  addConnection,
  removeConnection,
  broadcastPresence,
  getOnlineUsers,
} from '@/lib/sse/connections'

export async function GET() {
  let user
  try {
    user = await getAuthUser()
  } catch {
    return new Response('Unauthorized', { status: 401 })
  }

  const clerkId = user.clerk_id
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      addConnection(clerkId, {
        clerkId,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
      }, controller)

      // Send the current online list immediately to this client
      const initialPresence = `event: presence\ndata: ${JSON.stringify(getOnlineUsers())}\n\n`
      controller.enqueue(encoder.encode(initialPresence))

      // Notify all other clients that this user came online
      broadcastPresence()
    },
    cancel() {
      removeConnection(clerkId)
      broadcastPresence()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // disable nginx buffering
    },
  })
}
