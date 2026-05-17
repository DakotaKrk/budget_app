import PageHeader from '@/components/budget/PageHeader'
import VintedClient from '@/components/budget/VintedClient'

export default function VintedPage() {
  return (
    <div className="px-4 py-5 sm:px-9 sm:py-8">
      <PageHeader title="Vinted & Tradera" />
      <VintedClient />
    </div>
  )
}
