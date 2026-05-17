import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function getAuthedHousehold() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { user: null, admin: null, householdId: null }
  const admin = createAdminClient()
  const { data: m } = await admin
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()
  return { user, admin, householdId: m?.household_id ?? null }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { user, admin, householdId } = await getAuthedHousehold()
  if (!user || !admin || !householdId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await admin
    .from('loans')
    .delete()
    .eq('id', id)
    .eq('household_id', householdId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
