"use client"

import { ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"

interface RoleGateProps {
  children: ReactNode
  requiredRole?: 'member' | 'moderator' | 'admin'
  allowedRoles?: ('member' | 'moderator' | 'admin')[]
  fallback?: ReactNode
  requireAuth?: boolean
}

/**
 * Component to conditionally render content based on user roles
 * Now uses database roles instead of Discord roles
 */
export function RoleGate({
                           children,
                           requiredRole,
                           allowedRoles,
                           fallback,
                           requireAuth = true
                         }: RoleGateProps) {
  const { user, profile, isLoading } = useAuth()

  // Show loading state
  if (isLoading) {
    return fallback ? <>{fallback}</> : null
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return fallback ? <>{fallback}</> : null
  }

  // If user is banned
  if (profile?.is_banned) {
    const bannedFallback = (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center">
          <h3 className="font-semibold text-destructive mb-2">Account Suspended</h3>
          <p className="text-sm text-muted-foreground">
            {profile.ban_reason || 'Your account has been suspended from the forum.'}
          </p>
        </div>
    )
    return fallback || bannedFallback
  }

  // Check role-based access
  if (requiredRole) {
    const hasAccess = profile && hasRequiredRole(profile.role, requiredRole)
    if (!hasAccess) {
      return fallback ? <>{fallback}</> : null
    }
  }

  if (allowedRoles) {
    const hasAccess = profile && allowedRoles.includes(profile.role)
    if (!hasAccess) {
      return fallback ? <>{fallback}</> : null
    }
  }

  // User has appropriate permission, render children
  return <>{children}</>
}

/**
 * Helper function to check if user role meets required role
 * admin > moderator > member
 */
function hasRequiredRole(
    userRole: 'member' | 'moderator' | 'admin',
    requiredRole: 'member' | 'moderator' | 'admin'
): boolean {
  const roleHierarchy = { member: 0, moderator: 1, admin: 2 }
  const userLevel = roleHierarchy[userRole] ?? -1
  const requiredLevel = roleHierarchy[requiredRole] ?? 0

  return userLevel >= requiredLevel
}

/**
 * Hook for role-based conditional rendering
 */
export function useRoleGate() {
  const { profile } = useAuth()

  const hasRole = (requiredRole: 'member' | 'moderator' | 'admin'): boolean => {
    if (!profile || profile.is_banned) return false
    return hasRequiredRole(profile.role, requiredRole)
  }

  const hasAnyRole = (roles: ('member' | 'moderator' | 'admin')[]): boolean => {
    if (!profile || profile.is_banned) return false
    return roles.includes(profile.role)
  }

  return {
    hasRole,
    hasAnyRole,
    isAdmin: profile?.role === 'admin' && !profile?.is_banned,
    isModerator: (profile?.role === 'moderator' || profile?.role === 'admin') && !profile?.is_banned,
    canModerate: (profile?.role === 'moderator' || profile?.role === 'admin') && !profile?.is_banned,
    isBanned: profile?.is_banned ?? false
  }
}