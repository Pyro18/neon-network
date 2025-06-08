/**
 * Client Supabase per middleware Next.js
 * 
 * Gestisce l'autenticazione nelle richieste middleware:
 * - Refresh automatico dei token JWT
 * - Gestione cookies di sessione
 * - Protezione rotte autenticate
 * - Reindirizzamenti basati su stato auth
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Crea un client Supabase configurato per il middleware
 * @param req - Richiesta Next.js
 * @param res - Risposta Next.js  
 * @returns Client Supabase con gestione cookies
 */
export function createMiddlewareClient(req: NextRequest, res: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set(name, '')
          res.cookies.set(name, '')
        },
      },
    }
  )
}