import 'server-only'
import { createClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase admin client (service role key).
 *
 * The `import 'server-only'` at the top causes a BUILD ERROR if this file
 * is ever imported from a client component or any NEXT_PUBLIC code path.
 * That is intentional — the service role key must never reach the browser.
 *
 * Rules:
 *  - ONLY call this inside Route Handlers (route.ts) or Server Actions
 *  - ALWAYS validate the user with supabase.auth.getUser() FIRST
 *  - NEVER pass the returned client to a client component
 *  - The env var must NOT have the NEXT_PUBLIC_ prefix
 *
 * Setup: add to .env.local (never commit this file):
 *   SUPABASE_SERVICE_ROLE_KEY=<secret from Supabase Dashboard → Settings → API>
 */
export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Get it from Supabase Dashboard → Project Settings → API → service_role (secret).\n' +
      'Add it to .env.local as SUPABASE_SERVICE_ROLE_KEY=<value>',
    )
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        // No session management — this client is for one-shot server calls only
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  )
}
