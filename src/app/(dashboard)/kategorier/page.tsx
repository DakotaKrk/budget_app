import PageHeader from '@/components/budget/PageHeader'
import CategoriesClient from '@/components/budget/CategoriesClient'

export default function KategorierPage() {
  return (
    <div className="px-4 py-5 sm:px-9 sm:py-8">
      <PageHeader title="Kategorier" />
      <CategoriesClient />
    </div>
  )
}
