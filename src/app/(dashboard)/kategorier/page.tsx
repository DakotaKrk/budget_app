import PageHeader from '@/components/budget/PageHeader'
import CategoriesClient from '@/components/budget/CategoriesClient'

export default function KategorierPage() {
  return (
    <div style={{ padding: '32px 36px' }}>
      <PageHeader title="Kategorier" />
      <CategoriesClient />
    </div>
  )
}
