"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase rileverà automaticamente il codice dall'URL con detectSessionInUrl
        const { error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Errore durante l\'autenticazione:', error)
          router.push('/auth/login?error=auth-error')
          return
        }
        
        // Reindirizza alla home o al profilo dopo il login
        router.push('/profile')
      } catch (err) {
        console.error('Errore imprevisto:', err)
        router.push('/auth/login?error=unexpected')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-t-4 border-primary rounded-full animate-spin mx-auto"></div>
        <p className="mt-4">Completamento dell'accesso...</p>
      </div>
    </div>
  )
}