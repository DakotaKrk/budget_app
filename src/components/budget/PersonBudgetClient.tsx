'use client'

import { useState, useEffect, useCallback } from 'react'
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react'
import { formatAmount } from '@/lib/utils'
import { PersonBudgetItem } from '@/types'
import MonthNav from './MonthNav'

interface Props {
  person: 'nenlil' | 'nathalie'
  month: string
  accentColor: string
  lightBg: string
}

export default function PersonBudgetClient({ person, month, accentColor, lightBg }: Props) {
  const [items, setItems] = useState<PersonBudgetItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const load = useCallback(() => {
    fetch(`/api/person-budget?person=${person}&month=${month}`)
      .then(r => r.json())
      .then(setItems)
  }, [person, month])

  useEffect(() => { load() }, [load])

  const total = items.reduce((s, i) => s + i.amount, 0)

  async function handleSave() {
    const num = parseFloat(amount.replace(',', '.'))
    if (!name.trim() || isNaN(num) || num <= 0) return
    setSaving(true)

    if (editId) {
      await fetch(`/api/person-budget/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), amount: num }),
      })
    } else {
      await fetch('/api/person-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person, name: name.trim(), amount: num, month }),
      })
    }

    setSaving(false)
    setName('')
    setAmount('')
    setShowForm(false)
    setEditId(null)
    load()
  }

  function startEdit(item: PersonBudgetItem) {
    setEditId(item.id)
    setName(item.name)
    setAmount(String(item.amount))
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditId(null)
    setName('')
    setAmount('')
  }

  async function handleDelete(id: string) {
    if (confirmDelete === id) {
      await fetch(`/api/person-budget/${id}`, { method: 'DELETE' })
      setConfirmDelete(null)
      load()
    } else {
      setConfirmDelete(id)
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  const inputStyle: React.CSSProperties = {
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '9px 12px',
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#fff',
    outline: 'none',
    width: '100%',
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Month nav + total */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <MonthNav month={month} />
        {items.length > 0 && (
          <div style={{
            backgroundColor: lightBg,
            border: `1px solid ${accentColor}33`,
            borderRadius: 10,
            padding: '8px 16px',
            textAlign: 'right',
          }}>
            <p style={{ fontSize: 11, color: accentColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total denna månad
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, color: accentColor }}>
              {formatAmount(total)}
            </p>
          </div>
        )}
      </div>

      {/* Items list */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 16 }}>
        {items.length === 0 && !showForm ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>💸</p>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 4 }}>Inga poster för denna månad</p>
            <p style={{ color: '#94a3b8', fontSize: 12 }}>Lägg till en post för att komma igång</p>
          </div>
        ) : (
          <div>
            {items.map((item, i) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 20px',
                  borderBottom: i < items.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: lightBg,
                    border: `1px solid ${accentColor}33`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  💳
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', marginBottom: 1 }}>{item.name}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8' }}>Månad: {item.month}</p>
                </div>

                <span style={{ fontSize: 15, fontWeight: 700, color: accentColor, flexShrink: 0 }}>
                  {formatAmount(item.amount)}
                </span>

                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button
                    onClick={() => startEdit(item)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 6 }}
                    title="Redigera"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: confirmDelete === item.id ? '#ef4444' : '#94a3b8',
                      padding: 4,
                      borderRadius: 6,
                    }}
                    title={confirmDelete === item.id ? 'Klicka igen för att ta bort' : 'Ta bort'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inline form */}
        {showForm && (
          <div style={{
            borderTop: items.length > 0 ? '1px solid #e2e8f0' : 'none',
            padding: '16px 20px',
            backgroundColor: '#f8fafc',
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>
              {editId ? 'Redigera post' : 'Ny post'}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                autoFocus
                type="text"
                placeholder="Namn (t.ex. Hyra, El, Spotify)"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ ...inputStyle, flex: 2 }}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
              <input
                type="text"
                inputMode="decimal"
                placeholder="Belopp (kr)"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  backgroundColor: accentColor,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '9px 14px',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  flexShrink: 0,
                }}
              >
                <Check size={14} />
                {saving ? 'Sparar...' : 'Spara'}
              </button>
              <button
                onClick={cancelForm}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '9px 12px',
                  cursor: 'pointer',
                  color: '#64748b',
                  flexShrink: 0,
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            backgroundColor: accentColor,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          Lägg till post
        </button>
      )}
    </div>
  )
}
