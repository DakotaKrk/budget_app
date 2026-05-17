'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import {
  BarChart2, RefreshCw, Shield, Users, TrendingUp, Landmark,
} from 'lucide-react'

/* ─── Starfield canvas ─────────────────────────────────────────────────── */
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
      alpha: number; deltaAlpha: number
      speed: number
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
      const count = Math.floor((canvas.width * canvas.height) / 4000)
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.4 + 0.2,
          alpha: Math.random(),
          deltaAlpha: (Math.random() * 0.004 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
          speed: Math.random() * 0.08 + 0.01,
        })
      }
    }

    function draw() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const s of stars) {
        // Drift upward very slowly
        s.y -= s.speed
        if (s.y < -2) s.y = canvas.height + 2

        // Twinkle
        s.alpha += s.deltaAlpha
        if (s.alpha > 1) { s.alpha = 1; s.deltaAlpha = -Math.abs(s.deltaAlpha) }
        if (s.alpha < 0.05) { s.alpha = 0.05; s.deltaAlpha = Math.abs(s.deltaAlpha) }

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`
        ctx.fill()
      }

      // Subtle nebula blobs
      const g1 = ctx.createRadialGradient(
        canvas.width * 0.15, canvas.height * 0.3, 0,
        canvas.width * 0.15, canvas.height * 0.3, canvas.width * 0.35,
      )
      g1.addColorStop(0, 'rgba(99,102,241,0.07)')
      g1.addColorStop(1, 'transparent')
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const g2 = ctx.createRadialGradient(
        canvas.width * 0.82, canvas.height * 0.65, 0,
        canvas.width * 0.82, canvas.height * 0.65, canvas.width * 0.3,
      )
      g2.addColorStop(0, 'rgba(139,92,246,0.08)')
      g2.addColorStop(1, 'transparent')
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      animId = requestAnimationFrame(draw)
    }

    resize()
    init()
    draw()

    window.addEventListener('resize', () => { resize(); init() })
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', () => { resize(); init() })
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

/* ─── Feature card ─────────────────────────────────────────────────────── */
function FeatureCard({
  Icon, title, desc, accent,
}: {
  Icon: React.ElementType
  title: string
  desc: string
  accent: string
}) {
  return (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 16,
      padding: '24px 22px',
      backdropFilter: 'blur(8px)',
      transition: 'background 0.2s, border 0.2s',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        backgroundColor: accent + '22',
        border: `1px solid ${accent}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
      }}>
        <Icon size={18} color={accent} strokeWidth={2} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>{desc}</p>
    </div>
  )
}

