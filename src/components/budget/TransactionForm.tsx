'use client'

import { useState, useEffect } from 'react'
import { Category } from '@/types'
import { todayISO } from '@/lib/utils'

interface TransactionFormProps {
  type: 'income' | 'expense'
  defaultDate?: string
  onSaved: () => void
}

const INTERVALS = [
  { value: 'monthly', label: 'Varje månad' },
  { value: 'weekly', label: 'Varje vecka' },
  { value: 'yearly', label: 'Varje år' },
]

export default function TransactionForm({ type, defaultDate, onSaved }: TransactionFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(defaultDate ?? todayISO())
  const [isRecurring, setIsRecurring] = useState(false)
  const [interval, setInterval] = useState('monthly')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then((cats: Category[]) => {
        const filtered = cats.filter(c => c.type === type)
        setCategories(filtered)
        if (filtered.length > 0) setCategoryId(filtered[0].id)
      })
  }, [type])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = parseFloat(amount.replace(',', '.'))
    if (isNaN(num) || num <= 0 || !description.trim()) return

    setSaving(true)
    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: num,
        description: description.trim(),
        categoryId: categoryId || null,
        date,
        isRecurring,
        recurringInterval: isRecurring ? interval : null,
      }),
    })
    setSaving(false)
    setSuccess(true)
    setAmount('')
    setDescription('')
    setDate(defaultDate ?? todayISO())
    setIsRecurring(false)
    onSaved()
    setTimeout(() => setSuccess(false), 2000)
  }

  const accentColor = type === 'income' ? '#10b981' : '#6366f1'

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#fff',
    outline: 'none',
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

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={labelStyle}>Belopp (kr)</label>
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0"
          required
          style={{ ...inputStyle, fontSize: 26, fontWeight: 700, color: accentColor, padding: '12px 14px' }}
        />
      </div>

      <div>
        <label style={labelStyle}>Beskrivning</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={type === 'expense' ? 'T.ex. ICA, Spotify...' : 'T.ex. Lön, Vinted...'}
          required
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Kategori</label>
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={inputStyle}>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Datum</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={inputStyle} />
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 14px', backgroundColor: isRecurring ? '#f8fafc' : '#fff' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#0f172a' }}>
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={e => setIsRecurring(e.target.checked)}
            style={{ width: 16, height: 16, accentColor }}
          />
          Återkommande
        </label>
        {isRecurring && (
          <select value={interval} onChange={e => setInterval(e.target.value)} style={{ ...inputStyle, marginTop: 10 }}>
            {INTERVALS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
          </select>
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: success ? '#10b981' : accentColor,
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: saving ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
          opacity: saving ? 0.7 : 1,
        }}
      >
        {success ? '✓ Sparad!' : saving ? 'Sparar...' : type === 'expense' ? 'Spara utgift' : 'Spara intäkt'}
      </button>
    </form>
  )
}
