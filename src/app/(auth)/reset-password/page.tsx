'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionError, setSessionError] = useState(false)

  useEffect(() => {
    // Verify that we actually have an active recovery session before showing the form.
    // The session was established by /auth/callback before redirecting here.
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true)
      } else {
        setSessionError(true)
      }
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Lösenorden matchar inte.')
      return
    }
    if (password.length < 8) {
      setError('Lösenordet måste vara minst 8 tecken.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(
        error.message.toLowerCase().includes('same password')
          ? 'Det nya lösenordet kan inte vara samma som det gamla.'
          : error.message,
      )
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)

    // Give the user a moment to read the success message, then go to the app.
    setTimeout(() => {
      router.push('/')
      router.refresh()
    }, 2500)
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

  const darkCard: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(16px)',
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.1)',
    padding: 32,
    boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
  }

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <span style={{ fontSize: 32 }}>💜</span>
        <h1 style={{
          fontSize: 26, fontWeight: 800, marginTop: 8, letterSpacing: '-0.5px',
          fontFamily: 'var(--font-space-grotesk)', color: '#c4b5fd',
        }}>Mony</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>Välj nytt lösenord</p>
      </div>

      <div style={darkCard}>
        {sessionError && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <span style={{ fontSize: 40 }}>⚠️</span>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', marginTop: 12 }}>Länken har gått ut</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6, lineHeight: 1.6 }}>
              Återställningslänken är ogiltig eller har gått ut. Begär en ny länk.
            </p>
            <Link href="/forgot-password" style={{ display: 'inline-block', marginTop: 20, fontSize: 14, color: '#a5b4fc', fontWeight: 500, textDecoration: 'none' }}>
              Begär ny länk
            </Link>
          </div>
        )}

        {done && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <span style={{ fontSize: 40 }}>✅</span>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', marginTop: 12 }}>Lösenordet uppdaterat!</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6, lineHeight: 1.6 }}>
              Ditt lösenord har ändrats. Du loggas in automatiskt...
            </p>
          </div>
        )}

        {!sessionReady && !sessionError && !done && (
          <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.45)', padding: '16px 0' }}>
            Kontrollerar länk...
          </p>
        )}

        {sessionReady && !done && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Nytt lösenord</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minst 8 tecken" required minLength={8} autoComplete="new-password" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Bekräfta nytt lösenord</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required minLength={8} autoComplete="new-password" style={inputStyle} />
            </div>
            {error && <p style={{ fontSize: 13, color: '#fca5a5', backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 12px' }}>{error}</p>}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px',
              background: loading ? 'rgba(99,102,241,0.6)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: loading ? 'none' : '0 0 24px rgba(99,102,241,0.4)',
              color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4,
            }}>
              {loading ? 'Sparar...' : 'Spara nytt lösenord'}
            </button>
          </form>
        )}
      </div>

      {sessionReady && !done && (
        <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 20 }}>
          <Link href="/login" style={{ color: '#a5b4fc', fontWeight: 500, textDecoration: 'none' }}>Tillbaka till inloggning</Link>
        </p>
      )}
    </div>
  )
}
