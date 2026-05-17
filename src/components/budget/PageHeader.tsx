import { Suspense } from 'react'
import MonthNav from './MonthNav'

interface PageHeaderProps {
  title: string
  subtitle?: string
  month?: string
  showMonthNav?: boolean
}

export default function PageHeader({ title, subtitle, month, showMonthNav = false }: PageHeaderProps) {
  return (
    <div
      className="flex items-center justify-between px-0 pb-7"
    >
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{subtitle}</p>
        )}
      </div>
      {showMonthNav && month && (
        <Suspense>
          <MonthNav month={month} />
        </Suspense>
      )}
    </div>
  )
}
