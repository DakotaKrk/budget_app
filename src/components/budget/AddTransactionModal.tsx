'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES } from '@/lib/categories'
import { todayISO } from '@/lib/utils'

type TxType = 'income' | 'expense'

interface Props {
  /** Renders the trigger as a full-width block (for the sidebar) */
  fullWidth?: boolean
}

const accentFor = (t: TxType) => (t === 'income' ? '#10b981' : '#6366f1')
const lightFor  = (t: TxType) => (t === 'income' ? '#ecfdf5'  : '#eef2ff')

export default function AddTransactionModal({ fullWidth = false }: Props) {
  const router = useRouter()
  const [open, setOpen]       = useState(false)
  const [type, setType]       = useState<TxType>('expense')
  const [amount, setAmount]   = useState('')
  const [title, setTitle]     = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate]       = useState(todayISO())
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const amountRef = useRef<HTMLInputElement>(null)

  const categories = CATEGORIES.filter(c => c.type === type)

  function handleOpen() {
    const defaultType: TxType = 'expense'
    const defaultCats = CATEGORIES.filter(c => c.type === defaultType)
    setType(defaultType)
    setAmount('')
    setTitle('')
    setCategory(defaultCats[0]?.name ?? '')
    setDate(todayISO())
    setError(null)
    setSuccess(false)
    setOpen(true)
  }

  function handleClose() {
    if (saving) return
    setOpen(false)
  }

  function handleTypeChange(t: TxType) {
    setType(t)
    setCategory(CATEGORIES.filter(c => c.type === t)[0]?.name ?? '')
  }

  // Focus amount input when modal opens
  useEffect(() => {
    if (open) setTimeout(() => amountRef.current?.focus(), 50)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, saving])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = parseFloat(amount.replace(',', '.'))
    if (isNaN(num) || num <= 0) { setError('Ange ett giltigt belopp'); return }
    if (!title.trim())           { setError('Ange en beskrivning'); return }

    setSaving(true)
    setError(null)

    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: num,
        description: title.trim(),
        category: category || (type === 'income' ? 'Övrigt inkomst' : 'Övrigt utgift'),
        type,
        date,
      }),
    })

    setSaving(false)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Något gick fel, försök igen')
      return
    }

    setSuccess(true)
    // Let the success flash show briefly, then close and refresh
    setTimeout(() => {
      setOpen(false)
      router.refresh()
    }, 700)
  }

  const accent = accentFor(type)
  const light  = lightFor(type)

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

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: fullWidth ? 'center' : undefined,
          gap: 6,
          width: fullWidth ? '100%' : undefined,
          backgroundColor: '#6366f1',
          color: '#fff',
          border: 'none',
          borderRadius: 9,
          padding: fullWidth ? '10px 16px' : '9px 16px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: '-0.1px',
          boxShadow: '0 1px 3px rgba(99,102,241,0.3)',
          transition: 'opacity 0.15s',
        }}
      >
        <span style={{ fontSize: 17, lineHeight: 1, marginTop: -1 }}>+</span>
        {fullWidth ? 'Ny transaktion' : 'Lägg till'}
      </button>

      {/* Backdrop + modal */}
      {open && (
        <div
          onClick={handleClose}
          className={[
            'fixed inset-0 z-[1000]',
            'flex flex-col justify-end sm:items-center sm:justify-center sm:p-4',
            'bg-black/45',
          ].join(' ')}
          style={{ backdropFilter: 'blur(2px)' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full sm:max-w-[460px] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
            style={{
              backgroundColor: '#fff',
              maxHeight: '92dvh',
              boxShadow: '0 -4px 40px rgba(15,23,42,0.18)',
            }}
          >
            {/* Drag handle indicator — mobile only */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0' }} />
            </div>
            {/* Header strip — changes color with type */}
            <div
              style={{
                backgroundColor: accent,
                padding: '18px 24px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#fff' }}>
                Ny transaktion
              </h2>
              <button
                onClick={handleClose}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: 6,
                  color: '#fff',
                  width: 28,
                  height: 28,
                  fontSize: 18,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px 24px' }}>

              {/* Type toggle */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 6,
                  marginBottom: 18,
                  backgroundColor: '#f1f5f9',
                  borderRadius: 10,
                  padding: 4,
                }}
              >
                {(['expense', 'income'] as TxType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTypeChange(t)}
                    style={{
                      padding: '8px 0',
                      borderRadius: 7,
                      border: 'none',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      backgroundColor: type === t ? accentFor(t) : 'transparent',
                      color: type === t ? '#fff' : '#64748b',
                      boxShadow: type === t ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                    }}
                  >
                    {t === 'expense' ? '💸 Utgift' : '💰 Inkomst'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Amount */}
                <div>
                  <label style={labelStyle}>Belopp (kr)</label>
                  <input
                    ref={amountRef}
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                    required
                    style={{
                      ...inputStyle,
                      fontSize: 30,
                      fontWeight: 700,
                      color: accent,
                      padding: '12px 14px',
                      borderColor: amount ? accent + '66' : '#e2e8f0',
                    }}
                  />
                </div>

                {/* Title */}
                <div>
                  <label style={labelStyle}>Beskrivning</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={type === 'expense' ? 'T.ex. ICA, Spotify...' : 'T.ex. Lön, Vinted...'}
                    required
                    style={inputStyle}
                  />
                </div>

                {/* Category */}
                <div>
                  <label style={labelStyle}>Kategori</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    style={{
                      ...inputStyle,
                      backgroundColor: light,
                      borderColor: accent + '44',
                    }}
                  >
                    {categories.map(c => (
                      <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label style={labelStyle}>Datum</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                {/* Error */}
                {error && (
                  <p style={{
                    margin: 0,
                    fontSize: 13,
                    color: '#ef4444',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 7,
                    padding: '8px 12px',
                  }}>
                    {error}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={saving || success}
                  style={{
                    marginTop: 2,
                    width: '100%',
                    padding: '13px',
                    backgroundColor: success ? '#10b981' : accent,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 9,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: saving || success ? 'default' : 'pointer',
                    transition: 'background-color 0.2s',
                    opacity: saving ? 0.75 : 1,
                  }}
                >
                  {success ? '✓ Sparad!' : saving ? 'Sparar…' : type === 'expense' ? 'Spara utgift' : 'Spara inkomst'}
                </button>

              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
