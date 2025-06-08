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
 * Componente per renderizzare condizionalmente il contenuto basato sui ruoli utente
 * Ora utilizza i ruoli del database invece dei ruoli Discord
 */
export function RoleGate({
                           children,
                           requiredRole,
                           allowedRoles,
                           fallback,
                           requireAuth = true
                         }: RoleGateProps) {  const { user, profile, isLoading } = useAuth()

  // Mostra stato di caricamento
  if (isLoading) {
    return fallback ? <>{fallback}</> : null
  }

  // Se l'autenticazione è richiesta ma l'utente non è loggato
  if (requireAuth && !user) {
    return fallback ? <>{fallback}</> : null
  }

  // Se l'utente è bannato
  if (profile?.is_banned) {    const bannedFallback = (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center">
          <h3 className="font-semibold text-destructive mb-2">Account Sospeso</h3>
          <p className="text-sm text-muted-foreground">
            {profile.ban_reason || 'Il tuo account è stato sospeso dal forum.'}
          </p>
        </div>
    )
    return fallback || bannedFallback
  }

  // Controlla l'accesso basato sui ruoli
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
    }  }

  // L'utente ha i permessi appropriati, renderizza i children
  return <>{children}</>
}

/**
 * Funzione helper per controllare se il ruolo utente soddisfa il ruolo richiesto
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
 * Hook per il rendering condizionale basato sui ruoli
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