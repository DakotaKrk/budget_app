'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { formatAmount } from '@/lib/utils'

interface LoanPayment {
  id: string
  loan_id: string
  amount: number
  note: string | null
  paid_at: string
}

interface Loan {
  id: string
  name: string
  total_amount: number
  note: string | null
  created_at: string
  loan_payments: LoanPayment[]
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1.5px solid #e2e8f0',
  fontSize: 14,
  outline: 'none',
  backgroundColor: '#f8fafc',
  boxSizing: 'border-box',
}

const card: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  padding: 24,
}

export default function LoanClient() {
  const [loans, setLoans]           = useState<Loan[]>([])
  const [loading, setLoading]       = useState(true)
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [confirmId, setConfirmId]   = useState<string | null>(null)
  const [confirmPay, setConfirmPay] = useState<{ loanId: string; pid: string } | null>(null)

  // Add-loan form state
  const [showAddLoan, setShowAddLoan]   = useState(false)
  const [loanName, setLoanName]         = useState('')
  const [loanAmount, setLoanAmount]     = useState('')
  const [loanNote, setLoanNote]         = useState('')
  const [addingLoan, setAddingLoan]     = useState(false)
  const [addLoanErr, setAddLoanErr]     = useState('')

  // Add-payment form state  (keyed per loan)
  const [payLoanId, setPayLoanId]     = useState<string | null>(null)
  const [payAmount, setPayAmount]     = useState('')
  const [payNote, setPayNote]         = useState('')
  const [payDate, setPayDate]         = useState(new Date().toISOString().split('T')[0])
  const [addingPay, setAddingPay]     = useState(false)
  const [addPayErr, setAddPayErr]     = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/loans')
    const data = await res.json().catch(() => [])
    setLoans(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function paidAmount(loan: Loan) {
    return loan.loan_payments.reduce((s, p) => s + Number(p.amount), 0)
  }

  function remaining(loan: Loan) {
    return Math.max(0, Number(loan.total_amount) - paidAmount(loan))
  }

  function progress(loan: Loan) {
    const total = Number(loan.total_amount)
    if (total <= 0) return 0
    return Math.min(100, (paidAmount(loan) / total) * 100)
  }

  async function handleAddLoan(e: React.FormEvent) {
    e.preventDefault()
    setAddLoanErr('')
    const num = Number(loanAmount.replace(',', '.'))
    if (!loanName.trim()) { setAddLoanErr('Ange ett namn'); return }
    if (isNaN(num) || num <= 0) { setAddLoanErr('Ange ett giltigt belopp'); return }
    setAddingLoan(true)
    const res = await fetch('/api/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: loanName.trim(), totalAmount: num, note: loanNote }),
    })
    setAddingLoan(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setAddLoanErr(d.error ?? 'Något gick fel')
      return
    }
    setLoanName('')
    setLoanAmount('')
    setLoanNote('')
    setShowAddLoan(false)
    load()
  }

  async function handleDeleteLoan(id: string) {
    if (confirmId === id) {
      await fetch(`/api/loans/${id}`, { method: 'DELETE' })
      setConfirmId(null)
      load()
    } else {
      setConfirmId(id)
      setTimeout(() => setConfirmId(null), 3000)
    }
  }

  function openPayForm(loanId: string) {
    setPayLoanId(loanId)
    setPayAmount('')
    setPayNote('')
    setPayDate(new Date().toISOString().split('T')[0])
    setAddPayErr('')
    setExpanded(loanId)
  }

  async function handleAddPayment(e: React.FormEvent, loanId: string) {
    e.preventDefault()
    setAddPayErr('')
    const num = Number(payAmount.replace(',', '.'))
    if (isNaN(num) || num <= 0) { setAddPayErr('Ange ett giltigt belopp'); return }
    setAddingPay(true)
    const res = await fetch(`/api/loans/${loanId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: num, note: payNote, paidAt: payDate }),
    })
    setAddingPay(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setAddPayErr(d.error ?? 'Något gick fel')
      return
    }
    setPayLoanId(null)
    load()
  }

  async function handleDeletePayment(loanId: string, pid: string) {
    const key = `${loanId}:${pid}`
    if (confirmPay && `${confirmPay.loanId}:${confirmPay.pid}` === key) {
      await fetch(`/api/loans/${loanId}/payments/${pid}`, { method: 'DELETE' })
      setConfirmPay(null)
      load()
    } else {
      setConfirmPay({ loanId, pid })
      setTimeout(() => setConfirmPay(null), 3000)
    }
  }

  const totalRemaining = loans.reduce((s, l) => s + remaining(l), 0)
  const totalLoaned    = loans.reduce((s, l) => s + Number(l.total_amount), 0)
  const totalPaid      = loans.reduce((s, l) => s + paidAmount(l), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Summary cards */}
      {!loading && loans.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div style={card}>
            <p style={{ fontSize: 11, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Totalt lånat
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{formatAmount(totalLoaned)}</p>
          </div>
          <div style={card}>
            <p style={{ fontSize: 11, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Totalt betalt
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#10b981' }}>{formatAmount(totalPaid)}</p>
          </div>
          <div style={card}>
            <p style={{ fontSize: 11, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Återstår att betala
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#ef4444' }}>{formatAmount(totalRemaining)}</p>
          </div>
        </div>
      )}

      {/* Add loan button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddLoan(v => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 8,
            backgroundColor: '#6366f1',
            color: '#fff',
            border: 'none',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Plus size={15} />
          Lägg till lån
        </button>
      </div>

      {/* Add loan form */}
      {showAddLoan && (
        <div style={{ ...card, border: '2px solid #6366f1' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 16 }}>Nytt lån</p>
          <form onSubmit={handleAddLoan} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>
                Namn på lånet *
              </label>
              <input
                value={loanName}
                onChange={e => setLoanName(e.target.value)}
                placeholder="t.ex. Privatlån Johanna, Billån"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>
                Totalt lånebelopp (kr) *
              </label>
              <input
                type="number"
                value={loanAmount}
                onChange={e => setLoanAmount(e.target.value)}
                placeholder="50 000"
                required
                min="1"
                step="any"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>
                Anteckning (valfritt)
              </label>
              <input
                value={loanNote}
                onChange={e => setLoanNote(e.target.value)}
                placeholder="t.ex. räntesats, startdatum..."
                style={inputStyle}
              />
            </div>
            {addLoanErr && (
              <p style={{ fontSize: 12, color: '#ef4444' }}>{addLoanErr}</p>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowAddLoan(false)}
                style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#64748b', fontWeight: 500 }}
              >
                Avbryt
              </button>
              <button
                type="submit"
                disabled={addingLoan}
                style={{ padding: '8px 16px', borderRadius: 8, backgroundColor: '#6366f1', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                {addingLoan ? 'Sparar…' : 'Spara lån'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ ...card, textAlign: 'center', padding: 40 }}>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Laddar…</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && loans.length === 0 && (
        <div style={{ ...card, textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ fontSize: 32, marginBottom: 10 }}>🏦</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>Inga lån registrerade</p>
          <p style={{ fontSize: 13, color: '#64748b' }}>
            Klicka på "Lägg till lån" ovan för att börja spåra dina lån.
          </p>
        </div>
      )}

      {/* Loan cards */}
      {!loading && loans.map(loan => {
        const paid      = paidAmount(loan)
        const rem       = remaining(loan)
        const pct       = progress(loan)
        const isDone    = rem === 0
        const isOpen    = expanded === loan.id
        const payments  = [...loan.loan_payments].sort(
          (a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()
        )

        return (
          <div key={loan.id} style={{ ...card, padding: 0, overflow: 'hidden' }}>
            {/* Loan header */}
            <div style={{ padding: '20px 24px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{isDone ? '✅' : '🏦'}</span>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{loan.name}</p>
                    {isDone && (
                      <span style={{ fontSize: 11, fontWeight: 600, backgroundColor: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 99 }}>
                        Betald
                      </span>
                    )}
                  </div>
                  {loan.note && (
                    <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{loan.note}</p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <button
                    onClick={() => handleDeleteLoan(loan.id)}
                    title={confirmId === loan.id ? 'Klicka igen för att bekräfta' : 'Ta bort lån'}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 6,
                      borderRadius: 6,
                      color: confirmId === loan.id ? '#ef4444' : '#cbd5e1',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={() => setExpanded(isOpen ? null : loan.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: '#94a3b8' }}
                  >
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ height: 8, backgroundColor: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      backgroundColor: isDone ? '#10b981' : '#6366f1',
                      borderRadius: 99,
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                  {Math.round(pct)}% betald
                </p>
              </div>

              {/* Amount stats */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Totalt</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{formatAmount(loan.total_amount)}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Betalt</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>{formatAmount(paid)}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Återstår</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: rem > 0 ? '#ef4444' : '#10b981' }}>{formatAmount(rem)}</p>
                </div>
              </div>

              {/* Pay button */}
              {!isDone && (
                <button
                  onClick={() => openPayForm(loan.id)}
                  style={{
                    marginTop: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 14px',
                    borderRadius: 8,
                    backgroundColor: '#f0fdf4',
                    color: '#16a34a',
                    border: '1.5px solid #bbf7d0',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                  Registrera betalning
                </button>
              )}
            </div>

            {/* Expanded: add payment form + payment history */}
            {isOpen && (
              <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px 24px 20px' }}>

                {/* Payment form */}
                {payLoanId === loan.id && (
                  <form
                    onSubmit={e => handleAddPayment(e, loan.id)}
                    style={{ backgroundColor: '#f0fdf4', borderRadius: 10, padding: 16, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}
                  >
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#16a34a', marginBottom: 2 }}>Ny betalning</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label style={{ fontSize: 12, color: '#374151', display: 'block', marginBottom: 3 }}>Belopp (kr) *</label>
                        <input
                          type="number"
                          value={payAmount}
                          onChange={e => setPayAmount(e.target.value)}
                          placeholder="1 000"
                          required
                          min="1"
                          step="any"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: '#374151', display: 'block', marginBottom: 3 }}>Datum</label>
                        <input
                          type="date"
                          value={payDate}
                          onChange={e => setPayDate(e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#374151', display: 'block', marginBottom: 3 }}>Anteckning (valfritt)</label>
                      <input
                        value={payNote}
                        onChange={e => setPayNote(e.target.value)}
                        placeholder="t.ex. avi nr 3"
                        style={inputStyle}
                      />
                    </div>
                    {addPayErr && <p style={{ fontSize: 12, color: '#ef4444' }}>{addPayErr}</p>}
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setPayLoanId(null)}
                        style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#64748b' }}
                      >
                        Avbryt
                      </button>
                      <button
                        type="submit"
                        disabled={addingPay}
                        style={{ padding: '7px 14px', borderRadius: 8, backgroundColor: '#16a34a', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                      >
                        {addingPay ? 'Sparar…' : 'Spara'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Payment history */}
                <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 10 }}>
                  Betalningshistorik ({payments.length})
                </p>

                {payments.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#94a3b8' }}>Inga betalningar registrerade än.</p>
                ) : (
                  <div>
                    {payments.map((p, i) => {
                      const isConfirm = confirmPay?.loanId === loan.id && confirmPay?.pid === p.id
                      return (
                        <div
                          key={p.id}
                          className="flex items-center gap-3 py-2"
                          style={{ borderBottom: i < payments.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: '#dcfce7', fontSize: 14 }}
                          >
                            💸
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>
                              {p.note || 'Betalning'}
                            </p>
                            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{p.paid_at}</p>
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#10b981', minWidth: 72, textAlign: 'right' }}>
                            -{formatAmount(p.amount)}
                          </span>
                          <button
                            onClick={() => handleDeletePayment(loan.id, p.id)}
                            title={isConfirm ? 'Klicka igen för att bekräfta' : 'Ta bort betalning'}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 4,
                              borderRadius: 6,
                              color: isConfirm ? '#ef4444' : '#cbd5e1',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
