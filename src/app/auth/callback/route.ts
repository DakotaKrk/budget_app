import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * PKCE auth callback — exchanges Supabase's one-time code for a session.
 *
 * @supabase/ssr forces flowType:"pkce" on every client. After email
 * confirmation (or magic-link sign-in) Supabase redirects the browser here
 * with ?code=<pkce_code>. We MUST exchange that code for a real session and
 * write the resulting cookies before redirecting.
 *
 * WHY NOT use createClient() from @/lib/supabase/server?
 * That helper has a try/catch around setAll() so it never throws in Server
 * Components (which cannot write cookies). If setAll() were silenced here the
 * session would never be persisted and every subsequent server call would see
 * an anonymous user. This route creates its own client with a setAll() that
 * always writes the cookies.
 *
 * Supabase dashboard: add the following to Redirect URLs
 *   http://localhost:3000/auth/callback       (development)
 *   https://<your-domain>/auth/callback       (production)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  console.log('[GET /auth/callback] code present:', !!code, '| next:', next)

  if (!code) {
    console.error('[GET /auth/callback] No PKCE code in URL')
    return NextResponse.redirect(new URL('/login?error=missing_code', origin))
  }

  const cookieStore = await cookies()

  // Build a dedicated server client whose setAll() is NOT wrapped in try/catch.
  // This is the only place in the app where a successful cookie write is
  // critical to the auth flow.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // Route Handlers can always write cookies — no try/catch here.
          cookiesToSet.forEach(({ name, value, options }) => {
            console.log('[GET /auth/callback] setting cookie:', name)
            cookieStore.set(name, value, options)
          })
        },
      },
    },
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[GET /auth/callback] exchangeCodeForSession error:', error.message)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, origin),
    )
  }

  console.log('[GET /auth/callback] session established for user:', data.user?.id)

  // Redirect to the intended destination (defaults to dashboard root).
  // The dashboard layout will redirect to /onboarding if no household yet.
  return NextResponse.redirect(new URL(next, origin))
}
