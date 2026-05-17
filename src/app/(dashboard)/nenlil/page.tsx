import { getCurrentMonth } from '@/lib/utils'
import PageHeader from '@/components/budget/PageHeader'
import PersonBudgetClient from '@/components/budget/PersonBudgetClient'

interface Props {
  searchParams: Promise<{ month?: string }>
}

export default async function NenlilPage({ searchParams }: Props) {
  const { month } = await searchParams
  const activeMonth = month ?? getCurrentMonth()

  return (
    <div style={{ padding: '32px 32px' }}>
      <PageHeader
        title="Nenlil"
        subtitle="Personliga kostnader per månad"
        showMonthNav={false}
      />
      <PersonBudgetClient
        person="nenlil"
        month={activeMonth}
        accentColor="#a78bfa"
        lightBg="#f5f3ff"
      />
    </div>
  )
}
