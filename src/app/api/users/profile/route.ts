import { NextResponse, type NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth/get-auth-user'
import { updateDisplayName } from '@/lib/services/user-service'

export async function GET() {
  try {
    const user = await getAuthUser()
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser()
    const { display_name } = await request.json()

    if (!display_name || typeof display_name !== 'string') {
      return NextResponse.json({ error: 'display_name is required' }, { status: 400 })
    }

    const trimmed = display_name.trim()
    if (trimmed.length < 1 || trimmed.length > 100) {
      return NextResponse.json({ error: 'display_name must be 1-100 characters' }, { status: 400 })
    }

    const updated = updateDisplayName(user.clerk_id, trimmed)
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
}
