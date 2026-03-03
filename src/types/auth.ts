export type UserRole = 'admin' | 'member' | 'guest'

export interface LocalUser {
  id: string
  clerk_id: string
  email: string
  display_name: string
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface UpsertUserPayload {
  clerk_id: string
  email: string
  display_name: string
  avatar_url: string | null
  role?: UserRole
}
