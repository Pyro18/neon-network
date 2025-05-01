"use client"

import { useAuth } from "@/hooks/use-auth"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * A simple component to display a user's highest role in the UI
 * To be used in the navbar or other compact spaces
 */
export function UserRoleIndicator() {
  const { user, hasRole } = useAuth()

  if (!user) return null

  // Define role order from highest to lowest
  const roles = [
    {
      id: process.env.NEXT_PUBLIC_DISCORD_MANAGER_ROLE_ID || 'manager',
      name: 'Admin',
      color: 'primary',
      colorClass: 'bg-primary/10 text-primary border-primary/20'
    },
    {
      id: process.env.NEXT_PUBLIC_DISCORD_MODERATOR_ROLE_ID || 'moderator',
      name: 'Mod',
      color: 'blue',
      colorClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    },
    // Add more roles as needed, in priority order
  ]

  // Check for the highest role the user has
  for (const role of roles) {
    const { hasRole: userHasRole } = hasRole(role.id)
    if (userHasRole) {
      return (
        <Badge 
          variant="outline" 
          className={cn("ml-2 text-xs", role.colorClass)}
        >
          {role.name}
        </Badge>
      )
    }
  }

  // Default badge for users with no special roles
  return (
    <Badge 
      variant="outline" 
      className="ml-2 text-xs bg-muted/10 text-muted-foreground border-muted/20"
    >
      Member
    </Badge>
  )
}