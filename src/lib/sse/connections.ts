/**
 * In-memory SSE connection manager.
 *
 * Tracks active EventSource connections per user.
 * Provides broadcast helpers for leaderboard updates and presence.
 *
 * This works because Next.js standalone runs a single Node process.
 * If scaling to multiple processes, replace with Redis pub/sub.
 */

export interface ConnectedUser {
  clerkId: string
  displayName: string
  avatarUrl: string | null
}

interface SSEConnection {
  user: ConnectedUser
  controller: ReadableStreamDefaultController
  heartbeat: ReturnType<typeof setInterval>
}

const encoder = new TextEncoder()
const connections = new Map<string, SSEConnection>()

/** Format an SSE message */
function sseMessage(event: string, data: unknown): Uint8Array {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

/** Register a new SSE connection */
export function addConnection(
  clerkId: string,
  user: ConnectedUser,
  controller: ReadableStreamDefaultController
): void {
  // If this user already has a connection, clean up the old one
  const existing = connections.get(clerkId)
  if (existing) {
    clearInterval(existing.heartbeat)
    try { existing.controller.close() } catch { /* already closed */ }
  }

  // Start a 30s heartbeat to keep the connection alive
  const heartbeat = setInterval(() => {
    try {
      controller.enqueue(encoder.encode(': heartbeat\n\n'))
    } catch {
      clearInterval(heartbeat)
      connections.delete(clerkId)
    }
  }, 30_000)

  connections.set(clerkId, { user, controller, heartbeat })
}

/** Remove a connection (on disconnect) */
export function removeConnection(clerkId: string): void {
  const conn = connections.get(clerkId)
  if (conn) {
    clearInterval(conn.heartbeat)
    try { conn.controller.close() } catch { /* already closed */ }
    connections.delete(clerkId)
  }
}

/** Get list of currently online users */
export function getOnlineUsers(): ConnectedUser[] {
  return Array.from(connections.values()).map(c => c.user)
}

/** Send an event to all connected clients */
export function broadcast(event: string, data: unknown): void {
  const message = sseMessage(event, data)
  const stale: string[] = []

  for (const [clerkId, conn] of connections) {
    try {
      conn.controller.enqueue(message)
    } catch {
      // Connection is dead — mark for cleanup
      clearInterval(conn.heartbeat)
      stale.push(clerkId)
    }
  }

  // Remove stale connections
  for (const id of stale) {
    connections.delete(id)
  }
}

/** Broadcast the current online user list to all clients */
export function broadcastPresence(): void {
  broadcast('presence', getOnlineUsers())
}
