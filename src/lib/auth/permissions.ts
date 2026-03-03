import type { UserRole } from '@/types/auth'

const ROLE_RANK: Record<UserRole, number> = {
  guest: 0,
  member: 1,
  admin: 2,
}

/** Returns true if `userRole` meets or exceeds `minRole` in the hierarchy */
export function hasMinRole(userRole: UserRole, minRole: UserRole): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[minRole]
}

/** Shorthand: is the user an admin? */
export function isAdmin(role: UserRole): boolean {
  return role === 'admin'
}
