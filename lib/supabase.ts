import { createBrowserClient } from '@supabase/ssr'

/**
 * Client Supabase per il browser
 * 
 * Crea un'istanza del client Supabase configurata per l'utilizzo lato client
 * con autenticazione automatica, persistenza delle sessioni e flow PKCE
 * per maggiore sicurezza negli OAuth flows
 * 
 * @returns Istanza client Supabase per browser
 */
export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  )
}