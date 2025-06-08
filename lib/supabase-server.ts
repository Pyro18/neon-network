import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Client Supabase per il server
 * 
 * Crea un'istanza del client Supabase configurata per l'utilizzo lato server
 * con gestione automatica dei cookie per mantenere le sessioni utente
 * attraverso le richieste server-side
 * 
 * @returns Promise che risolve in un'istanza client Supabase per server
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 })
        }
      }
    }
  )
}