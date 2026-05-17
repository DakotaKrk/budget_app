'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BarChart2, TrendingDown, TrendingUp, RefreshCw, Tag, LogOut, X, ShoppingBag, Smartphone, Landmark } from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import AddTransactionModal from '@/components/budget/AddTransactionModal'

const mainNav = [
  { href: '/', label: 'Översikt', icon: BarChart2 },
  { href: '/utgifter', label: 'Utgifter', icon: TrendingDown },
  { href: '/intakter', label: 'Intäkter', icon: TrendingUp },
  { href: '/aterkommande', label: 'Återkommande', icon: RefreshCw },
  { href: '/vinted', label: 'Vinted & Tradera', icon: ShoppingBag },
  { href: '/prenumerationer', label: 'Prenumerationer', icon: Smartphone },
  { href: '/lan', label: 'Lån', icon: Landmark },
  { href: '/kategorier', label: 'Kategorier', icon: Tag },
]

interface SidebarProps {
  userEmail: string
  householdName: string
  inviteCode: string
  onClose?: () => void
}

export default function Sidebar({ userEmail, householdName, inviteCode, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDeleteAccount() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 5000)
      return
    }
    setDeleting(true)
    const res = await fetch('/api/account', { method: 'DELETE' })
    if (res.ok) {
      router.push('/welcome')
      router.refresh()
    } else {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

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
          <span style={{ fontSize: 20 }}>💜</span>
          <span style={{
            fontFamily: 'var(--font-space-grotesk)',
            color: '#c4b5fd',
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: '-0.5px',
          }}>
            Mony
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

        {/* Delete account */}
        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={deleting}
          style={{
            marginTop: 8,
            background: 'none',
            border: `1px solid ${confirmDelete ? '#ef4444' : 'transparent'}`,
            borderRadius: 6,
            padding: '5px 10px',
            fontSize: 11,
            color: confirmDelete ? '#fca5a5' : '#4338ca',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            transition: 'all 0.15s',
          }}
        >
          {deleting ? 'Raderar...' : confirmDelete ? '⚠️ Klicka igen för att bekräfta' : 'Radera mitt konto'}
        </button>
      </div>
    </aside>
  )
}
