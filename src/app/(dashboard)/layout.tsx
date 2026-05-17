import Sidebar from '@/components/budget/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto" style={{ backgroundColor: '#f8fafc' }}>
        {children}
      </main>
    </div>
  )
}
