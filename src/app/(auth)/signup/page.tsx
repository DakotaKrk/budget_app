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
          Mony
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Skapa ett konto</p>
      </div>

      {/* Card */}
      <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 32 }}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <span style={{ fontSize: 40 }}>📬</span>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginTop: 12 }}>
              Bekräftelsemail skickat!
            </p>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
              Kontrollera din inkorg och klicka på länken för att aktivera ditt konto.
            </p>
            <Link
              href="/login"
              style={{ display: 'inline-block', marginTop: 20, fontSize: 14, color: '#6366f1', fontWeight: 500, textDecoration: 'none' }}
            >
              Tillbaka till inloggning
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
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
              {loading ? 'Skapar konto...' : 'Skapa konto'}
            </button>
          </form>
        )}
      </div>

      {!done && (
        <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 20 }}>
          Har du redan ett konto?{' '}
          <Link href="/login" style={{ color: '#6366f1', fontWeight: 500, textDecoration: 'none' }}>
            Logga in
          </Link>
        </p>
      )}
    </div>
  )
}
