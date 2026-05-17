'use client'

import { useState, useEffect, useCallback } from 'react'
import TransactionForm from './TransactionForm'
import TransactionList from './TransactionList'
import { formatAmount } from '@/lib/utils'

interface EnrichedTransaction {
  id: string
  amount: number
  description: string
  date: string
  isRecurring?: boolean
  category: { name: string; color: string; icon: string; type: 'income' | 'expense' } | null
}

interface Props {
  type: 'income' | 'expense'
  month: string
}

export default function TransactionPageClient({ type, month }: Props) {
  const [transactions, setTransactions] = useState<EnrichedTransaction[]>([])

  const load = useCallback(() => {
    fetch(`/api/transactions?month=${month}&type=${type}`)
      .then(r => r.json())
      .then(setTransactions)
  }, [month, type])

  useEffect(() => { load() }, [load])

  async function handleDelete(id: string) {
    await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    load()
  }

  const total = transactions.reduce((s, t) => s + t.amount, 0)
  const isIncome = type === 'income'
  const label = isIncome ? 'Intäkter' : 'Utgifter'
  const accentColor = isIncome ? '#10b981' : '#6366f1'
  const lightBg = isIncome ? '#ecfdf5' : '#eef2ff'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
      {/* Form */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 20 }}>
          Lägg till {isIncome ? 'intäkt' : 'utgift'}
        </p>
        <TransactionForm type={type} defaultDate={month + '-' + new Date().getDate().toString().padStart(2, '0')} onSaved={load} />
      </div>

      {/* List */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{label} denna månad</p>
          {transactions.length > 0 && (
            <span style={{ fontSize: 14, fontWeight: 700, color: accentColor }}>
              {isIncome ? '+' : '−'}{formatAmount(total)}
            </span>
          )}
        </div>

        {isIncome && transactions.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {Object.entries(
              transactions.reduce<Record<string, number>>((acc, t) => {
                const name = t.category?.name ?? 'Övrigt'
                acc[name] = (acc[name] ?? 0) + t.amount
                return acc
              }, {})
            ).map(([name, sum]) => (
              <span key={name} style={{ background: lightBg, borderRadius: 20, padding: '3px 10px', fontSize: 12, color: accentColor, fontWeight: 500 }}>
                {name}: +{formatAmount(sum)}
              </span>
            ))}
          </div>
        )}

        <TransactionList
          transactions={transactions}
          onDelete={handleDelete}
          onUpdated={load}
          emptyMessage={`Inga ${isIncome ? 'intäkter' : 'utgifter'} denna månad`}
        />
      </div>
    </div>
  )
}
