"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Completing authentication...')
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    let authSubscription: any = null
    let timeoutId: NodeJS.Timeout | null = null

    const handleAuthCallback = async () => {
      try {
        const error_param = searchParams.get('error')
        const error_description = searchParams.get('error_description')

        // Handle OAuth errors
        if (error_param) {
          console.error('OAuth Error:', error_param, error_description)
          setError(`Authentication failed: ${error_param}`)
          timeoutId = setTimeout(() => router.push('/auth/login'), 3000)
          return
        }

        // Set up auth state listener
        authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            try {
              setStatus('Creating user profile...')

              // Create or update user profile
              await createUserProfile(session.user)

              setStatus('Authentication successful!')

              // Clean up subscription
              if (authSubscription) {
                authSubscription.data.subscription.unsubscribe()
              }

              // Redirect based on email confirmation status
              if (!session.user.email_confirmed_at) {
                router.push('/auth/verify-email')
              } else {
                timeoutId = setTimeout(() => router.push('/'), 1500)
              }

            } catch (profileError) {
              console.warn('Profile creation failed, but auth succeeded:', profileError)
              // Don't fail the auth process for profile errors
              timeoutId = setTimeout(() => router.push('/'), 1500)
            }
            return
          }

          if (event === 'SIGNED_OUT') {
            setError('Authentication failed')
            if (authSubscription) authSubscription.data.subscription.unsubscribe()
            timeoutId = setTimeout(() => router.push('/auth/login'), 2000)
          }
        })

        // Set fallback timeout
        timeoutId = setTimeout(async () => {
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            setStatus('Authentication successful!')
            await createUserProfile(session.user)
            router.push('/')
          } else {
            setError('Authentication timeout')
            router.push('/auth/login')
          }
        }, 15000)

      } catch (err) {
        console.error('Auth callback error:', err)
        setError('Authentication failed')
        timeoutId = setTimeout(() => router.push('/auth/login'), 3000)
      }
    }

    const createUserProfile = async (user: any) => {
      try {
        // Extract user info from various OAuth providers
        const username = user.user_metadata?.username ||
            user.user_metadata?.preferred_username ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'user'

        const avatar_url = user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            null

        // Get Discord roles if available
        const discordRoles = user.user_metadata?.['https://discord.com/roles'] || []

        // Determine user role based on Discord roles
        let role = 'member'
        if (discordRoles.includes(process.env.NEXT_PUBLIC_DISCORD_MANAGER_ROLE_ID)) {
          role = 'admin'
        } else if (discordRoles.includes(process.env.NEXT_PUBLIC_DISCORD_MODERATOR_ROLE_ID)) {
          role = 'moderator'
        }

        const { error } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              username: username,
              avatar_url: avatar_url,
              role: role,
              discord_id: user.user_metadata?.provider_id || null,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id',
              ignoreDuplicates: false
            })

        if (error) {
          throw error
        }

        console.log('User profile created/updated successfully')
      } catch (error) {
        console.error('Profile creation error:', error)
        throw error
      }
    }

    handleAuthCallback()

    return () => {
      if (authSubscription) {
        authSubscription.data.subscription.unsubscribe()
      }
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [router, searchParams, supabase])

  if (error) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-6 bg-background/20 backdrop-blur-sm rounded-lg border border-destructive/50 max-w-md">
            <h2 className="text-xl font-bold mb-4 text-destructive">Authentication Error</h2>
            <p className="mb-4 text-sm">{error}</p>
            <p className="text-xs text-muted-foreground mb-4">Redirecting to login page...</p>
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
          <div className="w-16 h-16 border-t-4 border-primary rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Completing Authentication</h2>
          <p className="text-muted-foreground">{status}</p>
        </div>
      </div>
  )
}