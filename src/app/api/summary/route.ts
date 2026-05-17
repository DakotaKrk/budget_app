import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCategoryMeta } from '@/lib/categories'
import { SupabaseTransaction, MonthlySummary } from '@/types'

export async function GET(req: NextRequest) {
  const month = req.nextUrl.searchParams.get('month') ?? new Date().toISOString().slice(0, 7)

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
    return NextResponse.json({ error: 'No household' }, { status: 404 })
  }

  // Fetch 6 months of data for the bar chart
  const [y, m] = month.split('-').map(Number)
  const sixMonthsAgo = new Date(y, m - 1 - 5, 1)
  const startDate = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}-01`
  const nextMonthDate = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`

  const { data: txs, error } = await admin
    .from('transactions')
    .select('*')
    .eq('household_id', membership.household_id)
    .gte('transaction_date', startDate)
    .lt('transaction_date', nextMonthDate)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const all = (txs ?? []) as SupabaseTransaction[]

  // Current month totals
  const monthTxs = all.filter(t => t.transaction_date.startsWith(month))
  let income = 0
  let expenses = 0
  const byCatMap = new Map<string, { total: number; type: 'income' | 'expense' }>()

  for (const tx of monthTxs) {
    const amt = Number(tx.amount)
    if (tx.type === 'income') income += amt
    else expenses += amt

    const key = `${tx.category}::${tx.type}`
    const prev = byCatMap.get(key)
    byCatMap.set(key, { total: (prev?.total ?? 0) + amt, type: tx.type })
  }

  const byCategory = Array.from(byCatMap.entries())
    .map(([key, { total, type }]) => {
      const name = key.split('::')[0]
      const meta = getCategoryMeta(name, type)
      return { name, color: meta.color, icon: meta.icon, type, total }
    })
    .sort((a, b) => b.total - a.total)

  // Last 6 months bar chart data
  const lastSixMonths: MonthlySummary['lastSixMonths'] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(y, m - 1 - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    let inc = 0, exp = 0
    for (const tx of all.filter(t => t.transaction_date.startsWith(key))) {
      if (tx.type === 'income') inc += Number(tx.amount)
      else exp += Number(tx.amount)
    }
    lastSixMonths.push({ month: key, income: inc, expenses: exp })
  }

  const summary: MonthlySummary = {
    income,
    expenses,
    result: income - expenses,
    byCategory,
    lastSixMonths,
  }

  return NextResponse.json(summary)
}
