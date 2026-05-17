import PageHeader from '@/components/budget/PageHeader'
import RecurringClient from '@/components/budget/RecurringClient'

export default function AterkommandePage() {
  return (
    <div className="px-4 py-5 sm:px-9 sm:py-8">
      <PageHeader title="Återkommande" />
      <RecurringClient />
    </div>
  )
}
