'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, TrendingDown, TrendingUp, RefreshCw, Tag, User } from 'lucide-react'

const mainNav = [
  { href: '/', label: 'Översikt', icon: BarChart2 },
  { href: '/utgifter', label: 'Utgifter', icon: TrendingDown },
  { href: '/intakter', label: 'Intäkter', icon: TrendingUp },
  { href: '/aterkommande', label: 'Återkommande', icon: RefreshCw },
  { href: '/kategorier', label: 'Kategorier', icon: Tag },
]

const personNav = [
  { href: '/nenlil', label: 'Nenlil', color: '#a78bfa' },
  { href: '/nathalie', label: 'Nathalie', color: '#34d399' },
]

export default function Sidebar() {
  const pathname = usePathname()

  const linkStyle = (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    borderRadius: 8,
    textDecoration: 'none',
    backgroundColor: isActive ? '#312e81' : 'transparent',
    color: isActive ? '#e0e7ff' : '#a5b4fc',
    fontWeight: isActive ? 600 : 400,
    fontSize: 14,
    borderLeft: `3px solid ${isActive ? '#818cf8' : 'transparent'}`,
    transition: 'all 0.15s ease',
  })

  return (
    <aside className="flex flex-col h-full" style={{ backgroundColor: '#1e1b4b', width: 220, flexShrink: 0 }}>
      {/* Logo */}
      <div className="px-5 pt-8 pb-6">
        <div className="flex items-center gap-2">
          <span className="text-xl">💜</span>
          <span style={{ color: '#e0e7ff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}>
            Budget
          </span>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {mainNav.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link key={href} href={href} style={linkStyle(isActive)}>
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </Link>
          )
        })}

        {/* Personal sections */}
        <div style={{ marginTop: 20, marginBottom: 6, padding: '0 4px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Personligt
          </p>
        </div>
        {personNav.map(({ href, label, color }) => {
          const isActive = pathname === href
          return (
            <Link key={href} href={href} style={linkStyle(isActive)}>
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: color + '33',
                  border: `2px solid ${color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <User size={10} strokeWidth={2.5} style={{ color }} />
              </span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom hint */}
      <div className="mx-3 mb-6 px-3 py-3 rounded-lg" style={{ backgroundColor: '#312e81' }}>
        <p style={{ color: '#818cf8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
          Sparas lokalt
        </p>
        <p style={{ color: '#e0e7ff', fontSize: 12 }}>data/budget.json</p>
      </div>
    </aside>
  )
}
