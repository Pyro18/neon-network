"use client"

import { useState, useEffect, createContext, useContext } from 'react'
import { 
  User, 
  Session,
  AuthError, 
} from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

// Define the type for OAuth providers supported by Supabase
type Provider = 'apple' | 'azure' | 'bitbucket' | 'discord' | 'facebook' | 'github' | 'gitlab' | 'google' | 'keycloak' | 'linkedin' | 'notion' | 'spotify' | 'slack' | 'twitch' | 'twitter' | 'workos' | 'zoom'

// Define the type for Discord roles check
type RoleCheckResult = {
  hasRole: boolean
  roles: string[]
}

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, userData: any) => Promise<{ error: AuthError | null; user: User | null }>
  signInWithOAuth: (provider: Provider) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  hasRole: (roleId: string | string[]) => RoleCheckResult
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: userData
        }
      })
      
      if (error) return { error, user: null }
      return { error: null, user: data?.user ?? null }
    } catch (e) {
      console.error('Unexpected error during signUp:', e)
      return { error: e as AuthError, user: null }
    }
  }
  
  const signInWithOAuth = async (provider: Provider) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          skipBrowserRedirect: false,
          redirectTo: `${window.location.origin}/auth/callback`,
          // Request additional scopes for Discord to get user roles
          scopes: provider === 'discord' ? 'identify email guilds.members.read' : undefined
        },
      });
      
      if (error) {
        console.error(`Error in signInWithOAuth for ${provider}:`, error);
        throw error;
      }
    } catch (error) {
      console.error(`Unexpected error in signInWithOAuth:`, error);
      throw error;
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

  /**
   * Check if user has a specific Discord role or any of the roles in the array
   */
  const hasRole = (roleIdOrIds: string | string[]): RoleCheckResult => {
    if (!user) {
      return { hasRole: false, roles: [] }
    }
    
    // Get the user's Discord roles from the identity data
    const discordIdentity = user.identities?.find(
      (identity) => identity.provider === "discord"
    )
    
    const userRoles = discordIdentity?.identity_data?.["https://discord.com/roles"] || []
    
    // If checking for a single role
    if (typeof roleIdOrIds === 'string') {
      return { 
        hasRole: userRoles.includes(roleIdOrIds),
        roles: userRoles
      }
    }
    
    // If checking for any of multiple roles
    return { 
      hasRole: roleIdOrIds.some(roleId => userRoles.includes(roleId)),
      roles: userRoles
    }
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
    hasRole
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