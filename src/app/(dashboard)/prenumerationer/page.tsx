import PageHeader from '@/components/budget/PageHeader'
import SubscriptionsClient from '@/components/budget/SubscriptionsClient'

export default function PrenumerationerPage() {
  return (
    <div className="px-4 py-5 sm:px-9 sm:py-8">
      <PageHeader title="Prenumerationskollen" />
      <SubscriptionsClient />
    </div>
  )
}
