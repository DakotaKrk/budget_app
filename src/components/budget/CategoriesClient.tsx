'use client'

import { CATEGORIES, CategoryMeta } from '@/lib/categories'
import CategoryIcon from '@/components/budget/CategoryIcon'

export default function CategoriesClient() {
  const expenses = CATEGORIES.filter(c => c.type === 'expense')
  const income   = CATEGORIES.filter(c => c.type === 'income')

  const card: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    padding: 24,
  }

  function renderList(items: CategoryMeta[], type: 'income' | 'expense') {
    return (
      <div>
        {items.map((cat, i) => (
          <div
            key={cat.name}
            className="flex items-center gap-2.5 py-2.5"
            style={{ borderBottom: i < items.length - 1 ? '1px solid #f1f5f9' : 'none' }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: cat.color + '22',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CategoryIcon name={cat.icon} size={15} color={cat.color} />
            </div>
            <span style={{ flex: 1, fontSize: 14, color: '#0f172a', fontWeight: 500 }}>
              {cat.name}
            </span>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: cat.color,
                flexShrink: 0,
              }}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div style={card}>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
          Utgiftskategorier
        </p>
        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
          {expenses.length} kategorier
        </p>
        {renderList(expenses, 'expense')}
      </div>
      <div style={card}>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
          Intäktskategorier
        </p>
        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
          {income.length} kategorier
        </p>
        {renderList(income, 'income')}
      </div>
    </div>
  )
}
