import PageHeader from '@/components/budget/PageHeader'
import LoanClient from '@/components/budget/LoanClient'

export default function LanPage() {
  return (
    <div className="px-4 py-5 sm:px-9 sm:py-8">
      <PageHeader title="Lån" />
      <LoanClient />
    </div>
  )
}
