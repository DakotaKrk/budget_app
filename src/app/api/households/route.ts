import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST /api/households — create a new household and set caller as owner
export async function POST(req: NextRequest) {
  // --- Auth: validate identity via Supabase Auth server (trusted network call) ---
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  console.log('[POST /api/households] getUser:', { userId: user?.id ?? null, authError: authError?.message ?? null })

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  // --- DB writes: use admin client (service role) to bypass RLS ---
  // The user has already been validated above. We bypass RLS here because
  // PostgREST's JWT verification is not matching the ES256 token algorithm
  // used by this Supabase project — auth.uid() comes back NULL for the anon
  // role. The admin client skips that check entirely; auth is enforced above.
  const admin = createAdminClient()

  const { data: household, error: hError } = await admin
    .from('households')
    .insert({ name: name.trim() })
    .select()
    .single()

  if (hError || !household) {
    console.error('[POST /api/households] households insert error:', hError)
    return NextResponse.json(
      { error: hError?.message ?? 'Failed to create household' },
      { status: 500 },
    )
  }

  const { error: mError } = await admin
    .from('household_members')
    .insert({ household_id: household.id, user_id: user.id, role: 'owner' })

  if (mError) {
    console.error('[POST /api/households] household_members insert error:', mError)
    return NextResponse.json({ error: mError.message }, { status: 500 })
  }

  console.log('[POST /api/households] created household', household.id, 'for user', user.id)
  return NextResponse.json(household, { status: 201 })
}

// GET /api/households — return current user's household (first one)
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('household_members')
    .select('household_id, role, households(id, name, invite_code, created_at)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (error) {
    return NextResponse.json(null)
  }

  return NextResponse.json(data)
}
