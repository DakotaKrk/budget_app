import { Suspense } from 'react'
import { computeSummary, readData } from '@/lib/db'
import { getCurrentMonth, formatAmount, formatDate } from '@/lib/utils'
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

export default async function OverviewPage({ searchParams }: Props) {
  const { month: qMonth } = await searchParams
  const month = qMonth ?? getCurrentMonth()

  const data = readData()
  const summary = computeSummary(data, month)

  const catMap = new Map(data.categories.map(c => [c.id, c]))
  const recent = data.transactions
    .filter(t => t.date.startsWith(month))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8)
    .map(t => ({ ...t, category: t.categoryId ? (catMap.get(t.categoryId) ?? null) : null }))

  return (
    <div>
      <div style={{ padding: '32px 36px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <PageHeader title="Översikt" />
          <Suspense>
            <MonthNav month={month} />
          </Suspense>
        </div>
      </div>
      <div style={{ padding: '0 36px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div style={card}>
            <p style={{ fontSize: 11, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Inkomster</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#10b981', letterSpacing: '-0.5px' }}>+{formatAmount(summary.income)}</p>
          </div>
          <div style={card}>
            <p style={{ fontSize: 11, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Utgifter</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#6366f1', letterSpacing: '-0.5px' }}>−{formatAmount(summary.expenses)}</p>
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

        {/* Recent transactions */}
        <div style={card}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 16 }}>Senaste transaktioner</p>
          {recent.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
              Inga transaktioner denna månad
            </p>
          ) : (
            <div>
              {recent.map((tx, i) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 py-2.5"
                  style={{ borderBottom: i < recent.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                    style={{ backgroundColor: (tx.category?.color ?? '#94a3b8') + '22' }}
                  >
                    {tx.category?.icon ?? '📦'}
                  </div>
                  <span className="flex-1 text-sm" style={{ color: '#0f172a' }}>{tx.description}</span>
                  <span className="text-xs flex-shrink-0" style={{ color: '#94a3b8' }}>{formatDate(tx.date)}</span>
                  <span
                    className="text-sm font-semibold flex-shrink-0"
                    style={{ color: tx.category?.type === 'income' ? '#10b981' : '#6366f1', minWidth: 90, textAlign: 'right' }}
                  >
                    {tx.category?.type === 'income' ? '+' : '−'}{formatAmount(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
