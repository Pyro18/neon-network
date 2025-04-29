"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserProfile } from "@/components/auth/user-profile"
import { NeonParticles } from "@/components/neon-particles"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect to login page if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading profile...</h2>
          <div className="w-16 h-16 border-t-4 border-primary rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  // If redirecting (user is null), don't render anything
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
            <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-6">
              <h2 className="text-xl font-semibold mb-4">Account Links</h2>

              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
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
                  {user.identities?.find(i => i.provider === 'discord') 
                    ? 'Discord Connected' 
                    : 'Connect Discord Account'}
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <svg
                    className="mr-2 h-4 w-4 text-[#107C10]"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                  </svg>
                  {user.identities?.find(i => i.provider === 'azure') 
                    ? 'Microsoft Connected' 
                    : 'Connect Microsoft Account'}
                </Button>
              </div>
            </div>

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