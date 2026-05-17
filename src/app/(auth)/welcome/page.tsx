import Link from 'next/link'

export default function WelcomePage() {
  const feature = (icon: string, text: string) => (
    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        width: 28, height: 28, borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0,
      }}>{icon}</span>
      <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>{text}</span>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 32px', backgroundColor: '#fff',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>💜</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#1e1b4b', letterSpacing: '-0.5px' }}>Mony</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login" style={{
            padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500,
            color: '#6366f1', textDecoration: 'none', border: '1px solid #e0e7ff',
            backgroundColor: '#fff',
          }}>
            Logga in
          </Link>
          <Link href="/signup" style={{
            padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            color: '#fff', textDecoration: 'none', backgroundColor: '#6366f1',
            boxShadow: '0 1px 4px rgba(99,102,241,0.3)',
          }}>
            Kom igång
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        padding: '80px 32px 90px',
        textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 100,
          padding: '6px 14px', marginBottom: 28,
        }}>
          <span style={{ fontSize: 14 }}>💜</span>
          <span style={{ fontSize: 12, color: '#c7d2fe', fontWeight: 600, letterSpacing: '0.3px' }}>
            Din smarta budgetapp
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 900,
          color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.1,
          maxWidth: 680, margin: '0 auto 20px',
        }}>
          Få koll på vart pengarna tar vägen
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2.5vw, 19px)', color: 'rgba(255,255,255,0.7)',
          maxWidth: 520, lineHeight: 1.7, margin: '0 auto 40px',
        }}>
          Mony hjälper dig följa dina inkomster och utgifter — och fatta smarta beslut varje månad.
        </p>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 52 }}>
          <Link href="/signup" style={{
            padding: '14px 32px', borderRadius: 10, fontSize: 16, fontWeight: 700,
            color: '#1e1b4b', textDecoration: 'none', backgroundColor: '#fff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }}>
            Kom igång gratis
          </Link>
          <Link href="/login" style={{
            padding: '14px 32px', borderRadius: 10, fontSize: 16, fontWeight: 600,
            color: '#fff', textDecoration: 'none',
            backgroundColor: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
          }}>
            Logga in
          </Link>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            ['✓', 'Eget eller gemensamt hushåll'],
            ['✓', 'Kategorier & återkommande'],
            ['✓', 'Översikt månad för månad'],
          ].map(([icon, text]) => feature(icon, text))}
        </div>
      </section>

      {/* Features grid */}
      <section style={{ padding: '72px 32px', maxWidth: 960, margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: 48, letterSpacing: '-0.5px' }}>
          Allt du behöver, inget du inte behöver
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24,
        }}>
          {[
            { icon: '📊', title: 'Månadsöversikt', desc: 'Se inkomster, utgifter och resultat för varje månad på ett ögonkast.' },
            { icon: '🔁', title: 'Återkommande', desc: 'Markera fasta kostnader och se vad som äter upp din budget varje månad.' },
            { icon: '👗', title: 'Vinted & Tradera', desc: 'Håll koll på vad du tjänar på andrahandsförsäljning.' },
            { icon: '🏠', title: 'Gemensamt hushåll', desc: 'Bjud in din partner och håll koll på ekonomin tillsammans.' },
            { icon: '📱', title: 'Prenumerationer', desc: 'Se över dina streamingtjänster och spara pengar varje månad.' },
            { icon: '📈', title: 'Trender', desc: 'Jämför månader och se om du rör dig åt rätt håll.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{
              backgroundColor: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
              padding: '24px 20px',
            }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{title}</p>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'linear-gradient(135deg, #312e81, #4338ca)',
        padding: '64px 32px', textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
          Redo att ta kontrollen?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, marginBottom: 32 }}>
          Gratis att använda. Kom igång på under en minut.
        </p>
        <Link href="/signup" style={{
          display: 'inline-block', padding: '14px 36px', borderRadius: 10,
          fontSize: 16, fontWeight: 700, color: '#1e1b4b',
          textDecoration: 'none', backgroundColor: '#fff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}>
          Skapa konto gratis
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '24px', fontSize: 13,
        color: '#94a3b8', borderTop: '1px solid #e2e8f0', backgroundColor: '#fff',
      }}>
        💜 Mony — Koll på kassan, varje dag
      </footer>
    </div>
  )
}
