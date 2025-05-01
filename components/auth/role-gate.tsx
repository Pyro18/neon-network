"use client"

import { ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"

interface RoleGateProps {
  children: ReactNode
  requiredRoleIds: string[]
  fallback?: ReactNode
}

/**
 * Component to conditionally render content based on Discord roles
 * It checks if the user has any of the required Discord role IDs
 */
export function RoleGate({ children, requiredRoleIds, fallback }: RoleGateProps) {
  const { user } = useAuth()

  // If no user is authenticated, show fallback
  if (!user) {
    return fallback ? <>{fallback}</> : null
  }

  // Check if the user has any of the allowed roles from Discord
  const userDiscordRoles = user.identities?.find(
    (identity) => identity.provider === "discord"
  )?.identity_data?.["https://discord.com/roles"] || []

  // Check if any required role is in the user's roles
  const hasRequiredRole = requiredRoleIds.length === 0 || 
    requiredRoleIds.some(roleId => userDiscordRoles.includes(roleId))

  // User has appropriate permission, render the children
  if (hasRequiredRole) {
    return <>{children}</>
  }

  // User doesn't have required roles, show fallback
  return fallback ? <>{fallback}</> : null
}