'use client'

import { useState } from 'react'
import { Trash2, Pencil } from 'lucide-react'
import { formatAmount, formatDate } from '@/lib/utils'
import { CATEGORIES } from '@/lib/categories'

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
  onUpdated?: () => void
  emptyMessage?: string
}

export default function TransactionList({ transactions, onDelete, onUpdated, emptyMessage }: TransactionListProps) {
  const [confirmId, setConfirmId]   = useState<string | null>(null)
  const [editTx, setEditTx]         = useState<EnrichedTransaction | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editDesc, setEditDesc]     = useState('')
  const [editCat, setEditCat]       = useState('')
  const [editDate, setEditDate]     = useState('')
  const [editRecurring, setEditRecurring] = useState(false)
  const [saving, setSaving]         = useState(false)
  const [editError, setEditError]   = useState('')

  function openEdit(tx: EnrichedTransaction) {
    setEditTx(tx)
    setEditAmount(String(tx.amount))
    setEditDesc(tx.description)
    setEditCat(tx.category?.name ?? '')
    setEditDate(tx.date)
    setEditRecurring(tx.isRecurring ?? false)
    setEditError('')
  }

  function closeEdit() {
    if (saving) return
    setEditTx(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editTx) return
    const num = parseFloat(editAmount.replace(',', '.'))
    if (isNaN(num) || num <= 0) { setEditError('Ange ett giltigt belopp'); return }
    if (!editDesc.trim())        { setEditError('Ange en beskrivning'); return }

    setSaving(true)
    setEditError('')

    const res = await fetch(`/api/transactions/${editTx.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: num,
        description: editDesc.trim(),
        category: editCat,
        date: editDate,
        isRecurring: editRecurring,
      }),
    })

    setSaving(false)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setEditError(body.error ?? 'Något gick fel')
      return
    }

    setEditTx(null)
    onUpdated?.()
  }

  function handleDelete(id: string) {
    if (confirmId === id) {
      onDelete(id)
      setConfirmId(null)
    } else {
      setConfirmId(id)
      setTimeout(() => setConfirmId(null), 3000)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 5,
  }

  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p style={{ color: '#64748b', fontSize: 13 }}>{emptyMessage ?? 'Inga transaktioner'}</p>
      </div>
    )
  }

  const editCategories = editTx
    ? CATEGORIES.filter(c => c.type === editTx.category?.type)
    : []

  return (
    <>
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
                {tx.isRecurring && <span style={{ marginLeft: 6 }}>🔁</span>}
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

            {/* Edit button */}
            <button
              onClick={() => openEdit(tx)}
              title="Redigera"
              className="flex-shrink-0 p-1 rounded cursor-pointer"
              style={{ background: 'none', border: 'none', color: '#cbd5e1', transition: 'color 0.15s' }}
            >
              <Pencil size={13} />
            </button>

            {/* Delete button */}
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

      {/* Edit modal */}
      {editTx && (
        <div
          onClick={closeEdit}
          className="fixed inset-0 z-[1000] flex flex-col justify-end sm:items-center sm:justify-center sm:p-4 bg-black/45"
          style={{ backdropFilter: 'blur(2px)' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full sm:max-w-[460px] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
            style={{ backgroundColor: '#fff', maxHeight: '92dvh', boxShadow: '0 -4px 40px rgba(15,23,42,0.18)' }}
          >
            {/* Drag handle — mobile */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0' }} />
            </div>

            {/* Header */}
            <div style={{
              backgroundColor: editTx.category?.type === 'income' ? '#10b981' : '#6366f1',
              padding: '18px 24px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#fff' }}>Redigera transaktion</h2>
              <button
                onClick={closeEdit}
                style={{
                  background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6,
                  color: '#fff', width: 28, height: 28, fontSize: 18, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >×</button>
            </div>

            {/* Form */}
            <div style={{ padding: '20px 24px 24px' }}>
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                <div>
                  <label style={labelStyle}>Belopp (kr)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    required
                    style={{
                      ...inputStyle,
                      fontSize: 28, fontWeight: 700,
                      color: editTx.category?.type === 'income' ? '#10b981' : '#6366f1',
                      padding: '12px 14px',
                    }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Beskrivning</label>
                  <input
                    type="text"
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Kategori</label>
                  <select value={editCat} onChange={e => setEditCat(e.target.value)} style={inputStyle}>
                    {editCategories.map(c => (
                      <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Datum</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                {/* Recurring toggle */}
                <button
                  type="button"
                  onClick={() => setEditRecurring(r => !r)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 8,
                    border: `1px solid ${editRecurring ? '#818cf8' : '#e2e8f0'}`,
                    backgroundColor: editRecurring ? '#eef2ff' : '#f8fafc',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{editRecurring ? '🔁' : '1️⃣'}</span>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0 }}>
                    {editRecurring ? 'Återkommande varje månad' : 'Engångstransaktion'}
                  </p>
                </button>

                {editError && (
                  <p style={{ fontSize: 13, color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 7, padding: '8px 12px', margin: 0 }}>
                    {editError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    marginTop: 2, width: '100%', padding: '13px',
                    backgroundColor: saving ? '#818cf8' : '#6366f1',
                    color: '#fff', border: 'none', borderRadius: 9,
                    fontSize: 14, fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.75 : 1,
                  }}
                >
                  {saving ? 'Sparar...' : 'Spara ändringar'}
                </button>

              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
