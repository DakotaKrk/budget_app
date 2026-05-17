export interface CategoryMeta {
  name: string
  /** Lucide icon component name, e.g. 'Briefcase' */
  icon: string
  color: string
  type: 'income' | 'expense'
}

export const CATEGORIES: CategoryMeta[] = [
  // ── Income ──────────────────────────────────────────────────────────────
  { name: 'Lön',              icon: 'Briefcase',        color: '#6366f1', type: 'income' },
  { name: 'Pension',          icon: 'Landmark',         color: '#8b5cf6', type: 'income' },
  { name: 'Vinted/Tradera',   icon: 'Tag',              color: '#10b981', type: 'income' },
  { name: 'Secondhand',       icon: 'ShoppingBag',      color: '#14b8a6', type: 'income' },
  { name: 'Återbetalning',    icon: 'RotateCcw',        color: '#a855f7', type: 'income' },
  { name: 'Övrigt inkomst',   icon: 'CircleDollarSign', color: '#f59e0b', type: 'income' },

  // ── Expense ─────────────────────────────────────────────────────────────
  { name: 'Mat & Dryck',        icon: 'ShoppingCart',     color: '#ef4444', type: 'expense' },
  { name: 'Restaurang & Café',  icon: 'UtensilsCrossed',  color: '#f97316', type: 'expense' },
  { name: 'Hyra & Bostad',      icon: 'Home',             color: '#6366f1', type: 'expense' },
  { name: 'El',                 icon: 'Zap',              color: '#eab308', type: 'expense' },
  { name: 'Vatten',             icon: 'Droplets',         color: '#06b6d4', type: 'expense' },
  { name: 'Bredband',           icon: 'Wifi',             color: '#3b82f6', type: 'expense' },
  { name: 'Telefoni',           icon: 'Phone',            color: '#8b5cf6', type: 'expense' },
  { name: 'Transport',          icon: 'Car',              color: '#f59e0b', type: 'expense' },
  { name: 'Bensin',             icon: 'Fuel',             color: '#d97706', type: 'expense' },
  { name: 'Nöje & Fritid',      icon: 'Music',            color: '#a855f7', type: 'expense' },
  { name: 'Kläder',             icon: 'Shirt',            color: '#ec4899', type: 'expense' },
  { name: 'Hälsa',              icon: 'HeartPulse',       color: '#10b981', type: 'expense' },
  { name: 'Prenumerationer',    icon: 'Tv',               color: '#818cf8', type: 'expense' },
  { name: 'Studielån',          icon: 'GraduationCap',    color: '#0ea5e9', type: 'expense' },
  { name: 'Försäkring privat',  icon: 'Shield',           color: '#64748b', type: 'expense' },
  { name: 'Försäkring djur',    icon: 'PawPrint',         color: '#a16207', type: 'expense' },
  { name: 'Barn & Familj',      icon: 'Baby',             color: '#f472b6', type: 'expense' },
  { name: 'Övrigt utgift',      icon: 'Package',          color: '#94a3b8', type: 'expense' },
]

export function getCategoryMeta(
  name: string,
  type: 'income' | 'expense',
): CategoryMeta {
  return (
    CATEGORIES.find(c => c.name === name && c.type === type) ??
    CATEGORIES.find(c => c.name === name) ?? {
      name,
      icon: type === 'income' ? 'CircleDollarSign' : 'Package',
      color: type === 'income' ? '#10b981' : '#94a3b8',
      type,
    }
  )
}
