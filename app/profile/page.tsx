"use client"

/**
 * Pagina profilo utente
 * 
 * Funzionalità:
 * - Visualizzazione dati profilo autenticato
 * - Gestione impostazioni account
 * - Visualizzazione ruoli Discord (se collegato)
 * - Statistiche giocatore nel server
 * - Cronologia attività forum
 * - Protezione da accesso non autorizzato
 */

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserProfile } from "@/components/auth/user-profile"
import { DiscordRolesDisplay } from "@/components/auth/discord-roles-display"
import { NeonParticles } from "@/components/neon-particles"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { DiscordLogoIcon } from "@radix-ui/react-icons"
import Link from "next/link"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  // Reindirizza alla pagina di login se non autenticato
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  // Mostra stato di caricamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Caricamento profilo...</h2>
          <div className="w-16 h-16 border-t-4 border-primary rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="relative">
      <NeonParticles density={30} zIndex={-1} />

      <div className="container mx-auto px-4 py-12 max-w-4xl z-10 relative">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <UserProfile />
          </div>

          <div className="md:col-span-4 space-y-6">
            {/* Discord Roles Display */}
            <DiscordRolesDisplay />

            <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-6">
              <h2 className="text-xl font-semibold mb-4">Account Actions</h2>

              <div className="space-y-3">
                <Link href="/auth/change-password">
                  <Button variant="outline" className="w-full justify-start">
                    Change Password
                  </Button>
                </Link>

                <Button variant="outline" className="w-full justify-start">
                  Manage Email Preferences
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-500/10"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}