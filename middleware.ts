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
        set(name: string, value: string, options: CookieOptions) {
          // This is needed for production deployments
          request.cookies.set({
            name,
            value,
            ...options,
          })
          // This is needed for local development
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

  // Paths that require authentication
  const authRequiredPaths = [
    '/profile',
    '/account',
  ]

  // Check auth status
  const { data: { session } } = await supabase.auth.getSession()

  // Get the pathname from the URL
  const path = request.nextUrl.pathname

  // If user is not signed in and the path requires authentication, redirect to login
  if (!session && authRequiredPaths.some(authPath => path.startsWith(authPath))) {
    const redirectUrl = new URL('/auth/login', request.url)
    // Add the original path as a "redirectTo" parameter
    redirectUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is signed in and accessing auth pages, redirect to profile
  if (session && (
    path.startsWith('/auth/login') ||
    path.startsWith('/auth/register')
  )) {
    const redirectUrl = new URL('/profile', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

// Define paths that should be processed by the middleware
export const config = {
  matcher: [
    '/profile/:path*',
    '/account/:path*',
    '/auth/:path*',
  ],
}