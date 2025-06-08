"use client"

import { useAuth } from "@/hooks/use-auth"
import { NeonCard, NeonCardContent, NeonCardHeader, NeonCardTitle } from "@/components/neon-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

/**
 * Componente che mostra lo stato di connessione Discord e i ruoli
 */
export function DiscordRolesDisplay() {
  const { user, signInWithOAuth } = useAuth()

  // Ottieni le informazioni dell'identità Discord
  const discordIdentity = user?.identities?.find(
    (identity) => identity.provider === "discord"
  )

  // Analizza i ruoli Discord dell'utente (se disponibili)
  const discordRoles = discordIdentity?.identity_data?.["https://discord.com/roles"] || []
  const discordUsername = discordIdentity?.identity_data?.full_name || discordIdentity?.identity_data?.preferred_username

  // URL dell'avatar Discord
  const avatarUrl = discordIdentity?.identity_data?.avatar_url

  // Funzione per ottenere il nome del ruolo dall'ID
  const getRoleName = (roleId: string) => {
    // Mappa degli ID dei ruoli Discord comuni a nomi leggibili
    // In un'app reale, dovresti recuperare questo dal tuo server o dall'API Discord
    const roleMap: Record<string, { name: string, color: string }> = {
      [process.env.NEXT_PUBLIC_DISCORD_MANAGER_ROLE_ID || 'manager']: { 
        name: 'Manager',
        color: 'primary'
      },
      [process.env.NEXT_PUBLIC_DISCORD_MODERATOR_ROLE_ID || 'moderator']: { 
        name: 'Moderatore',
        color: 'blue'
      },      // Aggiungi altri ruoli se necessario
    }

    return roleMap[roleId] || { name: 'Membro', color: 'muted' }
  }

  const handleConnectDiscord = async () => {
    try {
      await signInWithOAuth('discord')
    } catch (error) {
      console.error('Errore durante la connessione con Discord:', error)
    }
  }

  if (!user) {    return (
      <NeonCard>
        <NeonCardHeader>
          <NeonCardTitle>Connessione Discord</NeonCardTitle>
        </NeonCardHeader>
        <NeonCardContent>
          <p className="text-muted-foreground mb-4">
            Accedi per vedere il tuo stato di connessione Discord e i permessi.
          </p>
          <Link href="/auth/login">
            <Button variant="outline">Accedi</Button>
          </Link>
        </NeonCardContent>
      </NeonCard>
    )
  }
  return (
    <NeonCard>
      <NeonCardHeader>
        <NeonCardTitle>Connessione Discord</NeonCardTitle>
      </NeonCardHeader>
      <NeonCardContent>
        {discordIdentity ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              {avatarUrl && (
                <img 
                  src={avatarUrl} 
                  alt="Discord avatar" 
                  className="w-10 h-10 rounded-full border border-border"
                />
              )}              <div>
                <div className="font-medium">{discordUsername}</div>
                <div className="text-sm text-muted-foreground">Connesso tramite Discord</div>
              </div>
            </div>            <div className="space-y-2">
              <h4 className="text-sm font-medium">I tuoi ruoli Discord:</h4>
              <div className="flex flex-wrap gap-2">
                {discordRoles.length > 0 ? (
                  discordRoles.map((roleId: string) => {
                    const { name, color } = getRoleName(roleId)
                    return (
                      <Badge 
                        key={roleId} 
                        variant={color === 'primary' ? 'default' : 'outline'}
                        className={`
                          ${color === 'blue' ? 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30' : ''} 
                          ${color === 'muted' ? 'bg-muted/20 text-muted-foreground hover:bg-muted/30' : ''}
                        `}
                      >
                        {name}
                      </Badge>
                    )
                  })                ) : (
                  <p className="text-sm text-muted-foreground">Nessun ruolo trovato</p>
                )}
              </div>
            </div>            <div className="mt-4 text-sm">
              <p className="text-muted-foreground">
                {discordRoles.includes(process.env.NEXT_PUBLIC_DISCORD_MANAGER_ROLE_ID || 'manager') || 
                 discordRoles.includes(process.env.NEXT_PUBLIC_DISCORD_MODERATOR_ROLE_ID || 'moderator') 
                  ? "Hai il permesso di creare nuovi thread e post nel forum."
                  : "Hai bisogno di un ruolo Manager o Moderatore per creare nuovi thread nel forum."}
              </p>
            </div>
          </>
        ) : (          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Connetti il tuo account Discord per accedere alle funzionalità del forum.
            </p>
            <Button onClick={handleConnectDiscord} variant="outline">
              <svg
                className="mr-2 h-4 w-4 text-[#5865F2]"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="12" r="1" />
                <circle cx="15" cy="12" r="1" />
                <path d="M7.5 7.2C8.4 6.5 9.7 6 11 6c2.7 0 5.3 1.3 7 2" />
                <path d="M7 16.8c.9.7 2.2 1.2 3.5 1.2 2.7 0 5.3-1.3 7-2" />
                <path d="M18 9.2c.9 1.7 1.4 3.5 1.4 5.2 0 1.4-.3 2.7-.8 3.8" />
                <path d="M6 9.2C5.1 10.9 4.6 12.7 4.6 14.4c0 1.4.3 2.7.8 3.8" />
                <path d="M4.6 14.4c0 3.1 1.8 6.3 4.4 8.3A10 10 0 0 0 12 24c1.1 0 2.2-.1 3.1-.4" />
                <path d="M19.4 14.4c0 3.1-1.8 6.3-4.4 8.3A10 10 0 0 1 12 24c-1.1 0-2.2-.1-3.1-.4" />              </svg>
              Connetti Discord
            </Button>
          </div>
        )}
      </NeonCardContent>
    </NeonCard>
  )
}