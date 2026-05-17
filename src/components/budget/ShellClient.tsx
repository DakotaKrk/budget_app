'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from '@/components/budget/Sidebar'

interface Props {
  userEmail: string
  householdName: string
  inviteCode: string
  children: React.ReactNode
}

export default function ShellClient({ userEmail, householdName, inviteCode, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Backdrop — mobile only, closes drawer on tap */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar — fixed drawer on mobile, static column on md+ */}
      <div
        className={[
          'fixed inset-y-0 left-0 z-50 flex-shrink-0',
          'transition-transform duration-200 ease-in-out',
          'md:relative md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <Sidebar
          userEmail={userEmail}
          householdName={householdName}
          inviteCode={inviteCode}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content area */}
      <main className="flex-1 min-w-0 overflow-auto" style={{ backgroundColor: '#0d0d1b' }}>
        {/* Mobile-only top bar */}
        <div className="sticky top-0 z-30 flex items-center gap-3 md:hidden"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            backgroundColor: 'rgba(13,13,27,0.85)',
            backdropFilter: 'blur(12px)',
            padding: '12px 16px',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Öppna meny"
            className="rounded-lg p-1.5"
            style={{ color: '#a5b4fc', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Menu size={20} />
          </button>
          <span style={{
            fontFamily: 'var(--font-space-grotesk)',
            color: '#c4b5fd',
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: '-0.3px',
          }}>
            💜 Mony
          </span>
        </div>

        {children}
      </main>
    </div>
  )
}
