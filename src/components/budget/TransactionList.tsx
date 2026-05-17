'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { formatAmount, formatDate } from '@/lib/utils'

interface EnrichedTransaction {
  id: string
  amount: number
  description: string
  date: string
  isRecurring?: boolean
  category: { name: string; color: string; icon: string; type: 'income' | 'expense' } | null
}

interface TransactionListProps {
  transactions: EnrichedTransaction[]
  onDelete: (id: string) => void
  emptyMessage?: string
}

export default function TransactionList({ transactions, onDelete, emptyMessage }: TransactionListProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null)

  function handleDelete(id: string) {
    if (confirmId === id) {
      onDelete(id)
      setConfirmId(null)
    } else {
      setConfirmId(id)
      setTimeout(() => setConfirmId(null), 3000)
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p style={{ color: '#64748b', fontSize: 13 }}>{emptyMessage ?? 'Inga transaktioner'}</p>
      </div>
    )
  }

  return (
    <div>
      {transactions.map((tx, i) => (
        <div
          key={tx.id}
          className="flex items-center gap-3 py-3"
          style={{ borderBottom: i < transactions.length - 1 ? '1px solid #f1f5f9' : 'none' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
            style={{ backgroundColor: (tx.category?.color ?? '#94a3b8') + '22' }}
          >
            {tx.category?.icon ?? '📦'}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: '#0f172a' }}>{tx.description}</p>
            <p className="text-xs" style={{ color: '#64748b' }}>
              {tx.category?.name ?? 'Okategori'}
            </p>
          </div>

          <span className="text-xs flex-shrink-0" style={{ color: '#94a3b8' }}>{formatDate(tx.date)}</span>

          <span
            className="text-sm font-semibold flex-shrink-0"
            style={{
              color: tx.category?.type === 'income' ? '#10b981' : '#6366f1',
              minWidth: 90,
              textAlign: 'right',
            }}
          >
            {tx.category?.type === 'income' ? '+' : '−'}{formatAmount(tx.amount)}
          </span>

          <button
            onClick={() => handleDelete(tx.id)}
            title={confirmId === tx.id ? 'Klicka igen för att bekräfta' : 'Ta bort'}
            className="flex-shrink-0 p-1 rounded cursor-pointer"
            style={{
              background: 'none',
              border: 'none',
              color: confirmId === tx.id ? '#ef4444' : '#cbd5e1',
              transition: 'color 0.15s',
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
