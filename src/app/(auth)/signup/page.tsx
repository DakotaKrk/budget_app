'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({ email, password })

    console.log('[signup] result:', {
      userId: data.user?.id ?? null,
      hasSession: !!data.session,
      emailConfirmedAt: data.user?.email_confirmed_at ?? null,
      error: error?.message ?? null,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // When "Email confirm" is DISABLED in Supabase, signUp() returns a full
    // session immediately. Redirect to the app so the session cookies are used.
    if (data.session) {
      console.log('[signup] session returned — redirecting to app')
      router.push('/')
      router.refresh()
      return
    }

    // Email confirmation required — session is null until the user clicks the link.
    setDone(true)
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    padding: '11px 14px',
    fontSize: 14,
    color: '#f1f5f9',
    backgroundColor: 'rgba(255,255,255,0.06)',
    outline: 'none',
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(16px)',
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.1)',
    padding: 32,
    boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
  }

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <span style={{ fontSize: 32 }}>💜</span>
        <h1 style={{
          fontSize: 26, fontWeight: 800, marginTop: 8, letterSpacing: '-0.5px',
          fontFamily: 'var(--font-space-grotesk)',
          color: '#c4b5fd',
        }}>
          Mony
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>Skapa ett konto</p>
      </div>

      {/* Card */}
      <div style={cardStyle}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <span style={{ fontSize: 40 }}>📬</span>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', marginTop: 12 }}>
              Bekräftelsemail skickat!
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
              Kontrollera din inkorg och klicka på länken för att aktivera ditt konto.
            </p>
            <Link
              href="/login"
              style={{ display: 'inline-block', marginTop: 20, fontSize: 14, color: '#a5b4fc', fontWeight: 500, textDecoration: 'none' }}
            >
              Tillbaka till inloggning
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
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

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
                Lösenord
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minst 6 tecken"
                required
                minLength={6}
                autoComplete="new-password"
                style={inputStyle}
              />
            </div>

            {error && (
              <p style={{ fontSize: 13, color: '#fca5a5', backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 12px' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? 'rgba(99,102,241,0.6)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: loading ? 'none' : '0 0 24px rgba(99,102,241,0.4)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 4,
              }}
            >
              {loading ? 'Skapar konto...' : 'Skapa konto'}
            </button>
          </form>
        )}
      </div>

      {!done && (
        <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 20 }}>
          Har du redan ett konto?{' '}
          <Link href="/login" style={{ color: '#a5b4fc', fontWeight: 500, textDecoration: 'none' }}>
            Logga in
          </Link>
        </p>
      )}
    </div>
  )
}
