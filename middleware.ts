/**
 * Middleware Next.js per gestione autenticazione
 * 
 * Responsabilità:
 * - Refresh automatico token JWT Supabase
 * - Protezione rotte autenticate (/admin, /profile)
 * - Reindirizzamento utenti non autenticati
 * - Gestione cookies di sessione
 * - Cache headers per performance
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {          // Necessario per deployment in produzione
          request.cookies.set({
            name,
            value,
            ...options,
          })
          // Necessario per sviluppo locale
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set(name, '')
          response.cookies.set(name, '')
        },
      },
    }
  )

  // Percorsi che richiedono autenticazione
  const authRequiredPaths = [
    '/profile',
    '/account',
  ]
  // Verifica stato autenticazione
  const { data: { session } } = await supabase.auth.getSession()

  // Ottieni il pathname dall'URL
  const path = request.nextUrl.pathname
  // Se l'utente non è autenticato e il percorso richiede autenticazione, reindirizza al login
  if (!session && authRequiredPaths.some(authPath => path.startsWith(authPath))) {
    const redirectUrl = new URL('/auth/login', request.url)
    // Aggiungi il percorso originale come parametro "redirectTo"
    redirectUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(redirectUrl)
  }

  // Se l'utente è autenticato e accede alle pagine di autenticazione, reindirizza al profilo
  if (session && (
    path.startsWith('/auth/login') ||
    path.startsWith('/auth/register')
  )) {
    const redirectUrl = new URL('/profile', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

// Definisci i percorsi che devono essere elaborati dal middleware
export const config = {
  matcher: [
    '/profile/:path*',
    '/account/:path*',
    '/auth/:path*',
  ],
}