export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 20% 40%, rgba(99,102,241,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(139,92,246,0.1) 0%, transparent 55%), #07071a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      {children}
    </div>
  )
}
