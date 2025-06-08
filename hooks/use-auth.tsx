"use client"

/**
 * Hook di autenticazione per NeonNetwork
 * 
 * Questo hook gestisce:
 * - Stato globale dell'autenticazione utente
 * - Login/logout con email/password e OAuth providers
 * - Gestione dei profili utente e ruoli
 * - Autorizzazioni basate sui ruoli (member, moderator, admin)
 * - Sincronizzazione con Supabase Auth e database profiles
 */

import { useState, useEffect, createContext, useContext } from 'react'
import {
  User,
  Session,
  AuthError,
} from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

// Tipi per i provider OAuth supportati dal sistema
type Provider = 'discord' | 'apple' | 'azure' | 'bitbucket' | 'facebook' | 'github' | 'gitlab' | 'google' | 'keycloak' | 'linkedin' | 'notion' | 'spotify' | 'slack' | 'twitch' | 'twitter' | 'workos' | 'zoom'

// Profilo utente esteso con tutte le informazioni memorizzate nel database
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
  updated_at: string
  last_seen_at: string
  is_banned: boolean
  ban_reason?: string
  ban_expires_at?: string
}

// Interfaccia del contesto di autenticazione con tutti i metodi e proprietà disponibili
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
  hasRole: (requiredRole: 'member' | 'moderator' | 'admin' | string | string[]) => { hasRole: boolean }
  isAdmin: boolean
  isModerator: boolean
  canModerate: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Provider di autenticazione principale
 * 
 * Gestisce lo stato globale dell'autenticazione e fornisce metodi per:
 * - Autenticazione con email/password e OAuth
 * - Gestione sessioni e profili utente
 * - Controllo autorizzazioni e ruoli
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  /**
   * Crea un nuovo profilo utente nel database
   * Estrae informazioni da OAuth providers e imposta valori predefiniti
   */
  const createUserProfile = async (user: User): Promise<UserProfile | null> => {
    try {      console.log('Creazione profilo per utente:', user.id)
      console.log('Metadati utente:', user.user_metadata)

      // Estrai informazioni utente da vari provider OAuth
      const username = user.user_metadata?.username ||
          user.user_metadata?.preferred_username ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          `user_${user.id.slice(0, 8)}`

      const avatar_url = user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          null

      // Determina il ruolo utente (predefinito a 'member')
      let role: 'member' | 'moderator' | 'admin' = 'member'

      const profileData = {
        id: user.id,
        username: username,
        avatar_url: avatar_url,
        role: role,
        discord_id: user.user_metadata?.provider_id || null,
        post_count: 0,
        reputation: 0,
        is_banned: false,
        joined_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString()
      }

      console.log('Dati profilo da inserire:', profileData)

      const { data, error } = await supabase
          .from('profiles')
          .upsert(profileData, {
            onConflict: 'id',
            ignoreDuplicates: false
          })
          .select('*')
          .single()

      if (error) {        console.error('Errore Supabase nella creazione profilo:', error)
        console.error('Dettagli errore:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw error
      }      console.log('Profilo utente creato/aggiornato con successo:', data)
      return data as UserProfile
    } catch (error) {
      console.error('Errore nella creazione profilo:', error)
      console.error('Tipo errore:', typeof error)
      console.error('Costruttore errore:', error?.constructor?.name)
      return null
    }
  }

  const fetchUserProfile = async (userId: string, userObject?: User): Promise<UserProfile | null> => {    try {
      console.log('Recupero profilo per utente:', userId)

      const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

      if (error) {
        console.log('Errore recupero profilo:', error)

        // Se il profilo non esiste, crealo
        if (error.code === 'PGRST116') {
          console.log('Profilo non trovato, creazione nuovo profilo...')

          // Usa l'oggetto user passato come parametro o quello dallo state
          const userToUse = userObject || user

          if (userToUse) {
            console.log('Creazione profilo con oggetto utente:', userToUse.id)
            const newProfile = await createUserProfile(userToUse)
            return newProfile
          } else {
            console.error('Impossibile creare profilo: oggetto utente non disponibile')
            return null
          }
        }

        console.error('Errore nel recupero profilo:', error)
        return null
      }      console.log('Profilo recuperato con successo:', data)
      return data as UserProfile
    } catch (error) {
      console.error('Errore imprevisto nel recupero profilo:', error)
      return null
    }
  }

  const refreshProfile = async () => {    if (user) {
      console.log('Aggiornamento profilo per utente:', user.id)
      const userProfile = await fetchUserProfile(user.id, user)
      setProfile(userProfile)
    }
  }

  useEffect(() => {    const getSession = async () => {
      setIsLoading(true)

      try {
        console.log('Ottenimento sessione iniziale...')
        const { data: { session } } = await supabase.auth.getSession()

        console.log('Sessione iniziale:', session ? 'Trovata' : 'Non trovata')
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          console.log('Recupero profilo per utente autenticato:', session.user.id)
          const userProfile = await fetchUserProfile(session.user.id, session.user)
          setProfile(userProfile)
        }
      } catch (error) {
        console.error('Errore nel recupero sessione:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Stato autenticazione cambiato:', event, session ? 'con sessione' : 'senza sessione')
          setSession(session)
          setUser(session?.user ?? null)

          if (session?.user) {            console.log('Cambio stato autenticazione: recupero profilo per utente:', session.user.id)

            // Aggiorna last_seen_at
            try {
              await supabase
                  .from('profiles')
                  .update({ last_seen_at: new Date().toISOString() })
                  .eq('id', session.user.id)
            } catch (error) {
              console.warn('Impossibile aggiornare last_seen_at:', error)
            }

            const userProfile = await fetchUserProfile(session.user.id, session.user)
            setProfile(userProfile)
          } else {
            console.log('Cambio stato autenticazione: pulizia profilo')
            setProfile(null)
          }

          setIsLoading(false)
        }
    )

    return () => {
      subscription.unsubscribe()
    }    }, []) // Rimuovo la dipendenza user per evitare loop

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
      console.error('Errore imprevisto durante signUp:', e)
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

      if (error) {        console.error(`Errore in signInWithOAuth per ${provider}:`, error);
        throw error;
      }
    } catch (error) {
      console.error(`Errore imprevisto in signInWithOAuth:`, error);
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

  // Helper per autorizzazioni basate sui ruoli
  const hasRole = (requiredRole: 'member' | 'moderator' | 'admin' | string | string[]): { hasRole: boolean } => {
    if (!profile || profile.is_banned) return { hasRole: false }    // Gestisce ruolo singolo stringa
    if (typeof requiredRole === 'string') {
      const roleHierarchy = { member: 0, moderator: 1, admin: 2 }
      const userRoleLevel = roleHierarchy[profile.role as keyof typeof roleHierarchy] ?? -1
      const requiredRoleLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] ?? 0

      return { hasRole: userRoleLevel >= requiredRoleLevel }
    }    // Gestisce array di ruoli
    if (Array.isArray(requiredRole)) {
      const hasAnyRole = requiredRole.some(role => {
        const roleHierarchy = { member: 0, moderator: 1, admin: 2 }
        const userRoleLevel = roleHierarchy[profile.role as keyof typeof roleHierarchy] ?? -1
        const requiredRoleLevel = roleHierarchy[role as keyof typeof roleHierarchy] ?? 0
        return userRoleLevel >= requiredRoleLevel
      })
      return { hasRole: hasAnyRole }
    }

    return { hasRole: false }
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
    throw new Error('useAuth deve essere usato all\'interno di un AuthProvider')
  }
  return context
}