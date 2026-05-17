'use client'

import { useState } from 'react'

export default function FeedbackCard() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message.trim() }),
    })

    setLoading(false)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Något gick fel, försök igen')
      return
    }

    setDone(true)
    setMessage('')
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      borderRadius: 14,
      padding: '28px 28px 24px',
      color: '#fff',
    }}>
      {done ? (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <p style={{ fontSize: 32, marginBottom: 10 }}>🙏</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
            Tack för din feedback!
          </p>
          <p style={{ fontSize: 13, color: '#a5b4fc', lineHeight: 1.6 }}>
            Vi läser varje förslag och jobbar på att göra Mony bättre.
          </p>
          <button
            onClick={() => setDone(false)}
            style={{
              marginTop: 16, background: 'none', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 8, color: '#a5b4fc', fontSize: 12, padding: '6px 14px', cursor: 'pointer',
            }}
          >
            Skicka ett till
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              💜 Hjälp oss göra Mony bättre
            </p>
            <p style={{ fontSize: 13, color: '#a5b4fc', lineHeight: 1.5 }}>
              Vad önskar du se härnäst? Alla förslag läses och värderas.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="T.ex. &quot;Jag saknar möjlighet att sätta ett sparmål...&quot;"
              rows={3}
              maxLength={1000}
              style={{
                width: '100%',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 14,
                color: '#fff',
                backgroundColor: 'rgba(255,255,255,0.1)',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                lineHeight: 1.5,
              }}
            />

            {error && (
              <p style={{ fontSize: 13, color: '#fca5a5', margin: 0 }}>{error}</p>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                {message.length}/1000
              </span>
              <button
                type="submit"
                disabled={loading || !message.trim()}
                style={{
                  padding: '9px 22px',
                  backgroundColor: loading || !message.trim() ? 'rgba(255,255,255,0.2)' : '#fff',
                  color: loading || !message.trim() ? 'rgba(255,255,255,0.5)' : '#1e1b4b',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: loading || !message.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {loading ? 'Skickar...' : 'Skicka feedback'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}
