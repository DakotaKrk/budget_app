'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trash2, RefreshCw } from 'lucide-react'
import { formatAmount } from '@/lib/utils'

interface EnrichedTransaction {
  id: string
  amount: number
  description: string
  recurringInterval: string | null
  category: { name: string; color: string; icon: string; type: 'income' | 'expense' } | null
}

const intervalLabels: Record<string, string> = {
  monthly: 'Varje månad',
  weekly: 'Varje vecka',
  yearly: 'Varje år',
}

export default function RecurringClient() {
  const [transactions, setTransactions] = useState<EnrichedTransaction[]>([])
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const load = useCallback(() => {
    fetch('/api/transactions?recurring=true')
      .then(r => r.json())
      .then(setTransactions)
  }, [])

  useEffect(() => { load() }, [load])

  function handleDelete(id: string) {
    if (confirmId === id) {
      fetch(`/api/transactions/${id}`, { method: 'DELETE' }).then(load)
      setConfirmId(null)
    } else {
      setConfirmId(id)
      setTimeout(() => setConfirmId(null), 3000)
    }
  }

  const expenses = transactions.filter(t => t.category?.type === 'expense')
  const income = transactions.filter(t => t.category?.type === 'income')
  const totalExp = expenses.reduce((s, t) => s + t.amount, 0)
  const totalInc = income.reduce((s, t) => s + t.amount, 0)

  const card: React.CSSProperties = { backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }

  function renderList(items: EnrichedTransaction[], type: 'income' | 'expense') {
    if (items.length === 0) {
      return (
        <p style={{ color: '#64748b', fontSize: 13, padding: '16px 0' }}>
          Inga återkommande {type === 'expense' ? 'utgifter' : 'intäkter'} ännu.
        </p>
      )
    }
    return (
      <div>
        {items.map((tx, i) => (
          <div
            key={tx.id}
            className="flex items-center gap-3 py-3"
            style={{ borderBottom: i < items.length - 1 ? '1px solid #f1f5f9' : 'none' }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
              style={{ backgroundColor: (tx.category?.color ?? '#94a3b8') + '22' }}
            >
              {tx.category?.icon ?? '📦'}
            </div>
            <div className="flex-1">
              <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>{tx.description}</p>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <RefreshCw size={10} />
                {intervalLabels[tx.recurringInterval ?? ''] ?? tx.recurringInterval}
                {' · '}{tx.category?.name}
              </p>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: type === 'income' ? '#10b981' : '#6366f1', minWidth: 90, textAlign: 'right' }}>
              {type === 'income' ? '+' : '−'}{formatAmount(tx.amount)}
            </span>
            <button
              onClick={() => handleDelete(tx.id)}
              title={confirmId === tx.id ? 'Klicka igen' : 'Ta bort'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: confirmId === tx.id ? '#ef4444' : '#cbd5e1' }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {transactions.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {[
            { label: 'Fast inkomst/mån', value: `+${formatAmount(totalInc)}`, color: '#10b981' },
            { label: 'Fasta utgifter/mån', value: `−${formatAmount(totalExp)}`, color: '#6366f1' },
            { label: 'Kvar efter fasta', value: `${totalInc - totalExp >= 0 ? '+' : ''}${formatAmount(totalInc - totalExp)}`, color: totalInc - totalExp >= 0 ? '#10b981' : '#ef4444' },
          ].map(({ label, value, color }) => (
            <div key={label} style={card}>
              <p style={{ fontSize: 11, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={card}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 16 }}>Fasta utgifter</p>
          {renderList(expenses, 'expense')}
        </div>
        <div style={card}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 16 }}>Fasta intäkter</p>
          {renderList(income, 'income')}
        </div>
      </div>
    </div>
  )
}
