import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCategoryMeta } from '@/lib/categories'
import { SupabaseTransaction, EnrichedTransaction } from '@/types'

async function getAuthedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { user: null, admin: null, householdId: null }

  const admin = createAdminClient()
  const { data: membership } = await admin
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  return { user, admin, householdId: membership?.household_id ?? null }
}

function enrich(tx: SupabaseTransaction): EnrichedTransaction {
  const meta = getCategoryMeta(tx.category, tx.type)
  return {
    id: tx.id,
    amount: Number(tx.amount),
    description: tx.title,
    date: tx.transaction_date,
    isRecurring: tx.is_recurring ?? false,
    category: {
      name: meta.name,
      color: meta.color,
      icon: meta.icon,
      type: tx.type,
    },
  }
}

export async function GET(req: NextRequest) {
  const { user, admin, householdId } = await getAuthedUser()
  if (!user || !admin || !householdId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')
  const type = searchParams.get('type') as 'income' | 'expense' | null
  const recurring = searchParams.get('recurring')

  let query = admin
    .from('transactions')
    .select('*')
    .eq('household_id', householdId)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (month) {
    const start = `${month}-01`
    const [y, m] = month.split('-').map(Number)
    const nextMonth = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`
    query = query.gte('transaction_date', start).lt('transaction_date', nextMonth)
  }

  if (type) query = query.eq('type', type)
  if (recurring === 'true') query = query.eq('is_recurring', true)
  if (recurring === 'false') query = query.eq('is_recurring', false)

  const { data, error } = await query
  if (error) {
    console.error('[GET /api/transactions]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json((data as SupabaseTransaction[]).map(enrich))
}

export async function POST(req: NextRequest) {
  const { user, admin, householdId } = await getAuthedUser()
  if (!user || !admin || !householdId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { amount, description, category, type, date, isRecurring } = body

  if (!amount || !description?.trim() || !type || !date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const num = Number(amount)
  if (isNaN(num) || num <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const categoryName = category?.trim() || (type === 'income' ? 'Övrigt inkomst' : 'Övrigt utgift')

  const { data, error } = await admin
    .from('transactions')
    .insert({
      household_id: householdId,
      user_id: user.id,
      title: description.trim(),
      amount: num,
      type,
      category: categoryName,
      transaction_date: date,
      is_recurring: isRecurring === true,
    })
    .select()
    .single()

  if (error || !data) {
    console.error('[POST /api/transactions]', error)
    return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 })
  }

  return NextResponse.json(enrich(data as SupabaseTransaction), { status: 201 })
}
