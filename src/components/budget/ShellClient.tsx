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
      <main className="flex-1 min-w-0 overflow-auto" style={{ backgroundColor: '#f8fafc' }}>
        {/* Mobile-only top bar with hamburger + logo */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Öppna meny"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 active:bg-slate-200"
          >
            <Menu size={20} />
          </button>
          <span style={{ color: '#1e1b4b', fontWeight: 700, fontSize: 16, letterSpacing: '-0.2px' }}>
            💜 Budget
          </span>
        </div>

        {children}
      </main>
    </div>
  )
}
