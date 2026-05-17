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

export async function GET() {
  const { user, admin, householdId } = await getAuthedHousehold()
  if (!user || !admin || !householdId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: loans, error } = await admin
    .from('loans')
    .select('*, loan_payments(*)')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(loans)
}

export async function POST(req: NextRequest) {
  const { user, admin, householdId } = await getAuthedHousehold()
  if (!user || !admin || !householdId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, totalAmount, note } = body

  if (!name?.trim() || !totalAmount)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const num = Number(totalAmount)
  if (isNaN(num) || num <= 0)
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

  const { data, error } = await admin
    .from('loans')
    .insert({
      household_id: householdId,
      user_id: user.id,
      name: name.trim(),
      total_amount: num,
      note: note?.trim() || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