/* ─── Page ─────────────────────────────────────────────────────────────── */
export default function WelcomePage() {
  const features = [
    { Icon: BarChart2,  accent: '#6366f1', title: 'Månadsöversikt',     desc: 'Se inkomster, utgifter och resultat för varje månad på ett ögonkast.' },
    { Icon: RefreshCw,  accent: '#8b5cf6', title: 'Återkommande',       desc: 'Markera fasta kostnader och se exakt vad som äter upp din budget.' },
    { Icon: Users,      accent: '#10b981', title: 'Gemensamt hushåll',  desc: 'Bjud in din partner och hantera ekonomin tillsammans.' },
    { Icon: TrendingUp, accent: '#f59e0b', title: 'Trender & jämförelse', desc: 'Jämför månader och se om du rör dig åt rätt håll.' },
    { Icon: Landmark,   accent: '#06b6d4', title: 'Lån & amortering',   desc: 'Spåra privatlån och se hur mycket som återstår att betala.' },
    { Icon: Shield,     accent: '#ec4899', title: 'Säkert & privat',    desc: 'Din data lagras säkert. Du äger alltid din ekonomiska information.' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#05050f',
      color: '#fff',
      fontFamily: 'inherit',
      overflowX: 'hidden',
      position: 'relative',
    }}>
      <Starfield />

      {/* Everything sits above the canvas */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Nav ── */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 32px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(5,5,15,0.6)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>💜</span>
            <span style={{ fontSize: 19, fontWeight: 800, color: '#e0e7ff', letterSpacing: '-0.5px' }}>Mony</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/login" style={{
              padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.12)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              transition: 'all 0.15s',
            }}>
              Logga in
            </Link>
            <Link href="/signup" style={{
              padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 700,
              color: '#fff', textDecoration: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 0 20px rgba(99,102,241,0.4)',
              transition: 'all 0.15s',
            }}>
              Kom igång
            </Link>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center',
          padding: 'clamp(72px, 12vw, 130px) 24px clamp(80px, 12vw, 140px)',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            border: '1px solid rgba(99,102,241,0.4)',
            backgroundColor: 'rgba(99,102,241,0.12)',
            borderRadius: 100, padding: '6px 16px', marginBottom: 36,
            backdropFilter: 'blur(8px)',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              backgroundColor: '#818cf8',
              boxShadow: '0 0 6px #818cf8',
              display: 'inline-block',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#a5b4fc', letterSpacing: '0.3px' }}>
              Din smarta budgetapp
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(36px, 7vw, 72px)',
            fontWeight: 900,
            letterSpacing: '-2px',
            lineHeight: 1.05,
            maxWidth: 800,
            margin: '0 auto 28px',
            background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 50%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Koll på pengarna.<br />Varje dag.
          </h1>

          {/* Sub */}
          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: 'rgba(255,255,255,0.5)',
            maxWidth: 500, lineHeight: 1.7, margin: '0 auto 48px',
          }}>
            Mony hjälper dig följa inkomster, utgifter och lån — och fatta smarta beslut varje månad.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 64 }}>
            <Link href="/signup" style={{
              padding: '15px 36px', borderRadius: 12, fontSize: 16, fontWeight: 700,
              color: '#fff', textDecoration: 'none',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 0 40px rgba(99,102,241,0.45), 0 2px 8px rgba(0,0,0,0.3)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}>
              Skapa konto gratis →
            </Link>
            <Link href="/login" style={{
              padding: '15px 36px', borderRadius: 12, fontSize: 16, fontWeight: 600,
              color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
              backgroundColor: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
            }}>
              Logga in
            </Link>
          </div>

          {/* Trust pills */}
          <div style={{
            display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center',
          }}>
            {[
              '✓ Gratis att använda',
              '✓ Eget eller gemensamt hushåll',
              '✓ Inga dolda avgifter',
            ].map(t => (
              <span key={t} style={{
                fontSize: 12, fontWeight: 500,
                color: 'rgba(255,255,255,0.45)',
                padding: '5px 14px', borderRadius: 100,
                border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: 'rgba(255,255,255,0.04)',
              }}>{t}</span>
            ))}
          </div>
        </section>

        {/* ── Divider glow ── */}
        <div style={{
          width: '60%', maxWidth: 500, margin: '0 auto',
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)',
        }} />

        {/* ── Features ── */}
        <section style={{ padding: 'clamp(64px, 10vw, 110px) 24px', maxWidth: 1020, margin: '0 auto' }}>
          <p style={{
            textAlign: 'center', fontSize: 12, fontWeight: 700,
            color: '#818cf8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 16,
          }}>
            Funktioner
          </p>
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(24px, 4vw, 38px)',
            fontWeight: 800, letterSpacing: '-1px',
            color: '#f1f5f9', marginBottom: 56,
          }}>
            Allt du behöver, inget du inte behöver
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {features.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </section>

        {/* ── CTA bottom ── */}
        <section style={{
          padding: 'clamp(64px, 10vw, 110px) 24px',
          textAlign: 'center',
          position: 'relative',
        }}>
          {/* Glow behind CTA */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600, height: 300, borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <p style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 16 }}>
            Kom igång idag
          </p>
          <h2 style={{
            fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900,
            letterSpacing: '-1px', color: '#f1f5f9', marginBottom: 16,
          }}>
            Redo att ta kontrollen?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, marginBottom: 40, maxWidth: 400, margin: '0 auto 40px' }}>
            Gratis att använda. Kom igång på under en minut.
          </p>
          <Link href="/signup" style={{
            display: 'inline-block', padding: '16px 44px', borderRadius: 12,
            fontSize: 17, fontWeight: 700, color: '#fff',
            textDecoration: 'none',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 0 50px rgba(99,102,241,0.5), 0 2px 12px rgba(0,0,0,0.4)',
            position: 'relative',
          }}>
            Skapa konto gratis
          </Link>
        </section>

        {/* ── Footer ── */}
        <footer style={{
          textAlign: 'center', padding: '24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          fontSize: 13, color: 'rgba(255,255,255,0.25)',
        }}>
          💜 Mony — Koll på kassan, varje dag
        </footer>
      </div>

      {/* Pulse animation for the live dot */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
