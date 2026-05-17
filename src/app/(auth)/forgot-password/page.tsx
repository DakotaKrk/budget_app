'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const redirectTo = `${origin}/auth/callback?next=/reset-password`

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '11px 14px',
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#fff',
    outline: 'none',
  }

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <span style={{ fontSize: 32 }}>💜</span>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginTop: 8, letterSpacing: '-0.5px' }}>
          Budget
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Återställ ditt lösenord</p>
      </div>

      {/* Card */}
      <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 32 }}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <span style={{ fontSize: 40 }}>📬</span>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginTop: 12 }}>
              Kolla din e-post!
            </p>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 6, lineHeight: 1.6 }}>
              Vi har skickat en återställningslänk till <strong>{email}</strong>. Klicka på länken i mailet för att välja ett nytt lösenord.
            </p>
            <Link
              href="/login"
              style={{
                display: 'inline-block',
                marginTop: 20,
                fontSize: 14,
                color: '#6366f1',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Tillbaka till inloggning
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4, lineHeight: 1.6 }}>
              Ange din e-postadress så skickar vi en länk för att återställa ditt lösenord.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                E-post
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="din@email.com"
                required
                autoComplete="email"
                style={inputStyle}
              />
            </div>

            {error && (
              <p style={{ fontSize: 13, color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading ? '#818cf8' : '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 4,
              }}
            >
              {loading ? 'Skickar...' : 'Skicka återställningslänk'}
            </button>
          </form>
        )}
      </div>

      {!done && (
        <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 20 }}>
          Kom du ihåg det?{' '}
          <Link href="/login" style={{ color: '#6366f1', fontWeight: 500, textDecoration: 'none' }}>
            Logga in
          </Link>
        </p>
      )}
    </div>
  )
}
