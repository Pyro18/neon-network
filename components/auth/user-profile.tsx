"use client"

import { useAuth } from "@/hooks/use-auth"
import { NeonCard } from "@/components/neon-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function UserProfile() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  if (!user) {
    return null
  }

  // Function to handle sign out
  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Signed out successfully")
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to sign out")
    }
  }

  // Extract user metadata
  const username = user.user_metadata?.username || "User"

  const avatarUrl = user.identities?.find((i) => i.provider === "discord")?.identity_data?.avatar_url || null

  return (
    <NeonCard className="p-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-12 w-12 border border-border">
          <AvatarImage src={avatarUrl || undefined} alt={username} />
          <AvatarFallback>
            <User className="h-6 w-6 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-medium truncate">{username}</h2>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleSignOut}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Sign out</span>
        </Button>
      </div>

      <div className="mt-6 grid gap-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Account Type</span>
          <span className="font-medium">
            {user.app_metadata?.provider === "discord" && "Discord"}
            {user.app_metadata?.provider === "azure" && "Microsoft"}
            {user.app_metadata?.provider === "email" && "Email"}
          </span>
        </div>

        {user.identities?.find((i) => i.provider === "discord") && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Discord Username</span>
            <span className="font-medium">
              {user.identities.find((i) => i.provider === "discord")?.identity_data?.full_name || "Not available"}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Email Verified</span>
          <span className={`font-medium ${user.email_confirmed_at ? "text-green-500" : "text-amber-500"}`}>
            {user.email_confirmed_at ? "Yes" : "No"}
          </span>
        </div>
      </div>
    </NeonCard>
  )
}
