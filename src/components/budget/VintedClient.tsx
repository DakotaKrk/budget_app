'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trash2, Tag } from 'lucide-react'
import { formatAmount } from '@/lib/utils'
import AddTransactionModal from '@/components/budget/AddTransactionModal'
import { EnrichedTransaction } from '@/types'
import CategoryIcon from '@/components/budget/CategoryIcon'

export default function VintedClient() {
  const [items, setItems]       = useState<EnrichedTransaction[]>([])
  const [loading, setLoading]   = useState(true)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/transactions?type=income')
    const all: EnrichedTransaction[] = await res.json().catch(() => [])
    // Show Vinted/Tradera and Secondhand categories
    const filtered = Array.isArray(all)
      ? all.filter(t =>
          t.category?.name === 'Vinted/Tradera' ||
          t.category?.name === 'Secondhand'
        )
      : []
    setItems(filtered)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleDelete(id: string) {
    if (confirmId === id) {
      await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      setConfirmId(null)
      load()
    } else {
      setConfirmId(id)
      setTimeout(() => setConfirmId(null), 3000)
    }
  }

  const total = items.reduce((s, t) => s + t.amount, 0)
  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthTotal = items
    .filter(t => t.date?.startsWith(thisMonth))
    .reduce((s, t) => s + t.amount, 0)

  const card: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    padding: 24,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Add button */}
      <div className="flex justify-end">
        <AddTransactionModal />
      </div>

      {/* Summary */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div style={card}>
            <p style={{ fontSize: 11, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Denna månad
            </p>
            <p style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>+{formatAmount(monthTotal)}</p>
          </div>
          <div style={card}>
            <p style={{ fontSize: 11, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Totalt intjänat
            </p>
            <p style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>+{formatAmount(total)}</p>
          </div>
        </div>
      )}

      {/* List */}
      <div style={card}>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Tag size={15} color="#10b981" /> Vinted & Tradera
        </p>

        {loading && (
          <p style={{ color: '#94a3b8', fontSize: 13, padding: '16px 0' }}>Laddar…</p>
        )}

        {!loading && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Tag size={28} color="#10b981" /></div>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', marginBottom: 4 }}>Inga försäljningar ännu</p>
            <p style={{ fontSize: 13, color: '#64748b' }}>
              Klicka på "Lägg till" och välj kategorin Vinted/Tradera för att logga en försäljning.
            </p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div>
            {items.map((tx, i) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 py-3"
                style={{ borderBottom: i < items.length - 1 ? '1px solid #f1f5f9' : 'none' }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: (tx.category?.color ?? '#10b981') + '22' }}
                >
                  <CategoryIcon name={tx.category?.icon ?? 'Tag'} size={16} color={tx.category?.color ?? '#10b981'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>{tx.description}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                    {tx.category?.name} · {tx.date}
                  </p>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#10b981', minWidth: 80, textAlign: 'right' }}>
                  +{formatAmount(tx.amount)}
                </span>
                <button
                  onClick={() => handleDelete(tx.id)}
                  title={confirmId === tx.id ? 'Klicka igen för att bekräfta' : 'Ta bort'}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    borderRadius: 6,
                    color: confirmId === tx.id ? '#ef4444' : '#cbd5e1',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
