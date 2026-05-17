import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const message = body.message?.trim()

  if (!message || message.length < 1 || message.length > 1000) {
    return NextResponse.json({ error: 'Meddelandet måste vara 1–1000 tecken' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('feedback')
    .insert({ user_id: user.id, message })

  if (error) {
    console.error('[POST /api/feedback]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
