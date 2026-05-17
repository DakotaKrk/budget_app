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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: loanId } = await params
  const { user, admin, householdId } = await getAuthedHousehold()
  if (!user || !admin || !householdId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify loan belongs to this household
  const { data: loan, error: loanErr } = await admin
    .from('loans')
    .select('id')
    .eq('id', loanId)
    .eq('household_id', householdId)
    .single()

  if (loanErr || !loan)
    return NextResponse.json({ error: 'Loan not found' }, { status: 404 })

  const body = await req.json()
  const { amount, note, paidAt } = body

  const num = Number(amount)
  if (isNaN(num) || num <= 0)
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

  const { data, error } = await admin
    .from('loan_payments')
    .insert({
      loan_id: loanId,
      amount: num,
      note: note?.trim() || null,
      paid_at: paidAt || new Date().toISOString().split('T')[0],
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
