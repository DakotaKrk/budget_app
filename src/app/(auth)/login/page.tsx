'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
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
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>Logga in på ditt konto</p>
      </div>

      {/* Card */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(16px)',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.1)',
        padding: 32,
        boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
      }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
                Lösenord
              </label>
              <Link href="/forgot-password" style={{ fontSize: 12, color: '#a5b4fc', textDecoration: 'none' }}>
                Glömt lösenordet?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
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
            {loading ? 'Loggar in...' : 'Logga in'}
          </button>
        </form>
      </div>

      {/* Link to signup */}
      <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 20 }}>
        Har du inget konto?{' '}
        <Link href="/signup" style={{ color: '#a5b4fc', fontWeight: 500, textDecoration: 'none' }}>
          Skapa ett
        </Link>
      </p>
    </div>
  )
}
