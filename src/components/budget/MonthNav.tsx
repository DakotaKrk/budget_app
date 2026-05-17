'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function addMonths(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatLabel(month: string): string {
  const [y, m] = month.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })
}

export default function MonthNav({ month }: { month: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const today = new Date().toISOString().slice(0, 7)

  function navigate(delta: number) {
    const next = addMonths(month, delta)
    const params = new URLSearchParams(searchParams.toString())
    params.set('month', next)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate(-1)}
        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
        style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#c4b5fd' }}
      >
        <ChevronLeft size={16} />
      </button>
      <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.75)', minWidth: 130, textAlign: 'center' }}>
        {formatLabel(month)}
      </span>
      <button
        onClick={() => navigate(1)}
        disabled={month >= today}
        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-30"
        style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#c4b5fd' }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
