'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trash2 } from 'lucide-react'
import { formatAmount } from '@/lib/utils'
import AddTransactionModal from '@/components/budget/AddTransactionModal'
import { EnrichedTransaction } from '@/types'

const TIPS = [
  { threshold: 0,   max: 200,  icon: '👍', color: '#10b981', bg: '#ecfdf5', border: '#6ee7b7', text: 'Snyggt jobbat! Du har koll på dina prenumerationer.' },
  { threshold: 200, max: 500,  icon: '💡', color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d', text: 'Kolla om du kan dela Netflix eller Spotify med någon — det kan halvera kostnaden.' },
  { threshold: 500, max: 9999, icon: '🔍', color: '#ef4444', bg: '#fef2f2', border: '#fca5a5', text: 'Du spenderar en hel del på prenumerationer. Använder du alla aktivt?' },
]

const SUGGESTIONS = [
  '📺 Netflix + HBO Max = ~270 kr/mån. Välj en och byt varannan månad.',
  '🎵 Spotify Family (169 kr) är billigare än 2 × individuella (219 kr).',
  '📰 Pausa tidningsprenumerationer du sällan läser.',
  '🏋️ Gymkort du inte använder varje vecka — överväg klippkort istället.',
  '☁️ Kolla om du betalar för lagring du inte fyller (iCloud, Google One).',
]

export default function SubscriptionsClient() {
  const [items, setItems]       = useState<EnrichedTransaction[]>([])
  const [loading, setLoading]   = useState(true)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res  = await fetch('/api/transactions?type=expense')
    const all: EnrichedTransaction[] = await res.json().catch(() => [])
    setItems(Array.isArray(all) ? all.filter(t => t.category?.name === 'Prenumerationer') : [])
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

  const thisMonth  = new Date().toISOString().slice(0, 7)
  const monthTotal = items.filter(t => t.date?.startsWith(thisMonth)).reduce((s, t) => s + t.amount, 0)
  const tip = TIPS.find(t => monthTotal >= t.threshold && monthTotal < t.max) ?? TIPS[2]

  const card: React.CSSProperties = {
    backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Add button */}
      <div className="flex justify-end">
        <AddTransactionModal />
      </div>

      {/* Tip banner */}
      <div style={{
        backgroundColor: tip.bg, border: `1px solid ${tip.border}`,
        borderRadius: 12, padding: '16px 20px',
        display: 'flex', alignItems: 'flex-start', gap: 14,
      }}>
        <span style={{ fontSize: 24, flexShrink: 0 }}>{tip.icon}</span>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: tip.color, marginBottom: 4 }}>
            Du spenderar {formatAmount(monthTotal)} kr/mån på prenumerationer
          </p>
          <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{tip.text}</p>
        </div>
      </div>

      {/* Smart tips */}
      {monthTotal >= 200 && (
        <div style={card}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 14 }}>
            💡 Smarta tips för att spara
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SUGGESTIONS.map(s => (
              <div key={s} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', backgroundColor: '#818cf8',
                  flexShrink: 0, marginTop: 6,
                }} />
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      <div style={card}>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 16 }}>
          📱 Dina prenumerationer
        </p>

        {loading && <p style={{ color: '#94a3b8', fontSize: 13 }}>Laddar…</p>}

        {!loading && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>📱</p>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', marginBottom: 4 }}>Inga prenumerationer loggade</p>
            <p style={{ fontSize: 13, color: '#64748b' }}>
              Klicka på "Lägg till" och välj kategorin Prenumerationer.
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
                  className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                  style={{ backgroundColor: '#818cf822' }}
                >
                  📱
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>{tx.description}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                    {tx.isRecurring ? '🔁 Återkommande · ' : ''}{tx.date}
                  </p>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#6366f1', minWidth: 80, textAlign: 'right' }}>
                  −{formatAmount(tx.amount)}
                </span>
                <button
                  onClick={() => handleDelete(tx.id)}
                  title={confirmId === tx.id ? 'Klicka igen för att bekräfta' : 'Ta bort'}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 4, borderRadius: 6,
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
