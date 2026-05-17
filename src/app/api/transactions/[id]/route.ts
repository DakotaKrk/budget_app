import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCategoryMeta } from '@/lib/categories'
import { SupabaseTransaction } from '@/types'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: membership } = await admin
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'No household found' }, { status: 403 })
  }

  const { error } = await admin
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('household_id', membership.household_id)

  if (error) {
    console.error('[DELETE /api/transactions/:id]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: membership } = await admin
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'No household found' }, { status: 403 })
  }

  const body = await req.json()
  const { amount, description, category, date, isRecurring } = body

  if (!amount || !description?.trim() || !date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const num = Number(amount)
  if (isNaN(num) || num <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('transactions')
    .update({
      title: description.trim(),
      amount: num,
      category: category?.trim() || 'Övrigt',
      transaction_date: date,
      is_recurring: isRecurring === true,
    })
    .eq('id', id)
    .eq('household_id', membership.household_id)
    .select()
    .single()

  if (error || !data) {
    console.error('[PATCH /api/transactions/:id]', error)
    return NextResponse.json({ error: error?.message ?? 'Update failed' }, { status: 500 })
  }

  const tx = data as SupabaseTransaction
  const meta = getCategoryMeta(tx.category, tx.type)
  return NextResponse.json({
    id: tx.id,
    amount: Number(tx.amount),
    description: tx.title,
    date: tx.transaction_date,
    isRecurring: tx.is_recurring ?? false,
    category: { name: meta.name, color: meta.color, icon: meta.icon, type: tx.type },
  })
}
