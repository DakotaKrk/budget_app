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
    <div className="px-4 py-5 sm:px-9 sm:py-8">
      <div className="flex items-center justify-between mb-6 sm:mb-7">
        <PageHeader title="Intäkter" />
        <Suspense>
          <MonthNav month={month} />
        </Suspense>
      </div>
      <TransactionPageClient type="income" month={month} />
    </div>
  )
}
