import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/households/join — join a household via invite code
export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { inviteCode } = await req.json()
  if (!inviteCode?.trim()) {
    return NextResponse.json({ error: 'Invite code is required' }, { status: 400 })
  }

  // Use the security-definer function to bypass RLS on households
  const { data, error } = await supabase
    .rpc('join_household_by_invite', { p_invite_code: inviteCode.trim() })

  if (error) {
    const message = error.message.includes('not found')
      ? 'Ogiltig inbjudningskod'
      : error.message
    return NextResponse.json({ error: message }, { status: 400 })
  }

  return NextResponse.json({ household_id: data }, { status: 200 })
}
