import { getCurrentMonth } from '@/lib/utils'
import PageHeader from '@/components/budget/PageHeader'
import PersonBudgetClient from '@/components/budget/PersonBudgetClient'

interface Props {
  searchParams: Promise<{ month?: string }>
}

export default async function NathaliePage({ searchParams }: Props) {
  const { month } = await searchParams
  const activeMonth = month ?? getCurrentMonth()

  return (
    <div style={{ padding: '32px 32px' }}>
      <PageHeader
        title="Nathalie"
        subtitle="Personliga kostnader per månad"
        showMonthNav={false}
      />
      <PersonBudgetClient
        person="nathalie"
        month={activeMonth}
        accentColor="#34d399"
        lightBg="#ecfdf5"
      />
    </div>
  )
}
