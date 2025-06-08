"use client"

import Link from "next/link"
import { useState } from "react"
import { NeonParticles } from "@/components/neon-particles"
import { NeonCard } from "@/components/neon-card"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false)

  const handleResendEmail = async () => {
    // This would typically call a function to resend the verification email
    // For this demo, we'll just simulate it
    setIsResending(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsResending(false)
    }, 2000)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      {/* Impostiamo z-index a -1 per il background */}
      <NeonParticles density={30} zIndex={-1} />

      <div className="w-full max-w-md z-10">
        <NeonCard className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <Mail className="h-10 w-10" />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2">Check your email</h1>
          
          <p className="text-muted-foreground mb-6">
            We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
          </p>
          
          <div className="flex flex-col gap-4">
            <Button onClick={handleResendEmail} disabled={isResending} variant="outline">
              {isResending ? "Sending..." : "Resend verification email"}
            </Button>
            
            <Link href="/auth/login">
              <Button className="w-full" variant="ghost">
                Back to login
              </Button>
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-muted-foreground">
            If you don't see the email, check your spam folder.
          </p>
        </NeonCard>
      </div>
    </div>
  )
}