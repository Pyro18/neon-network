"use client"

import { useAuth } from "@/hooks/use-auth"
import { NeonCard, NeonCardContent, NeonCardHeader, NeonCardTitle } from "@/components/neon-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

/**
 * Component that displays Discord connection status and roles
 */
export function DiscordRolesDisplay() {
  const { user, signInWithOAuth } = useAuth()

  // Get Discord identity info
  const discordIdentity = user?.identities?.find(
    (identity) => identity.provider === "discord"
  )

  // Parse user's Discord roles (if available)
  const discordRoles = discordIdentity?.identity_data?.["https://discord.com/roles"] || []
  const discordUsername = discordIdentity?.identity_data?.full_name || discordIdentity?.identity_data?.preferred_username

  // Discord avatar URL
  const avatarUrl = discordIdentity?.identity_data?.avatar_url

  // Function to get role name from ID
  const getRoleName = (roleId: string) => {
    // Map of common Discord role IDs to human-readable names
    // In a real app, you would fetch this from your server or Discord API
    const roleMap: Record<string, { name: string, color: string }> = {
      [process.env.NEXT_PUBLIC_DISCORD_MANAGER_ROLE_ID || 'manager']: { 
        name: 'Manager',
        color: 'primary'
      },
      [process.env.NEXT_PUBLIC_DISCORD_MODERATOR_ROLE_ID || 'moderator']: { 
        name: 'Moderator',
        color: 'blue'
      },
      // Add more roles as needed
    }

    return roleMap[roleId] || { name: 'Member', color: 'muted' }
  }

  const handleConnectDiscord = async () => {
    try {
      await signInWithOAuth('discord')
    } catch (error) {
      console.error('Error connecting with Discord:', error)
    }
  }

  if (!user) {
    return (
      <NeonCard>
        <NeonCardHeader>
          <NeonCardTitle>Discord Connection</NeonCardTitle>
        </NeonCardHeader>
        <NeonCardContent>
          <p className="text-muted-foreground mb-4">
            Sign in to see your Discord connection status and permissions.
          </p>
          <Link href="/auth/login">
            <Button variant="outline">Sign In</Button>
          </Link>
        </NeonCardContent>
      </NeonCard>
    )
  }

  return (
    <NeonCard>
      <NeonCardHeader>
        <NeonCardTitle>Discord Connection</NeonCardTitle>
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
              )}
              <div>
                <div className="font-medium">{discordUsername}</div>
                <div className="text-sm text-muted-foreground">Connected via Discord</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Your Discord Roles:</h4>
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
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No roles found</p>
                )}
              </div>
            </div>

            <div className="mt-4 text-sm">
              <p className="text-muted-foreground">
                {discordRoles.includes(process.env.NEXT_PUBLIC_DISCORD_MANAGER_ROLE_ID || 'manager') || 
                 discordRoles.includes(process.env.NEXT_PUBLIC_DISCORD_MODERATOR_ROLE_ID || 'moderator') 
                  ? "You have permission to create new threads and posts in the forum."
                  : "You need a Manager or Moderator role to create new threads in the forum."}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Connect your Discord account to access forum features.
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
                <path d="M19.4 14.4c0 3.1-1.8 6.3-4.4 8.3A10 10 0 0 1 12 24c-1.1 0-2.2-.1-3.1-.4" />
              </svg>
              Connect Discord
            </Button>
          </div>
        )}
      </NeonCardContent>
    </NeonCard>
  )
}