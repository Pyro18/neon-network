"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check if we have an error or error_description in the URL
      const errorParam = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')
      
      if (errorParam) {
        console.error('Error during authentication:', errorParam, errorDescription)
        setError(`${errorParam}: ${errorDescription}`)
        return
      }

      try {
        // Exchange the auth code for a session
        const { data, error } = await supabase.auth.getSession()
        
        console.log("Auth callback session:", data)
        
        if (error) {
          console.error('Error during getSession:', error)
          setError(error.message)
          router.push('/auth/login?error=auth-error')
          return
        }
        
        if (!data.session) {
          console.log("No session found, redirecting to login")
          router.push('/auth/login')
          return
        }
        
        console.log("Authentication successful, redirecting to profile")
        // Redirect to profile page on success
        router.push('/profile')
      } catch (err) {
        console.error('Unexpected error during auth callback:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        router.push('/auth/login?error=unexpected')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-background/20 backdrop-blur-sm rounded-lg border border-destructive/50 max-w-md">
          <h2 className="text-xl font-bold mb-4 text-destructive">Authentication Error</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-primary/20 rounded-md border border-primary/50 text-primary"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-t-4 border-primary rounded-full animate-spin mx-auto"></div>
        <p className="mt-4">Completing authentication...</p>
      </div>
    </div>
  )
}