"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface SocialLoginButtonsProps {
  isLoading?: boolean
}

export function SocialLoginButtons({ isLoading = false }: SocialLoginButtonsProps) {
  const { signInWithOAuth } = useAuth()

  const handleDiscordLogin = async () => {
    try {
      await signInWithOAuth("discord")
    } catch (error) {
      console.error("Error during Discord login:", error)
      toast.error("Failed to connect with Discord")
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <Button
        variant="outline"
        className="bg-background/50 border-[#5865F2]/50 hover:bg-[#5865F2]/10 hover:text-[#5865F2] hover:border-[#5865F2]/80 transition-all"
        disabled={isLoading}
        onClick={handleDiscordLogin}
      >
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
        Discord
      </Button>
    </div>
  )
}