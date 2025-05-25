"use client"

import { useAuth } from "@/hooks/use-auth"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * A simple component to display a user's highest role in the UI
 * To be used in the navbar or other compact spaces
 */
export function UserRoleIndicator() {
  const { user, profile, isAdmin, isModerator } = useAuth()

  if (!user || !profile) return null

  // Define role display based on user's actual role
  if (isAdmin) {
    return (
        <Badge
            variant="outline"
            className={cn("ml-2 text-xs bg-primary/10 text-primary border-primary/20")}
        >
          Admin
        </Badge>
    )
  }

  if (isModerator) {
    return (
        <Badge
            variant="outline"
            className={cn("ml-2 text-xs bg-blue-500/10 text-blue-500 border-blue-500/20")}
        >
          Mod
        </Badge>
    )
  }

  // Default badge for regular members
  return (
      <Badge
          variant="outline"
          className="ml-2 text-xs bg-muted/10 text-muted-foreground border-muted/20"
      >
        Member
      </Badge>
  )
}