'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'choose' | 'create' | 'join'

export default function OnboardingPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('choose')
  const [householdName, setHouseholdName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function debugAuthState(label: string) {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const { data: { user } } = await supabase.auth.getUser()
    console.log(`[onboarding:${label}] client auth state`, {
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      tokenPreview: session?.access_token?.slice(0, 20) ?? null,
      userId: user?.id ?? null,
      userEmail: user?.email ?? null,
      expiresAt: session?.expires_at ?? null,
    })
    return { session, user }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!householdName.trim()) return
    setLoading(true)

    const { session, user } = await debugAuthState('handleCreate')

    if (!session || !user) {
      console.error('[onboarding] No active session – cannot create household')
      setError('Du är inte inloggad. Logga in igen och försök.')
      setLoading(false)
      return
    }

    console.log('[onboarding] POSTing /api/households …')
    const res = await fetch('/api/households', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: householdName.trim() }),
    })

    let data: { error?: string } = {}
    try {
      data = await res.json()
    } catch {
      console.error('[onboarding] Failed to parse response JSON – status:', res.status)
    }

    console.log('[onboarding] /api/households response:', { status: res.status, data })
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Något gick fel')
      return
    }

    router.push('/')
    router.refresh()
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!inviteCode.trim()) return
    setLoading(true)

    await debugAuthState('handleJoin')

    console.log('[onboarding] POSTing /api/households/join …')
    const res = await fetch('/api/households/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode: inviteCode.trim() }),
    })

    let data: { error?: string } = {}
    try {
      data = await res.json()
    } catch {
      console.error('[onboarding] Failed to parse response JSON – status:', res.status)
    }

    console.log('[onboarding] /api/households/join response:', { status: res.status, data })
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Ogiltig inbjudningskod')
      return
    }

    router.push('/')
    router.refresh()
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

  const btnPrimary: React.CSSProperties = {
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
  }

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <span style={{ fontSize: 32 }}>🏠</span>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginTop: 8, letterSpacing: '-0.5px' }}>
          Välkommen till Budget!
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
          Skapa ett hushåll eller gå med i ett befintligt
        </p>
      </div>

      {/* Card */}
      <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 32 }}>

        {/* Choose mode */}
        {mode === 'choose' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={() => setMode('create')}
              style={{
                padding: '16px 20px',
                border: '2px solid #e2e8f0',
                borderRadius: 12,
                background: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#6366f1')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
                🏡 Skapa ett nytt hushåll
              </p>
              <p style={{ fontSize: 13, color: '#64748b' }}>
                Sätt upp ett hushåll och bjud in din partner
              </p>
            </button>

            <button
              onClick={() => setMode('join')}
              style={{
                padding: '16px 20px',
                border: '2px solid #e2e8f0',
                borderRadius: 12,
                background: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#6366f1')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
                🔑 Gå med i ett befintligt hushåll
              </p>
              <p style={{ fontSize: 13, color: '#64748b' }}>
                Ange en inbjudningskod från din partner
              </p>
            </button>
          </div>
        )}

        {/* Create household */}
        {mode === 'create' && (
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <button
              type="button"
              onClick={() => { setMode('choose'); setError('') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 13, textAlign: 'left', padding: 0, marginBottom: 4 }}
            >
              ← Tillbaka
            </button>

            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>Skapa hushåll</p>
              <p style={{ fontSize: 13, color: '#64748b' }}>Du blir automatiskt ägare och kan bjuda in din partner efteråt.</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Hushållets namn
              </label>
              <input
                type="text"
                value={householdName}
                onChange={e => setHouseholdName(e.target.value)}
                placeholder="T.ex. Vår lägenhet"
                required
                autoFocus
                style={inputStyle}
              />
            </div>

            {error && (
              <p style={{ fontSize: 13, color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px' }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} style={btnPrimary}>
              {loading ? 'Skapar...' : 'Skapa hushåll'}
            </button>
          </form>
        )}

        {/* Join household */}
        {mode === 'join' && (
          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <button
              type="button"
              onClick={() => { setMode('choose'); setError('') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 13, textAlign: 'left', padding: 0, marginBottom: 4 }}
            >
              ← Tillbaka
            </button>

            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>Gå med i hushåll</p>
              <p style={{ fontSize: 13, color: '#64748b' }}>Be din partner dela sin 8-siffriga inbjudningskod.</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Inbjudningskod
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                placeholder="T.ex. A1B2C3D4"
                required
                autoFocus
                maxLength={8}
                style={{ ...inputStyle, letterSpacing: '0.15em', fontFamily: 'monospace', fontSize: 16, textTransform: 'uppercase' }}
              />
            </div>

            {error && (
              <p style={{ fontSize: 13, color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px' }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} style={btnPrimary}>
              {loading ? 'Ansluter...' : 'Gå med'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
