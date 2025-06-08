"use client"

import { useAuth } from "@/hooks/use-auth"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * Un componente semplice per visualizzare il ruolo più alto di un utente nell'UI
 * Da utilizzare nella navbar o in altri spazi compatti
 */
export function UserRoleIndicator() {
  const { user, profile, isAdmin, isModerator } = useAuth()

  if (!user || !profile) return null
  // Definisce la visualizzazione del ruolo basata sul ruolo effettivo dell'utente
  if (isAdmin) {
    return (
        <Badge
            variant="outline"
            className={cn("ml-2 text-xs bg-primary/10 text-primary border-primary/20")}        >
          Amministratore
        </Badge>
    )
  }

  if (isModerator) {
    return (
        <Badge
            variant="outline"
            className={cn("ml-2 text-xs bg-blue-500/10 text-blue-500 border-blue-500/20")}        >
          Moderatore
        </Badge>
    )
  }
  // Badge predefinito per i membri normali
  return (
      <Badge
          variant="outline"
          className="ml-2 text-xs bg-muted/10 text-muted-foreground border-muted/20"      >
        Membro
      </Badge>
  )
}