export interface CategoryMeta {
  name: string
  icon: string
  color: string
  type: 'income' | 'expense'
}

export const CATEGORIES: CategoryMeta[] = [
  // Income
  { name: 'Lön',           icon: '💼', color: '#6366f1', type: 'income' },
  { name: 'Secondhand',    icon: '👗', color: '#10b981', type: 'income' },
  { name: 'Återbetalning', icon: '🏦', color: '#a855f7', type: 'income' },
  { name: 'Övrigt inkomst',icon: '🎁', color: '#f59e0b', type: 'income' },
  // Expense
  { name: 'Mat & Dryck',      icon: '🛒', color: '#ef4444', type: 'expense' },
  { name: 'Hyra & Bostad',    icon: '🏠', color: '#6366f1', type: 'expense' },
  { name: 'Transport',        icon: '🚌', color: '#f59e0b', type: 'expense' },
  { name: 'Nöje & Fritid',    icon: '🎭', color: '#a855f7', type: 'expense' },
  { name: 'Kläder',           icon: '👕', color: '#ec4899', type: 'expense' },
  { name: 'Hälsa',            icon: '💊', color: '#10b981', type: 'expense' },
  { name: 'Prenumerationer',  icon: '📱', color: '#818cf8', type: 'expense' },
  { name: 'Övrigt utgift',    icon: '📦', color: '#94a3b8', type: 'expense' },
]

export function getCategoryMeta(
  name: string,
  type: 'income' | 'expense',
): CategoryMeta {
  return (
    CATEGORIES.find(c => c.name === name && c.type === type) ??
    CATEGORIES.find(c => c.name === name) ?? {
      name,
      icon: type === 'income' ? '💸' : '📦',
      color: type === 'income' ? '#10b981' : '#94a3b8',
      type,
    }
  )
}
