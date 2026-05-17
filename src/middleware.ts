import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const AUTH_PAGES = ['/login', '/signup', '/welcome']
// /auth/callback must be public: the browser arrives here unauthenticated
// carrying only a one-time PKCE code — the route exchanges it for a session.
// /forgot-password and /reset-password are public so unauthenticated users
// arriving from a reset email can reach them without being redirected to /login.
// /welcome is the landing page — public for everyone, logged-in users are redirected away.
const PUBLIC_PAGES = ['/login', '/signup', '/auth/callback', '/forgot-password', '/reset-password', '/welcome']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error: getUserError } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthPage = AUTH_PAGES.includes(pathname)
  const isPublicPage = PUBLIC_PAGES.includes(pathname)
  const isApiRoute = pathname.startsWith('/api/')

  // Log every request so we can see what the middleware observes.
  // Remove or reduce this once auth is stable.
  console.log(`[middleware] ${request.method} ${pathname}`, {
    userId: user?.id ?? null,
    getUserError: getUserError?.message ?? null,
    cookieNames: request.cookies.getAll().map(c => c.name),
  })

  // Logged-in users visiting login/signup → redirect to dashboard
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Unauthenticated users on protected routes
  if (!user && !isPublicPage) {
    // API routes must return JSON — a redirect sends back HTML which breaks fetch()
    if (isApiRoute) {
      console.warn(`[middleware] Unauthenticated API call to ${pathname} — returning 401`)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.warn(`[middleware] Unauthenticated page access to ${pathname} — redirecting to /welcome`)
    return NextResponse.redirect(new URL('/welcome', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
