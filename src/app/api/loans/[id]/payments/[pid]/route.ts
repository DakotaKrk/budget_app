import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; pid: string }> },
) {
  const { id: loanId, pid } = await params

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: m } = await admin
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()
  if (!m) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify the payment belongs to a loan in this household
  const { data: payment, error: pErr } = await admin
    .from('loan_payments')
    .select('id, loan_id, loans!inner(household_id)')
    .eq('id', pid)
    .eq('loan_id', loanId)
    .single()

  if (pErr || !payment)
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

  const { error: delErr } = await admin
    .from('loan_payments')
    .delete()
    .eq('id', pid)

  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
