"use client"

import { useState, useEffect, createContext, useContext } from 'react'
import { 
  User, 
  Session,
  AuthError, 
} from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

// Definire il tipo per i provider OAuth supportati da Supabase
type Provider = 'apple' | 'azure' | 'bitbucket' | 'discord' | 'facebook' | 'github' | 'gitlab' | 'google' | 'keycloak' | 'linkedin' | 'notion' | 'spotify' | 'slack' | 'twitch' | 'twitter' | 'workos' | 'zoom'

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, userData: any) => Promise<{ error: AuthError | null; user: User | null }>
  signInWithOAuth: (provider: Provider) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      setIsLoading(true)
      
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error retrieving session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('Starting signUp process with data:', { email, userData })
      
      // Try alternative approach - first sign up without metadata
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (signUpError) {
        console.error('Supabase signUp error:', signUpError)
        console.error('Error details:', {
          message: signUpError.message,
          status: signUpError.status,
          name: signUpError.name
        })
        return { error: signUpError, user: null }
      }
      
      // If we successfully created the user, update metadata separately
      if (data?.user && Object.keys(userData).length > 0) {
        try {
          const { error: updateError } = await supabase.auth.updateUser({
            data: userData
          })
          
          if (updateError) {
            console.error('Error updating user metadata:', updateError)
          }
        } catch (updateError) {
          console.error('Unexpected error updating user metadata:', updateError)
        }
      }
      
      console.log('SignUp successful, user data:', data?.user)
      return { error: null, user: data?.user ?? null }
    } catch (e) {
      console.error('Unexpected error during signUp:', e)
      const error = e as AuthError
      return { error, user: null }
    }
  }

  const signInWithOAuth = async (provider: Provider) => {
    try {
      // Per Discord, utilizza l'URL di callback corretto come specificato nella documentazione
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          // Utilizza questo URL per il reindirizzamento post-auth
          redirectTo: `${window.location.origin}/auth/callback`,
          // Per Discord, aggiungi questi parametri di query per assicurare che il token funzioni
          ...(provider === 'discord' && {
            scopes: 'identify email',
            skipBrowserRedirect: false,
          })
        },
      });
      
      if (error) {
        console.error(`Error in signInWithOAuth for ${provider}:`, error);
      }
    } catch (error) {
      console.error(`Unexpected error in signInWithOAuth:`, error);
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { error }
  }

  const value = {
    session,
    user,
    isLoading,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}