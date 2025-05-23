"use client"

import { useState, useEffect, createContext, useContext } from 'react'
import {
  User,
  Session,
  AuthError,
} from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

type Provider = 'discord' | 'apple' | 'azure' | 'bitbucket' | 'facebook' | 'github' | 'gitlab' | 'google' | 'keycloak' | 'linkedin' | 'notion' | 'spotify' | 'slack' | 'twitch' | 'twitter' | 'workos' | 'zoom'

type UserProfile = {
  id: string
  username: string
  avatar_url?: string
  role: 'member' | 'moderator' | 'admin'
  discord_id?: string
  post_count: number
  reputation: number
  bio?: string
  location?: string
  website?: string
  joined_at: string
  is_banned: boolean
  ban_reason?: string
}

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, userData: any) => Promise<{ error: AuthError | null; user: User | null }>
  signInWithOAuth: (provider: Provider) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  hasRole: (requiredRole: 'member' | 'moderator' | 'admin') => boolean
  isAdmin: boolean
  isModerator: boolean
  canModerate: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data as UserProfile
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchUserProfile(user.id)
      setProfile(userProfile)
    }
  }

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true)

      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id)
          setProfile(userProfile)
        }
      } catch (error) {
        console.error('Error retrieving session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event)
          setSession(session)
          setUser(session?.user ?? null)

          if (session?.user) {
            const userProfile = await fetchUserProfile(session.user.id)
            setProfile(userProfile)
          } else {
            setProfile(null)
          }

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
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          skipBrowserRedirect: false,
          redirectTo: `${window.location.origin}/auth/callback`,
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
    setProfile(null)
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { error }
  }

  // Role-based authorization helpers
  const hasRole = (requiredRole: 'member' | 'moderator' | 'admin'): boolean => {
    if (!profile || profile.is_banned) return false

    const roleHierarchy = { member: 0, moderator: 1, admin: 2 }
    const userRoleLevel = roleHierarchy[profile.role] ?? -1
    const requiredRoleLevel = roleHierarchy[requiredRole] ?? 0

    return userRoleLevel >= requiredRoleLevel
  }

  const isAdmin = profile?.role === 'admin' && !profile?.is_banned
  const isModerator = (profile?.role === 'moderator' || profile?.role === 'admin') && !profile?.is_banned
  const canModerate = isModerator || isAdmin

  const value = {
    session,
    user,
    profile,
    isLoading,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
    resetPassword,
    hasRole,
    isAdmin,
    isModerator,
    canModerate,
    refreshProfile
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