'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, TrendingDown, TrendingUp, RefreshCw, Tag, User, LogOut, X, ShoppingBag } from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import AddTransactionModal from '@/components/budget/AddTransactionModal'

const mainNav = [
  { href: '/', label: 'Översikt', icon: BarChart2 },
  { href: '/utgifter', label: 'Utgifter', icon: TrendingDown },
  { href: '/intakter', label: 'Intäkter', icon: TrendingUp },
  { href: '/aterkommande', label: 'Återkommande', icon: RefreshCw },
  { href: '/vinted', label: 'Vinted & Tradera', icon: ShoppingBag },
  { href: '/kategorier', label: 'Kategorier', icon: Tag },
]

const personNav = [
  { href: '/nenlil', label: 'Nenlil', color: '#a78bfa' },
  { href: '/nathalie', label: 'Nathalie', color: '#34d399' },
]

interface SidebarProps {
  userEmail: string
  householdName: string
  inviteCode: string
  onClose?: () => void
}

export default function Sidebar({ userEmail, householdName, inviteCode, onClose }: SidebarProps) {
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
    <aside
      className="flex flex-col h-full relative"
      style={{ backgroundColor: '#1e1b4b', width: 220, flexShrink: 0 }}
    >
      {/* Close button — mobile only */}
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Stäng meny"
          className="absolute right-3 top-3 rounded-lg p-1.5 text-indigo-300 hover:text-white hover:bg-indigo-800 md:hidden"
        >
          <X size={18} />
        </button>
      )}

      {/* Logo */}
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💜</span>
          <span style={{ color: '#e0e7ff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}>
            Budget
          </span>
        </div>
      </div>

      {/* Quick-add button */}
      <div className="px-3 pb-4">
        <AddTransactionModal fullWidth />
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {mainNav.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link key={href} href={href} style={linkStyle(isActive)} onClick={() => onClose?.()}>
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
            <Link key={href} href={href} style={linkStyle(isActive)} onClick={() => onClose?.()}>
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

      {/* Household + user + logout */}
      <div className="mx-3 mb-4 px-3 py-3 rounded-lg" style={{ backgroundColor: '#312e81' }}>
        {householdName && (
          <div style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #4338ca' }}>
            <p style={{ color: '#818cf8', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
              Hushåll
            </p>
            <p style={{ color: '#e0e7ff', fontSize: 13, fontWeight: 600 }}>{householdName}</p>
            {inviteCode && (
              <p style={{ color: '#818cf8', fontSize: 11, marginTop: 2, fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                Kod: {inviteCode}
              </p>
            )}
          </div>
        )}
        <p style={{ color: '#818cf8', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
          Inloggad som
        </p>
        <p style={{ color: '#e0e7ff', fontSize: 11, marginBottom: 10, wordBreak: 'break-all' }}>
          {userEmail}
        </p>
        <form action={signOut}>
          <button
            type="submit"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: '1px solid #4338ca',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 12,
              color: '#a5b4fc',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <LogOut size={12} />
            Logga ut
          </button>
        </form>
      </div>
    </aside>
  )
}
