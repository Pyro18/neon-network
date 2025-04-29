"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { NeonParticles } from '@/components/neon-particles'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the code from the URL
        const code = searchParams.get('code')
        
        console.log('Processing auth callback:', {
          url: window.location.href,
          code: code ? 'present' : 'missing',
          params: Object.fromEntries([...searchParams.entries()])
        })
        
        if (!code) {
          setError('Codice di autenticazione mancante')
          setProcessing(false)
          return
        }
        
        // Exchange the code for a session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (exchangeError) {
          console.error('Errore durante lo scambio del codice:', exchangeError)
          setError(`Errore di autenticazione: ${exchangeError.message}`)
          setProcessing(false)
          return
        }
        
        // Get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          console.error('Errore nel recupero della sessione:', sessionError)
          setError('Impossibile recuperare la sessione utente')
          setProcessing(false)
          return
        }

        // Successfully authenticated
        toast.success('Autenticazione completata con successo')
        router.push('/profile')
      } catch (err) {
        console.error('Errore imprevisto durante l\'autenticazione:', err)
        setError('Si è verificato un errore durante l\'autenticazione')
        setProcessing(false)
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  if (error) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <NeonParticles density={30} zIndex={-1} />
        <div className="w-full max-w-md z-10">
          <div className="text-center bg-red-500/10 border border-red-500/30 rounded-lg p-6">
            <svg 
              className="w-16 h-16 text-red-500 mx-auto mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold text-red-500 mb-2">Errore di autenticazione</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={() => router.push('/auth/login')}
              className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 px-4 py-2 rounded"
            >
              Torna al login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <NeonParticles density={30} zIndex={-1} />
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Completamento autenticazione...</h2>
        <div className="w-16 h-16 border-t-4 border-primary rounded-full animate-spin mx-auto"></div>
        <p className="text-muted-foreground mt-4">Ti stiamo reindirizzando alla pagina del tuo profilo...</p>
      </div>
    </div>
  )
}