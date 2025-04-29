import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  // Ensure environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables!')
  }

  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          debug: true,
          flowType: 'implicit'
        },
        global: {
          headers: {
            'X-Client-Info': 'neon-network@0.1.0'
          }
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      }
    )

    console.log('Supabase client created successfully')
    return supabase
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    throw error
  }
}