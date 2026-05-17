import PageHeader from '@/components/budget/PageHeader'
import RecurringClient from '@/components/budget/RecurringClient'

export default function AterkommandePage() {
  return (
    <div style={{ padding: '32px 36px' }}>
      <PageHeader title="Återkommande" />
      <RecurringClient />
    </div>
  )
}
