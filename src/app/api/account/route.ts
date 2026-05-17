import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Find the user's household membership
  const { data: membership } = await admin
    .from('household_members')
    .select('household_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (membership) {
    if (membership.role === 'owner') {
      // Check if household has other members
      const { data: otherMembers } = await admin
        .from('household_members')
        .select('id')
        .eq('household_id', membership.household_id)
        .neq('user_id', user.id)

      if (otherMembers && otherMembers.length === 0) {
        // No other members — delete the whole household (cascades to transactions)
        await admin
          .from('households')
          .delete()
          .eq('id', membership.household_id)
      } else {
        // Other members exist — just remove this user's membership
        await admin
          .from('household_members')
          .delete()
          .eq('user_id', user.id)
      }
    } else {
      // Regular member — just remove from household
      await admin
        .from('household_members')
        .delete()
        .eq('user_id', user.id)
    }
  }

  // Sign out first so cookies are cleared
  await supabase.auth.signOut()

  // Delete the auth user via admin API
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
  if (deleteError) {
    console.error('[DELETE /api/account]', deleteError)
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
