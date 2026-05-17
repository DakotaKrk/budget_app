'use client'

import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { MonthlySummary } from '@/types'
import { formatAmount, formatShortMonth } from '@/lib/utils'

export default function OverviewCharts({ summary }: { summary: MonthlySummary }) {
  const expenseCategories = summary.byCategory.filter(c => c.type === 'expense' && c.total > 0)

  const barData = summary.lastSixMonths.map(m => ({
    name: formatShortMonth(m.month),
    Inkomster: m.income,
    Utgifter: m.expenses,
  }))

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1.3fr' }}>
      {/* Pie chart */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 24px' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 16 }}>Utgifter per kategori</p>
        {expenseCategories.length === 0 ? (
          <div className="flex items-center justify-center" style={{ height: 180 }}>
            <p style={{ color: '#64748b', fontSize: 13 }}>Inga utgifter denna månad</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={expenseCategories} dataKey="total" nameKey="name" cx="50%" cy="50%"
                  innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {expenseCategories.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatAmount(Number(value)), "Belopp"]}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
              {expenseCategories.slice(0, 5).map((cat, i) => {
                const pct = summary.expenses > 0 ? Math.round((cat.total / summary.expenses) * 100) : 0
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cat.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 12, color: '#0f172a' }}>{cat.name}</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{pct}%</span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Bar chart */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 24px' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 16 }}>Senaste 6 månader</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barData} barSize={14} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={48}
              tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)} />
            <Tooltip
              formatter={(value) => [formatAmount(Number(value)), "Belopp"]}
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
            />
            <Bar dataKey="Inkomster" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Utgifter" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
