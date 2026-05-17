'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trash2, Lightbulb, CheckCircle, AlertCircle, RefreshCw, Tv } from 'lucide-react'
import { formatAmount } from '@/lib/utils'
import AddTransactionModal from '@/components/budget/AddTransactionModal'
import { EnrichedTransaction } from '@/types'

const TIPS = [
  { threshold: 0,   max: 200,  Icon: CheckCircle, color: '#10b981', bg: '#ecfdf5', border: '#6ee7b7', text: 'Snyggt jobbat! Du har koll på dina prenumerationer.' },
  { threshold: 200, max: 500,  Icon: Lightbulb,   color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d', text: 'Kolla om du kan dela Netflix eller Spotify med någon — det kan halvera kostnaden.' },
  { threshold: 500, max: 9999, Icon: AlertCircle,  color: '#ef4444', bg: '#fef2f2', border: '#fca5a5', text: 'Du spenderar en hel del på prenumerationer. Använder du alla aktivt?' },
]

const SUGGESTIONS = [
  'Netflix + HBO Max = ~270 kr/mån. Välj en och byt varannan månad.',
  'Spotify Family (169 kr) är billigare än 2 × individuella (219 kr).',
  'Pausa tidningsprenumerationer du sällan läser.',
  'Gymkort du inte använder varje vecka — överväg klippkort istället.',
  'Kolla om du betalar för lagring du inte fyller (iCloud, Google One).',
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
  const TipIcon = tip.Icon

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
        <TipIcon size={22} color={tip.color} style={{ flexShrink: 0, marginTop: 2 }} />
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
          <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lightbulb size={15} color="#f59e0b" /> Smarta tips för att spara
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
        <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Tv size={15} color="#818cf8" /> Dina prenumerationer
        </p>

        {loading && <p style={{ color: '#94a3b8', fontSize: 13 }}>Laddar…</p>}

        {!loading && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Tv size={28} color="#818cf8" /></div>
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
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#818cf822' }}
                >
                  <Tv size={16} color="#818cf8" />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>{tx.description}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {tx.isRecurring && <RefreshCw size={10} />}
                    {tx.isRecurring ? 'Återkommande · ' : ''}{tx.date}
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
