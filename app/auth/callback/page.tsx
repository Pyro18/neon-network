"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Extract the hash and query parameters from the URL
    const handleAuthCallback = async () => {
      // Get the code and error parameter from the URL
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      const error_description = searchParams.get('error_description')

      if (error) {
        console.error('Error during OAuth callback:', error_description)
        toast.error(error_description || 'Authentication failed')
        router.push('/auth/login')
        return
      }

      if (!code) {
        // If there's no code, check if we have a session already
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          toast.error('Authentication failed. No code provided.')
          router.push('/auth/login')
          return
        }
      }

      // If we have a code or a valid session, redirect to home
      toast.success('Authentication successful')
      router.push('/')
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Completing authentication...</h2>
        <div className="w-16 h-16 border-t-4 border-primary rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  )
}