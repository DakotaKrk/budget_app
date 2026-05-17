import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentMonth, formatAmount, formatDate } from '@/lib/utils'
import { getCategoryMeta } from '@/lib/categories'
import { SupabaseTransaction, MonthlySummary } from '@/types'
import PageHeader from '@/components/budget/PageHeader'
import OverviewCharts from '@/components/budget/OverviewCharts'
import MonthNav from '@/components/budget/MonthNav'

interface Props {
  searchParams: Promise<{ month?: string }>
}

const card = {
  backgroundColor: '#fff',
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  padding: '20px 24px',
} as React.CSSProperties

function buildSummary(all: SupabaseTransaction[], month: string): MonthlySummary {
  const [y, m] = month.split('-').map(Number)

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

  return { income, expenses, result: income - expenses, byCategory, lastSixMonths }
}

export default async function OverviewPage({ searchParams }: Props) {
  const { month: qMonth } = await searchParams
  const month = qMonth ?? getCurrentMonth()

  // Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Household membership
  const { data: membership } = await admin
    .from('household_members')
    .select('household_id, role, households(id, name)')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) redirect('/onboarding')

  const householdId = membership.household_id

  // Fetch 6 months of transactions in one query
  const [y, m] = month.split('-').map(Number)
  const sixMonthsAgo = new Date(y, m - 1 - 5, 1)
  const startDate = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}-01`
  const nextMonthDate = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`

  const { data: txData } = await admin
    .from('transactions')
    .select('*')
    .eq('household_id', householdId)
    .gte('transaction_date', startDate)
    .lt('transaction_date', nextMonthDate)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })

  const all = (txData ?? []) as SupabaseTransaction[]
  const summary = buildSummary(all, month)

  // Previous month values for trend arrows
  const prev = summary.lastSixMonths[summary.lastSixMonths.length - 2] ?? { income: 0, expenses: 0 }
  function trend(current: number, previous: number) {
    if (previous === 0) return null
    const pct = Math.round(((current - previous) / previous) * 100)
    if (Math.abs(pct) < 1) return null
    return { pct, up: current > previous }
  }
  const incomeTrend  = trend(summary.income, prev.income)
  const expenseTrend = trend(summary.expenses, prev.expenses)

  // Recent transactions for the current month (latest 8)
  const recent = all
    .filter(t => t.transaction_date.startsWith(month))
    .slice(0, 8)

  // Household members
  const { data: membersData } = await admin
    .from('household_members')
    .select('user_id, role, created_at')
    .eq('household_id', householdId)
    .order('created_at', { ascending: true })

  const members = membersData ?? []

  // Resolve member emails via admin auth API
  const memberDetails = await Promise.all(
    members.map(async (mem) => {
      const { data } = await admin.auth.admin.getUserById(mem.user_id)
      return {
        userId: mem.user_id,
        role: mem.role as string,
        email: data.user?.email ?? `${mem.user_id.slice(0, 8)}…`,
        isYou: mem.user_id === user.id,
      }
    }),
  )

  return (
    <div>
      {/* Page header */}
      <div className="px-4 pt-5 pb-0 sm:px-9 sm:pt-8">
        <div className="flex items-center justify-between mb-6 sm:mb-7">
          <PageHeader title="Översikt" />
          <Suspense>
            <MonthNav month={month} />
          </Suspense>
        </div>
      </div>

      <div className="px-4 pb-8 sm:px-9 flex flex-col gap-5">

        {/* Summary cards — 1 col on mobile, 3 cols on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div style={card}>
            <p style={{ fontSize: 11, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Inkomster</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#10b981', letterSpacing: '-0.5px' }}>+{formatAmount(summary.income)}</p>
              {incomeTrend && (
                <span style={{ fontSize: 12, fontWeight: 600, color: incomeTrend.up ? '#10b981' : '#ef4444', marginBottom: 5 }}>
                  {incomeTrend.up ? '↑' : '↓'} {Math.abs(incomeTrend.pct)}%
                </span>
              )}
            </div>
            {incomeTrend && (
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>vs förra månaden</p>
            )}
          </div>
          <div style={card}>
            <p style={{ fontSize: 11, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Utgifter</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#6366f1', letterSpacing: '-0.5px' }}>−{formatAmount(summary.expenses)}</p>
              {expenseTrend && (
                <span style={{ fontSize: 12, fontWeight: 600, color: expenseTrend.up ? '#ef4444' : '#10b981', marginBottom: 5 }}>
                  {expenseTrend.up ? '↑' : '↓'} {Math.abs(expenseTrend.pct)}%
                </span>
              )}
            </div>
            {expenseTrend && (
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>vs förra månaden</p>
            )}
          </div>
          <div style={card}>
            <p style={{ fontSize: 11, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resultat</p>
            <p style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', color: summary.result >= 0 ? '#10b981' : '#ef4444' }}>
              {summary.result >= 0 ? '+' : ''}{formatAmount(summary.result)}
            </p>
          </div>
        </div>

        {/* Charts */}
        <Suspense>
          <OverviewCharts summary={summary} />
        </Suspense>

        {/* Bottom row: recent transactions + members */}
        {/* Stacks on mobile, side-by-side on xl+ */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-4 items-start">

          {/* Recent transactions */}
          <div style={card}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 16 }}>Senaste transaktioner</p>
            {recent.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                Inga transaktioner denna månad
              </p>
            ) : (
              <div>
                {recent.map((tx, i) => {
                  const meta = getCategoryMeta(tx.category, tx.type)
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 py-2.5"
                      style={{ borderBottom: i < recent.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                        style={{ backgroundColor: meta.color + '22' }}
                      >
                        {meta.icon}
                      </div>
                      <span className="flex-1 text-sm truncate" style={{ color: '#0f172a' }}>{tx.title}</span>
                      <span className="text-xs flex-shrink-0" style={{ color: '#94a3b8' }}>{formatDate(tx.transaction_date)}</span>
                      <span
                        className="text-sm font-semibold flex-shrink-0"
                        style={{ color: tx.type === 'income' ? '#10b981' : '#6366f1', minWidth: 90, textAlign: 'right' }}
                      >
                        {tx.type === 'income' ? '+' : '−'}{formatAmount(Number(tx.amount))}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Household members */}
          <div style={card}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 16 }}>Hushållsmedlemmar</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {memberDetails.map((mem) => (
                <div key={mem.userId} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: mem.role === 'owner' ? '#312e8133' : '#e0e7ff',
                      border: `2px solid ${mem.role === 'owner' ? '#6366f1' : '#c7d2fe'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#4338ca',
                      flexShrink: 0,
                    }}
                  >
                    {mem.email[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, color: '#0f172a', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {mem.email}{mem.isYou ? ' (du)' : ''}
                    </p>
                    <p style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      {mem.role === 'owner' ? 'Ägare' : 'Medlem'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
