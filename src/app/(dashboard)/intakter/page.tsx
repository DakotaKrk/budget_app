import { Suspense } from 'react'
import { getCurrentMonth } from '@/lib/utils'
import PageHeader from '@/components/budget/PageHeader'
import MonthNav from '@/components/budget/MonthNav'
import TransactionPageClient from '@/components/budget/TransactionPageClient'

interface Props { searchParams: Promise<{ month?: string }> }

export default async function IntakterPage({ searchParams }: Props) {
  const { month: qMonth } = await searchParams
  const month = qMonth ?? getCurrentMonth()

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <PageHeader title="Intäkter" />
        <Suspense>
          <MonthNav month={month} />
        </Suspense>
      </div>
      <TransactionPageClient type="income" month={month} />
    </div>
  )
}
