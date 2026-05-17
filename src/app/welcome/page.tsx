'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

/* ─── Starfield ──────────────────────────────────────────────────────────── */
function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    interface Star {
      x: number; y: number; r: number
      alpha: number; deltaAlpha: number; speed: number
    }

    const stars: Star[] = []

    function resize() {
      if (!canvas) return
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }

    function init() {
      if (!canvas) return
      stars.length = 0
      const count = Math.floor((canvas.width * canvas.height) / 3800)
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.4 + 0.2,
          alpha: Math.random(),
          deltaAlpha: (Math.random() * 0.004 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
          speed: Math.random() * 0.07 + 0.01,
        })
      }
    }

    function draw() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const s of stars) {
        s.y -= s.speed
        if (s.y < -2) s.y = canvas.height + 2
        s.alpha += s.deltaAlpha
        if (s.alpha > 1)    { s.alpha = 1;    s.deltaAlpha = -Math.abs(s.deltaAlpha) }
        if (s.alpha < 0.05) { s.alpha = 0.05; s.deltaAlpha =  Math.abs(s.deltaAlpha) }
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`
        ctx.fill()
      }

      // Nebula glow — left
      const g1 = ctx.createRadialGradient(
        canvas.width * 0.18, canvas.height * 0.35, 0,
        canvas.width * 0.18, canvas.height * 0.35, canvas.width * 0.38,
      )
      g1.addColorStop(0, 'rgba(99,102,241,0.09)')
      g1.addColorStop(1, 'transparent')
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Nebula glow — right
      const g2 = ctx.createRadialGradient(
        canvas.width * 0.84, canvas.height * 0.6, 0,
        canvas.width * 0.84, canvas.height * 0.6, canvas.width * 0.32,
      )
      g2.addColorStop(0, 'rgba(139,92,246,0.09)')
      g2.addColorStop(1, 'transparent')
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      animId = requestAnimationFrame(draw)
    }

    resize(); init(); draw()

    const onResize = () => { resize(); init() }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    />
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function WelcomePage() {
  const pills = [
    'Gratis att använda',
    'Eget eller gemensamt hushåll',
    'Inga dolda avgifter',
    'Du äger alltid din data',
    'Avsluta när du vill',
  ]

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#05050f',
      color: '#fff',
      overflowX: 'hidden',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Starfield />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* ── Nav ── */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(5,5,15,0.55)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 20 }}>💜</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#e0e7ff', letterSpacing: '-0.4px' }}>Mony</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/login" style={{
              padding: '9px 18px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.75)',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.12)',
              backgroundColor: 'rgba(255,255,255,0.05)',
            }}>
              Logga in
            </Link>
            <Link href="/signup" style={{
              padding: '9px 20px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 0 18px rgba(99,102,241,0.4)',
            }}>
              Kom igång
            </Link>
          </div>
        </nav>

        {/* ── Hero — centred, takes all remaining space ── */}
        <section style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '60px 24px 80px',
          gap: 0,
        }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            border: '1px solid rgba(99,102,241,0.4)',
            backgroundColor: 'rgba(99,102,241,0.1)',
            borderRadius: 100,
            padding: '6px 16px',
            marginBottom: 32,
            backdropFilter: 'blur(8px)',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              backgroundColor: '#818cf8',
              boxShadow: '0 0 7px #818cf8',
              display: 'inline-block',
              animation: 'blink 2s infinite',
            }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#a5b4fc', letterSpacing: '0.4px' }}>
              Din smarta budgetapp
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(38px, 8vw, 80px)',
            fontWeight: 900,
            letterSpacing: 'clamp(-1.5px, -0.03em, -3px)',
            lineHeight: 1.04,
            maxWidth: 720,
            margin: '0 auto 28px',
            background: 'linear-gradient(140deg, #ffffff 20%, #c4b5fd 60%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Ta kontroll över din ekonomi. Idag.
          </h1>

          {/* Subline */}
          <p style={{
            fontSize: 'clamp(15px, 2.2vw, 19px)',
            color: 'rgba(255,255,255,0.45)',
            maxWidth: 440,
            lineHeight: 1.7,
            margin: '0 auto 48px',
          }}>
            Mony hjälper dig följa inkomster, utgifter och lån — och fatta smarta beslut varje månad.
          </p>

          {/* CTA buttons */}
          <div style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: 52,
          }}>
            <Link href="/signup" style={{
              padding: '14px 34px',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              color: '#fff',
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 0 36px rgba(99,102,241,0.5), 0 2px 8px rgba(0,0,0,0.3)',
            }}>
              Skapa konto gratis →
            </Link>
            <Link href="/login" style={{
              padding: '14px 34px',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              backgroundColor: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              Logga in
            </Link>
          </div>

          {/* Trust pills */}
          <div style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: 560,
          }}>
            {pills.map(p => (
              <span key={p} style={{
                fontSize: 12,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.38)',
                padding: '5px 13px',
                borderRadius: 100,
                border: '1px solid rgba(255,255,255,0.09)',
                backgroundColor: 'rgba(255,255,255,0.03)',
                whiteSpace: 'nowrap',
              }}>
                ✓ {p}
              </span>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{
          textAlign: 'center',
          padding: '18px 24px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          fontSize: 12,
          color: 'rgba(255,255,255,0.2)',
        }}>
          💜 Mony — Koll på kassan, varje dag
        </footer>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.25; }
        }
      `}</style>
    </div>
  )
}
